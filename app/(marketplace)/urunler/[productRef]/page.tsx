import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, CalendarDays, MapPin, Package, Sprout } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { formatDate, formatNumber, formatPrice, productImageUrl, producerHref, safeJsonLd, unitLabel } from "@/lib/catalog/format";
import { getPublicProduct } from "@/lib/catalog/queries";
import type { CatalogProduct } from "@/lib/catalog/types";

type Props = { params: Promise<{ productRef: string }> };

function productIdFromRef(value: string): string | null {
  const match = value.match(/^[a-z0-9-]+-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
  return match?.[1] ?? null;
}

async function resolvePublicProduct(ref: string): Promise<CatalogProduct | null> {
  const id = productIdFromRef(ref);
  if (!id) return null;
  const product = await getPublicProduct(id);
  if (!product || product.status !== "active" || product.producer?.verification_status !== "approved" || !product.producer.is_public) return null;
  return product;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productRef } = await params;
  const product = await resolvePublicProduct(productRef);
  if (!product) return { title: "Ürün bulunamadı | Tarladan Sofraya", robots: { index: false, follow: false } };
  return {
    title: `${product.name} — ${product.origin_city ?? product.producer?.city ?? "Türkiye"} | Tarladan Sofraya`,
    description: product.description?.slice(0, 155) || `${product.producer?.public_name ?? "Üretici"} tarafından sunulan ${product.name}; güncel fiyat, minimum sipariş ve stok bilgileri.`,
    openGraph: { title: `${product.name} | Tarladan Sofraya`, description: product.description ?? "Üreticiden doğrudan tarım ürünü.", type: "website" },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { productRef } = await params;
  const product = await resolvePublicProduct(productRef);
  if (!product || !product.producer) notFound();

  const photo = productImageUrl(product.image_path);
  const stock = product.inventory?.available_quantity ?? 0;
  const unitText = unitLabel(product.unit);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? `${product.name} — ${product.producer.public_name} tarafından sunuluyor.`,
    image: photo ? [photo] : undefined,
    category: product.category?.name,
    manufacturer: { "@type": "Organization", name: product.producer.public_name },
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: product.price_per_unit,
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        priceCurrency: "TRY",
        price: product.price_per_unit,
        unitText,
      },
      availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <SiteHeader />
      <main className="product-detail-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} />
        <div className="container product-detail-shell">
          <nav className="catalog-breadcrumb"><Link href="/">Ana sayfa</Link><span aria-hidden="true">/</span><Link href="/urunler">Pazaryeri</Link><span aria-hidden="true">/</span><span>{product.name}</span></nav>
          <div className="product-detail-grid">
            <div className="product-detail-photo">
              {photo ? <img src={photo} alt={`${product.name} ürün fotoğrafı`} /> : <div className="catalog-photo-empty"><Sprout size={42} strokeWidth={1.2} aria-hidden="true" /><span>Ürün fotoğrafı eklenmemiş</span></div>}
              <span className="catalog-category-tag">{product.category?.name ?? "Tarım ürünü"}</span>
            </div>
            <article className="product-detail-info">
              <span className="eyebrow"><span className="eyebrow-dot" /> ÜRETİCİ İLANI</span>
              <h1>{product.name}</h1>
              <p className="product-detail-producer"><Link href={producerHref(product.producer.user_id)}>{product.producer.public_name}</Link><BadgeCheck size={17} aria-label="Doğrulanmış üretici" /></p>
              <p className="product-detail-location"><MapPin size={15} aria-hidden="true" /> {product.origin_city || product.producer.city || "Türkiye"}{product.origin_region ? ` · ${product.origin_region}` : product.producer.region ? ` · ${product.producer.region}` : ""}</p>
              <div className="product-detail-price"><strong>{formatPrice(product.price_per_unit, product.unit)}</strong><span>Üreticinin bildirdiği birim fiyat</span></div>
              <dl className="product-detail-facts">
                <div><dt><Package size={15} aria-hidden="true" /> Mevcut stok</dt><dd>{product.inventory ? `${formatNumber(stock)} ${unitText}` : "Belirtilmedi"}</dd></div>
                <div><dt>Minimum sipariş</dt><dd>{formatNumber(product.minimum_order_qty)} {unitText}</dd></div>
                <div><dt>Kalite sınıfı</dt><dd>{product.quality_grade || "Belirtilmedi"}</dd></div>
                <div><dt><CalendarDays size={15} aria-hidden="true" /> Hasat tarihi</dt><dd>{formatDate(product.harvest?.harvest_date ?? null)}</dd></div>
                {product.inventory?.estimated_quantity !== null && product.inventory?.estimated_quantity !== undefined && <div><dt>Tahmini gelecek stok</dt><dd>{formatNumber(product.inventory.estimated_quantity)} {unitText}</dd></div>}
              </dl>
              <div className="product-order-notice"><span>SİPARİŞ ÖNCESİ BİLGİ</span><p>Bu aşamada ürün keşfi ve üretici karşılaştırması kullanılabilir. Sepet, sipariş oluşturma ve nakliye teklifi akışları henüz açılmamıştır.</p><Link href="/kayit?rol=buyer">Alıcı hesabı oluşturun</Link></div>
            </article>
          </div>
          <section className="product-description"><div><span className="eyebrow"><span className="eyebrow-dot" /> ÜRÜN BİLGİSİ</span><h2>Üreticiden notlar.</h2></div><p>{product.description || "Üretici bu ürün için henüz açıklama eklemedi."}</p></section>
          <section className="product-producer-banner"><div className="product-producer-icon"><Sprout size={23} aria-hidden="true" /></div><div><span>ÜRETİCİYİ TANIYIN</span><h2>{product.producer.public_name}</h2><p>{product.producer.bio || "Üretici profili hakkında ek bilgi paylaşılmamış."}</p></div><Link href={producerHref(product.producer.user_id)}>Üretici profilini gör <span aria-hidden="true">→</span></Link></section>
          <Link href="/urunler" className="product-back-link"><ArrowLeft size={16} aria-hidden="true" /> Pazaryerine dön</Link>
        </div>
      </main>
    </>
  );
}
