import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, MapPin, Sprout } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { isUuid, producerHref } from "@/lib/catalog/format";
import { getPublicProducer, getPublicProducerProducts } from "@/lib/catalog/queries";

type Props = { params: Promise<{ producerId: string }> };

async function resolveProducer(id: string) {
  if (!isUuid(id)) return null;
  return getPublicProducer(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { producerId } = await params;
  const producer = await resolveProducer(producerId);
  if (!producer) return { title: "Üretici bulunamadı | Tarladan Sofraya", robots: { index: false, follow: false } };
  const region = [producer.city, producer.region].filter(Boolean).join(" · ");
  return {
    title: `${producer.public_name}${region ? ` — ${region}` : ""} | Tarladan Sofraya`,
    description: producer.bio?.slice(0, 155) || `${producer.public_name} üretici profili ve güncel ürünleri.`,
    alternates: { canonical: producerHref(producer.user_id) },
  };
}

export default async function ProducerProfilePage({ params }: Props) {
  const { producerId } = await params;
  const producer = await resolveProducer(producerId);
  if (!producer) notFound();
  const products = await getPublicProducerProducts(producer.user_id);

  return (
    <>
      <SiteHeader />
      <main className="producer-profile-page">
        <div className="container producer-profile-shell">
          <nav className="catalog-breadcrumb"><Link href="/">Ana sayfa</Link><span aria-hidden="true">/</span><Link href="/urunler">Pazaryeri</Link><span aria-hidden="true">/</span><span>Üretici</span></nav>
          <section className="producer-profile-hero">
            <div className="producer-profile-mark"><Sprout size={38} strokeWidth={1.2} aria-hidden="true" /></div>
            <div className="producer-profile-copy"><span className="eyebrow"><span className="eyebrow-dot" /> ÜRETİCİ PROFİLİ</span><h1>{producer.public_name}</h1><p className="producer-profile-location"><MapPin size={15} aria-hidden="true" /> {[producer.city, producer.region].filter(Boolean).join(" · ") || "Bölge bilgisi belirtilmedi"}</p><p>{producer.bio || "Bu üretici henüz profil açıklaması eklemedi."}</p></div>
            <div className="producer-profile-status"><BadgeCheck size={18} aria-hidden="true" /><span>Doğrulanmış<br />üretici</span></div>
          </section>
          <section className="producer-profile-products"><div className="catalog-results-heading"><div><span className="eyebrow"><span className="eyebrow-dot" /> ÜRETİCİNİN İLANLARI</span><h2>{products.length ? `${products.length} aktif ürün` : "Henüz aktif ürün yok"}</h2></div><p>Yalnızca yayında olan ürünler gösterilir.</p></div>
            {products.length ? <CatalogBrowser products={products} /> : <div className="catalog-empty-state"><div className="catalog-empty-icon"><Sprout size={25} aria-hidden="true" /></div><h3>Bu üreticinin şu anda yayında ürünü yok.</h3><p>Ürünler eklendiğinde bu profilde görüntülenir.</p><Link href="/urunler"><ArrowLeft size={15} aria-hidden="true" /> Pazaryerine dön</Link></div>}
          </section>
        </div>
      </main>
    </>
  );
}
