"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PRODUCT_IMAGE_BUCKET } from "@/lib/catalog/format";
import type { ProductStatus, ProductUnit } from "@/lib/catalog/types";

export type ProductActionState = {
  status: "idle" | "error";
  message: string;
};

export const initialProductActionState: ProductActionState = {
  status: "idle",
  message: "",
};

const units = new Set<ProductUnit>(["kg", "ton", "crate", "piece"]);
const statuses = new Set<ProductStatus>(["draft", "active", "paused"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const imagePathPattern = /^[0-9a-f-]{36}\/[A-Za-z0-9][A-Za-z0-9._-]{0,158}\.(jpg|jpeg|png|webp)$/i;

function textField(formData: FormData, name: string, maxLength: number): string | null {
  const value = formData.get(name);
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  return normalized.length <= maxLength ? normalized : null;
}

function numberField(formData: FormData, name: string, required: boolean): number | null | undefined {
  const value = formData.get(name);
  if (typeof value !== "string" || value.trim() === "") return required ? undefined : null;
  if (value.length > 24) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function validDate(value: string): string | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value ? null : value;
}

function error(message: string): ProductActionState {
  return { status: "error", message };
}

export async function saveProduct(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (typeof userId !== "string" || !uuidPattern.test(userId)) {
    redirect("/giris?next=%2Furetici%2Furunler");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.role !== "producer") return error("Bu işlem yalnız üretici hesabıyla yapılabilir.");

  const { data: producer } = await supabase
    .from("producers")
    .select("verification_status,is_public")
    .eq("user_id", userId)
    .maybeSingle();
  if (!producer) redirect("/kayit/profil");

  const productIdValue = formData.get("product_id");
  const productId = typeof productIdValue === "string" && productIdValue ? productIdValue : null;
  if (productId && !uuidPattern.test(productId)) return error("Ürün bilgisi geçerli değil.");

  const name = textField(formData, "name", 100);
  const description = textField(formData, "description", 2000);
  const qualityGrade = textField(formData, "quality_grade", 80);
  const categoryId = textField(formData, "category_id", 36);
  const originCity = textField(formData, "origin_city", 100);
  const originRegion = textField(formData, "origin_region", 100);
  const harvestNotes = textField(formData, "harvest_notes", 1000);
  const unitValue = formData.get("unit");
  const statusValue = formData.get("status");

  if (name === null || description === null || qualityGrade === null || categoryId === null || originCity === null || originRegion === null || harvestNotes === null) {
    return error("Metin alanlarından biri izin verilen uzunluğu aşıyor.");
  }
  if (name.length < 2 || !uuidPattern.test(categoryId)) return error("Ürün adı ve kategori seçimi gereklidir.");
  if (typeof unitValue !== "string" || !units.has(unitValue as ProductUnit)) return error("Ürün birimini kontrol edin.");
  const unit = unitValue as ProductUnit;

  const price = numberField(formData, "price_per_unit", true);
  const minimumOrder = numberField(formData, "minimum_order_qty", true);
  const availableQuantity = numberField(formData, "available_quantity", true);
  const estimatedQuantity = numberField(formData, "estimated_quantity", false);
  const harvestQuantity = numberField(formData, "harvest_quantity", false);
  if (price === undefined || price === null || minimumOrder === undefined || minimumOrder === null || availableQuantity === undefined || availableQuantity === null || estimatedQuantity === undefined || harvestQuantity === undefined) {
    return error("Fiyat ve miktar alanlarına sıfır veya pozitif geçerli sayılar girin.");
  }
  if (minimumOrder <= 0) return error("Minimum sipariş miktarı sıfırdan büyük olmalıdır.");

  const harvestDateValue = textField(formData, "harvest_date", 10);
  if (harvestDateValue === null) return error("Hasat tarihini kontrol edin.");
  const harvestDate = validDate(harvestDateValue);
  if (harvestDateValue && !harvestDate) return error("Hasat tarihi geçerli bir takvim günü olmalıdır.");

  const { data: category } = await supabase
    .from("product_categories")
    .select("id")
    .eq("id", categoryId)
    .eq("is_active", true)
    .maybeSingle();
  if (!category) return error("Bu ürün kategorisi artık kullanılamıyor.");

  const nextImageValue = formData.get("image_path");
  const nextImagePath = typeof nextImageValue === "string" && nextImageValue.trim() ? nextImageValue.trim() : null;
  if (nextImagePath && (!imagePathPattern.test(nextImagePath) || !nextImagePath.startsWith(`${userId}/`))) {
    return error("Ürün fotoğrafı hesabınıza ait geçerli bir görsel olmalıdır.");
  }
  const removeImage = formData.get("remove_image") === "true";
  const finalImagePath = removeImage ? null : nextImagePath;

  let previousImagePath: string | null = null;
  if (productId) {
    const { data: existing } = await supabase
      .from("products")
      .select("image_path")
      .eq("id", productId)
      .eq("producer_user_id", userId)
      .maybeSingle();
    if (!existing) return error("Ürün bulunamadı veya bu hesabın yönetiminde değil.");
    previousImagePath = existing.image_path;
  }

  const rawStatus = typeof statusValue === "string" && statuses.has(statusValue as ProductStatus)
    ? statusValue as ProductStatus
    : "draft";
  const canPublish = producer.verification_status === "approved" && producer.is_public;
  const status: ProductStatus = rawStatus === "active" && !canPublish ? "draft" : rawStatus;

  const { data: savedId, error: saveError } = await supabase.rpc("save_producer_product", {
    p_product_id: productId,
    p_category_id: categoryId,
    p_name: name,
    p_description: description || null,
    p_quality_grade: qualityGrade || null,
    p_price_per_unit: price,
    p_unit: unit,
    p_minimum_order_qty: minimumOrder,
    p_origin_city: originCity || null,
    p_origin_region: originRegion || null,
    p_status: status,
    p_image_path: finalImagePath,
    p_available_quantity: availableQuantity,
    p_estimated_quantity: estimatedQuantity,
    p_harvest_date: harvestDate,
    p_harvest_quantity: harvestQuantity,
    p_harvest_notes: harvestNotes || null,
  });

  if (saveError || !savedId) {
    return error("Ürün kaydedilemedi. Bilgileri kontrol edip tekrar deneyin.");
  }

  if (previousImagePath && previousImagePath !== finalImagePath && previousImagePath.startsWith(`${userId}/`)) {
    await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove([previousImagePath]);
  }

  revalidatePath("/urunler");
  revalidatePath("/uretici/urunler");
  revalidatePath(`/uretici/urunler/${savedId}/duzenle`);
  if (status === "active") revalidatePath(`/urunler`);
  if (status === "draft" && rawStatus === "active") {
    redirect("/uretici/urunler?durum=dogrulama-bekliyor");
  }
  redirect("/uretici/urunler?durum=kaydedildi");
}
