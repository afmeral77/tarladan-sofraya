"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { BadgeCheck, ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";
import { saveProduct, initialProductActionState } from "@/app/actions/products";
import { createClient } from "@/lib/supabase/client";
import { getValidatedProductImageExtension } from "@/lib/catalog/image-upload";
import { MAX_PRODUCT_IMAGE_BYTES, PRODUCT_IMAGE_BUCKET, PRODUCT_IMAGE_MIME_TYPES, productImageUrl } from "@/lib/catalog/format";
import type { CatalogProduct, ProductCategory } from "@/lib/catalog/types";

type Props = {
  categories: ProductCategory[];
  producerId: string;
  producerCanPublish: boolean;
  product?: CatalogProduct | null;
};

const unitOptions = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "ton", label: "Ton" },
  { value: "crate", label: "Kasa" },
  { value: "piece", label: "Adet" },
] as const;

const statusOptions = [
  { value: "draft", label: "Taslak" },
  { value: "active", label: "Yayında" },
  { value: "paused", label: "Duraklatıldı" },
] as const;

function toDateInput(value: string | null | undefined): string {
  return value?.slice(0, 10) ?? "";
}

export function ProductForm({ categories, producerId, producerCanPublish, product = null }: Props) {
  const [state, action, isPending] = useActionState(saveProduct, initialProductActionState);
  const [imagePath, setImagePath] = useState(product?.image_path ?? "");
  const [imagePreview, setImagePreview] = useState(productImageUrl(product?.image_path ?? null) ?? "");
  const [removeImage, setRemoveImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const uploadedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (state.status === "error") document.getElementById("product-save-error")?.focus();
  }, [state]);

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setUploadError("");
    if (!file) return;

    let extension: string | null;
    try {
      extension = await getValidatedProductImageExtension(file);
    } catch {
      setUploadError("Görsel dosyası okunamadı. Başka bir dosya seçip tekrar deneyin.");
      event.target.value = "";
      return;
    }
    if (!extension) {
      setUploadError(`Yalnız 5 MB’a kadar gerçek JPEG, PNG veya WebP görseller yüklenebilir.`);
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const client = createClient();
      const previousTemporaryPath = uploadedPathRef.current;
      if (previousTemporaryPath) {
        await client.storage.from(PRODUCT_IMAGE_BUCKET).remove([previousTemporaryPath]);
        uploadedPathRef.current = null;
        setImagePath("");
        setImagePreview("");
      }
      const objectPath = `${producerId}/${crypto.randomUUID()}.${extension}`;
      const { data, error } = await client.storage.from(PRODUCT_IMAGE_BUCKET).upload(objectPath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });
      if (error || !data?.path) {
        setUploadError("Fotoğraf yüklenemedi. Oturumunuzu ve bağlantınızı kontrol edip tekrar deneyin.");
        event.target.value = "";
        return;
      }
      uploadedPathRef.current = data.path;
      setImagePath(data.path);
      setImagePreview(client.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(data.path).data.publicUrl);
      setRemoveImage(false);
      event.target.value = "";
    } catch {
      setUploadError("Fotoğraf yüklenirken bağlantı hatası oluştu. Tekrar deneyebilirsiniz.");
      event.target.value = "";
    } finally {
      setIsUploading(false);
    }
  }

  async function clearImage() {
    setUploadError("");
    const temporaryPath = uploadedPathRef.current;
    try {
      if (temporaryPath) {
        const client = createClient();
        const { error } = await client.storage.from(PRODUCT_IMAGE_BUCKET).remove([temporaryPath]);
        if (error) {
          setUploadError("Geçici fotoğraf kaldırılamadı. Bağlantınızı kontrol edip tekrar deneyin.");
          return;
        }
        uploadedPathRef.current = null;
      }
      setImagePath("");
      setImagePreview("");
      setRemoveImage(Boolean(product?.image_path));
    } catch {
      setUploadError("Fotoğraf kaldırılırken bağlantı hatası oluştu. Tekrar deneyebilirsiniz.");
    }
  }

  const available = product?.inventory?.available_quantity;
  const estimated = product?.inventory?.estimated_quantity;
  const harvest = product?.harvest;
  const selectClass = "catalog-field";

  return (
    <form className="catalog-form" action={action}>
      <input type="hidden" name="product_id" value={product?.id ?? ""} />
      <input type="hidden" name="image_path" value={imagePath} />
      <input type="hidden" name="remove_image" value={removeImage ? "true" : "false"} />

      {state.status === "error" && <p id="product-save-error" className="catalog-form-alert" role="alert" tabIndex={-1}>{state.message}</p>}
      {uploadError && <p className="catalog-form-alert" role="alert">{uploadError}</p>}
      {!producerCanPublish && <p className="catalog-form-note"><BadgeCheck size={17} aria-hidden="true" /> Üretici profiliniz yönetici doğrulamasını bekliyor. Ürünü taslak olarak kaydedebilirsiniz; doğrulama tamamlanınca yayına alabilirsiniz.</p>}

      <div className="catalog-form-section">
        <div className="catalog-form-section-heading"><span>01 / ÜRÜN KİMLİĞİ</span><h2>Ürününüzü tanımlayın.</h2></div>
        <div className="catalog-form-grid">
          <label className={`${selectClass} catalog-field-wide`}>
            <span>Ürün adı <b>*</b></span>
            <input name="name" type="text" required minLength={2} maxLength={100} defaultValue={product?.name ?? ""} placeholder="Örn. Salkım domates" autoComplete="off" />
          </label>
          <label className={selectClass}>
            <span>Kategori <b>*</b></span>
            <select name="category_id" required defaultValue={product?.category_id ?? ""}>
              <option value="" disabled>Kategori seçin</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          <label className={selectClass}>
            <span>Kalite sınıfı</span>
            <input name="quality_grade" type="text" maxLength={80} defaultValue={product?.quality_grade ?? ""} placeholder="Örn. Sınıf I" />
          </label>
          <label className={`${selectClass} catalog-field-wide`}>
            <span>Ürün açıklaması</span>
            <textarea name="description" maxLength={2000} defaultValue={product?.description ?? ""} placeholder="Ürünün özelliklerini, yetiştirme biçimini ve alıcının bilmesi gerekenleri yazın." rows={4} />
          </label>
        </div>
      </div>

      <div className="catalog-form-section">
        <div className="catalog-form-section-heading"><span>02 / FOTOĞRAF</span><h2>Ürünün görünümünü ekleyin.</h2></div>
        <div className="catalog-upload-layout">
          <div className="catalog-upload-preview">
            {imagePreview ? <img src={imagePreview} alt="Yüklenen ürün fotoğrafının önizlemesi" /> : <div><ImagePlus size={30} strokeWidth={1.4} aria-hidden="true" /><span>Ürün görseli</span></div>}
          </div>
          <div className="catalog-upload-copy">
            <label className="catalog-upload-button">
              <Upload size={16} aria-hidden="true" />
              {isUploading ? "Yükleniyor…" : imagePreview ? "Fotoğrafı değiştir" : "Fotoğraf seç"}
              <input type="file" accept={PRODUCT_IMAGE_MIME_TYPES.join(",")} onChange={handleImageChange} disabled={isUploading} />
            </label>
            {imagePreview && <button type="button" className="catalog-remove-image" onClick={() => void clearImage()}><Trash2 size={15} aria-hidden="true" /> Fotoğrafı kaldır</button>}
            <p>JPEG, PNG veya WebP · En fazla {Math.round(MAX_PRODUCT_IMAGE_BYTES / (1024 * 1024))} MB. Görsel, hesabınıza özel klasöre yüklenir.</p>
          </div>
        </div>
      </div>

      <div className="catalog-form-section">
        <div className="catalog-form-section-heading"><span>03 / FİYAT VE STOK</span><h2>Alıcıya net bilgi verin.</h2></div>
        <div className="catalog-form-grid">
          <label className={selectClass}>
            <span>Birim fiyat (₺) <b>*</b></span>
            <input name="price_per_unit" type="number" min="0" step="0.01" required defaultValue={product?.price_per_unit ?? ""} inputMode="decimal" />
          </label>
          <label className={selectClass}>
            <span>Satış birimi <b>*</b></span>
            <select name="unit" required defaultValue={product?.unit ?? "kg"}>
              {unitOptions.map((unit) => <option value={unit.value} key={unit.value}>{unit.label}</option>)}
            </select>
          </label>
          <label className={selectClass}>
            <span>Minimum sipariş <b>*</b></span>
            <input name="minimum_order_qty" type="number" min="0.01" step="0.01" required defaultValue={product?.minimum_order_qty ?? 1} inputMode="decimal" />
          </label>
          <label className={selectClass}>
            <span>Mevcut stok <b>*</b></span>
            <input name="available_quantity" type="number" min="0" step="0.01" required defaultValue={available ?? 0} inputMode="decimal" />
          </label>
          <label className={selectClass}>
            <span>Tahmini üretim / gelecek stok</span>
            <input name="estimated_quantity" type="number" min="0" step="0.01" defaultValue={estimated ?? ""} inputMode="decimal" />
          </label>
          <label className={selectClass}>
            <span>İlan durumu</span>
            <select name="status" defaultValue={product?.status ?? (producerCanPublish ? "active" : "draft")}>
              {statusOptions.map((status) => <option key={status.value} value={status.value} disabled={status.value === "active" && !producerCanPublish}>{status.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="catalog-form-section">
        <div className="catalog-form-section-heading"><span>04 / KAYNAK VE HASAT</span><h2>Üretim bilgisini paylaşın.</h2></div>
        <div className="catalog-form-grid">
          <label className={selectClass}>
            <span>İl</span>
            <input name="origin_city" type="text" maxLength={100} defaultValue={product?.origin_city ?? ""} autoComplete="address-level2" placeholder="Örn. Antalya" />
          </label>
          <label className={selectClass}>
            <span>Bölge / ilçe</span>
            <input name="origin_region" type="text" maxLength={100} defaultValue={product?.origin_region ?? ""} placeholder="Örn. Kumluca" />
          </label>
          <label className={selectClass}>
            <span>Hasat tarihi</span>
            <input name="harvest_date" type="date" defaultValue={toDateInput(harvest?.harvest_date)} />
          </label>
          <label className={selectClass}>
            <span>Hasat tahmini miktarı</span>
            <input name="harvest_quantity" type="number" min="0" step="0.01" defaultValue={harvest?.estimated_quantity ?? ""} inputMode="decimal" />
          </label>
          <label className={`${selectClass} catalog-field-wide`}>
            <span>Hasat notu</span>
            <textarea name="harvest_notes" maxLength={1000} defaultValue={harvest?.notes ?? ""} placeholder="Tahmini hasat dönemi veya ürünle ilgili kısa not" rows={3} />
          </label>
        </div>
      </div>

      {!categories.length && <p className="catalog-form-alert" role="alert">Şu anda kullanılabilir kategori yok. Daha sonra tekrar deneyin.</p>}
      <div className="catalog-form-footer">
        <p>İlan, ürün ve stok bilgisi aynı kayıt akışında saklanır. Aktif ürünler yalnızca onaylı ve herkese açık üretici profillerinde görünür.</p>
        <button className="catalog-submit-button" type="submit" disabled={isPending || isUploading || !categories.length}>
          {isPending || isUploading ? <LoaderCircle className="catalog-spinner" size={16} aria-hidden="true" /> : null}
          {isPending ? "Kaydediliyor…" : product ? "Değişiklikleri kaydet" : "Ürünü kaydet"}
        </button>
      </div>
    </form>
  );
}
