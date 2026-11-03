import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/catalog/product-form";
import { requireProducer } from "@/lib/catalog/producer-access";
import { getActiveCategories } from "@/lib/catalog/queries";

export const metadata: Metadata = {
  title: "Yeni ürün ekle | Tarladan Sofraya",
  description: "Ürün fiyatı, stok ve hasat bilgilerini üretici panelinde yönetin.",
  robots: { index: false, follow: false },
};

export default async function NewProducerProductPage() {
  const { userId, producer } = await requireProducer("/uretici/urunler/yeni");
  const categories = await getActiveCategories();
  const canPublish = producer.verification_status === "approved" && producer.is_public;

  return (
    <main className="producer-manage-page">
      <header className="auth-topbar"><div className="container auth-topbar-inner"><Link className="brand" href="/" aria-label="Tarladan Sofraya ana sayfa"><img src="/logo.svg" width="218" height="50" alt="Tarladan Sofraya" /></Link><Link className="auth-home-link" href="/uretici/urunler"><ArrowLeft size={14} aria-hidden="true" /> Ürünlerime dön</Link></div></header>
      <div className="container producer-form-shell"><div className="producer-form-heading"><span className="eyebrow"><span className="eyebrow-dot" /> YENİ İLAN</span><h1>Ürününüzü pazara hazırlayın.</h1><p>Fiyat, stok ve hasat bilgilerinizi doğru ve güncel paylaşın.</p></div><ProductForm categories={categories} producerId={userId} producerCanPublish={canPublish} /></div>
      <footer className="auth-footer container"><span>© {new Date().getFullYear()} Tarladan Sofraya</span><a href="https://appfabrika.com/" target="_blank" rel="noreferrer noopener">Bir Appfabrika ürünü</a></footer>
    </main>
  );
}
