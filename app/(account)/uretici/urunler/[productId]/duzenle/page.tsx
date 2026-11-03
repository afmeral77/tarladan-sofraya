import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/catalog/product-form";
import { isUuid } from "@/lib/catalog/format";
import { requireProducer } from "@/lib/catalog/producer-access";
import { getActiveCategories, getProducerProduct } from "@/lib/catalog/queries";

export const metadata: Metadata = {
  title: "Ürünü düzenle | Tarladan Sofraya",
  description: "Kendi ürün ilanınızın fiyat, stok ve hasat bilgilerini güncelleyin.",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ productId: string }> };

export default async function EditProducerProductPage({ params }: Props) {
  const { productId } = await params;
  if (!isUuid(productId)) notFound();
  const { userId, producer } = await requireProducer(`/uretici/urunler/${productId}/duzenle`);
  const [product, categories] = await Promise.all([
    getProducerProduct(userId, productId),
    getActiveCategories(),
  ]);
  if (!product) notFound();
  const canPublish = producer.verification_status === "approved" && producer.is_public;

  return (
    <main className="producer-manage-page">
      <header className="auth-topbar"><div className="container auth-topbar-inner"><Link className="brand" href="/" aria-label="Tarladan Sofraya ana sayfa"><img src="/logo.svg" width="218" height="50" alt="Tarladan Sofraya" /></Link><Link className="auth-home-link" href="/uretici/urunler"><ArrowLeft size={14} aria-hidden="true" /> Ürünlerime dön</Link></div></header>
      <div className="container producer-form-shell"><div className="producer-form-heading"><span className="eyebrow"><span className="eyebrow-dot" /> ÜRÜNÜ GÜNCELLE</span><h1>{product.name}</h1><p>Stok, fiyat ve hasat bilgilerini güncellediğinizde ürün kaydı tek işlemde yenilenir.</p></div><ProductForm categories={categories} producerId={userId} producerCanPublish={canPublish} product={product} /></div>
      <footer className="auth-footer container"><span>© {new Date().getFullYear()} Tarladan Sofraya</span><a href="https://appfabrika.com/" target="_blank" rel="noreferrer noopener">Bir Appfabrika ürünü</a></footer>
    </main>
  );
}
