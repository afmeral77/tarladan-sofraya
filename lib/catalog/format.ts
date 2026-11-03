import { SUPABASE_URL } from "@/lib/supabase/config";
import type { ProductUnit } from "@/lib/catalog/types";

export const PRODUCT_IMAGE_BUCKET = "product-images";
export const MAX_PRODUCT_IMAGE_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

const numberFormat = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 });
const priceFormat = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
});

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatPrice(value: number, unit: ProductUnit): string {
  return `${priceFormat.format(value)} / ${unitLabel(unit)}`;
}

export function formatCurrency(value: number): string {
  return priceFormat.format(value);
}

export function unitLabel(unit: ProductUnit): string {
  switch (unit) {
    case "kg":
      return "kg";
    case "ton":
      return "ton";
    case "crate":
      return "kasa";
    case "piece":
      return "adet";
    default:
      return "birim";
  }
}

export function formatQuantity(value: number, unit: ProductUnit): string {
  return `${formatNumber(value)} ${unitLabel(unit)}`;
}

export function formatDate(value: string | null): string {
  if (!value) return "Tarih belirtilmedi";
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return "Tarih belirtilmedi";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeZone: "UTC" }).format(date);
}

export function productImageUrl(path: string | null): string | null {
  if (!path || !/^[0-9a-f-]{36}\/[A-Za-z0-9][A-Za-z0-9._-]{0,158}\.(jpg|jpeg|png|webp)$/i.test(path)) {
    return null;
  }
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  return `${SUPABASE_URL}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${encodedPath}`;
}

export function productHref(slug: string, id: string): string {
  return `/urunler/${encodeURIComponent(slug)}-${id}`;
}

export function producerHref(userId: string): string {
  return `/ureticiler/${encodeURIComponent(userId)}`;
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
