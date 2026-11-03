import { MAX_PRODUCT_IMAGE_BYTES, PRODUCT_IMAGE_MIME_TYPES } from "@/lib/catalog/format";

const signatures: Record<(typeof PRODUCT_IMAGE_MIME_TYPES)[number], (bytes: Uint8Array) => boolean> = {
  "image/jpeg": (bytes) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  "image/png": (bytes) => bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10",
  "image/webp": (bytes) =>
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP",
};

export async function getValidatedProductImageExtension(file: File): Promise<string | null> {
  if (file.size <= 0 || file.size > MAX_PRODUCT_IMAGE_BYTES) return null;
  if (!PRODUCT_IMAGE_MIME_TYPES.includes(file.type as (typeof PRODUCT_IMAGE_MIME_TYPES)[number])) return null;

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!signatures[file.type as keyof typeof signatures](bytes)) return null;

  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/png") return "png";
  return "webp";
}
