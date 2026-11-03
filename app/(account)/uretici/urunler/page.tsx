import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CirclePlus, ClipboardList, Edit3, PackageOpen, Sprout } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireProducer } from "@/lib/catalog/producer-access";
import { formatDate, formatNumber, formatPrice, productImageUrl, unitLabel } from "@/lib/catalog/format";
import { getProducerProducts } from "@/lib/catalog/queries";

export const metadata: Metadata = {
  title: "Ürünlerim ve stok | Tarladan Sofraya",
  description: "Üretici ürünlerini, fiyatlarını, stoklarını ve hasat bilgilerini yönetin.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ProducerProductsPage({ searchParams }: Props) {
  const { userId, producer } = await requireProducer("/uretici/urunler");
  const products = await getProducerProducts(userId);
  const params = await searchParams;
  const state = Array.isArray(params.durum) ? params.durum[0] : params.durum;
  const canPublish = producer.verification_status === "approved" && producer.is_public;

  return (
    <main className="producer-manage-page">
      <header className="auth-topbar"><div className="container auth-topbar-inner"><Link className="brand" href="/" aria-label="Tarladan Sofraya ana sayfa"><img src="/logo.svg" width="218" height="50" alt="Tarladan Sofraya" /></Link><Link className="auth-home-link" href="/hesabim"><ArrowLeft size={14} aria-hidden="true" /> Hesap merkezine dön</Link></div></header>
      <div className="container producer-manage-shell">
        <div className="producer-manage-head"><div><span className="eyebrow"><span className="eyebrow-dot" /> ÜRETİCİ PANELİ</span><h1>Ürün ve stok yönetimi.</h1><p>Merhaba {producer.public_name}. Ürün, fiyat, mevcut stok ve hasat bilgisini tek yerde güncel tutun.</p></div><Link className="catalog-add-button" href="/uretici/urunler/yeni"><CirclePlus size={17} aria-hidden="true" /> Yeni ürün ekle</Link></div>
        {!canPublish && <p className="catalog-form-note"><ClipboardList size={17} aria-hidden="true" /> Üretici profiliniz yönetici doğrulamasını bekliyor. İlanlar taslak olarak kaydedilir ve katalogda görünmez.</p>}
        {state === "dogrulama-bekliyor" && <p className="catalog-success-alert" role="status">Ürününüz taslak olarak kaydedildi. Yayına alma, üretici doğrulamasından sonra kullanılabilir.</p>}
        {state === "kaydedildi" && <p className="catalog-success-alert" role="status">Ürün bilgileriniz kaydedildi.</p>}
        <div className="producer-list-toolbar"><div><span className="eyebrow"><span className="eyebrow-dot" /> ÜRÜN KATALOĞUM</span><h2>{products.length} ürün</h2></div><span>En fazla 100 kayıt gösterilir</span></div>
        {products.length ? <div className="producer-product-list">{products.map((product) => <article className="producer-product-row" key={product.id}>
          <div className="producer-product-thumbnail">{productImageUrl(product.image_path) ? <img src={productImageUrl(product.image_path) ?? undefined} alt="" /> : <Sprout size={21} aria-hidden="true" />}</div>
          <div className="producer-product-main"><div className="producer-product-title"><h3>{product.name}</h3><span className={`product-status-badge status-${product.status}`}>{product.status === "active" ? "Yayında" : product.status === "paused" ? "Duraklatıldı" : product.status === "archived" ? "Arşivlendi" : "Taslak"}</span></div><p>{product.category?.name ?? "Kategori seçilmemiş"} · {[product.origin_city, product.origin_region].filter(Boolean).join(" / ") || "Bölge belirtilmedi"}</p><div className="producer-product-metrics"><span><strong>{formatPrice(product.price_per_unit, product.unit)}</strong></span><span>Stok: <strong>{product.inventory ? `${formatNumber(product.inventory.available_quantity)} ${unitLabel(product.unit)}` : "—"}</strong></span><span>Hasat: <strong>{formatDate(product.harvest?.harvest_date ?? null)}</strong></span></div></div>
          <Link className="producer-product-edit" href={`/uretici/urunler/${product.id}/duzenle`} aria-label={`${product.name} ürününü düzenle`}><Edit3 size={16} aria-hidden="true" /> Düzenle</Link>
        </article>)}</div> : <div className="catalog-empty-state"><div className="catalog-empty-icon"><PackageOpen size={25} aria-hidden="true" /></div><h2>Henüz ürün eklemediniz.</h2><p>İlk ürün ilanınızı oluşturun; miktar, fiyat ve hasat bilgileri birlikte kaydedilsin.</p><Link href="/uretici/urunler/yeni">İlk ürününüzü ekleyin <CirclePlus size={15} aria-hidden="true" /></Link></div>}
        <p className="catalog-disclosure">Bu aşamada ürün yönetimi ve pazaryeri keşfi kullanılabilir. Sipariş, sepet ve nakliye modülleri ayrıca devreye alınacaktır.</p>
        <div className="producer-manage-bottom"><Link href="/hesabim"><ArrowLeft size={15} aria-hidden="true" /> Hesap merkezine dön</Link><LogoutButton /></div>
      </div>
      <footer className="auth-footer container"><span>© {new Date().getFullYear()} Tarladan Sofraya</span><a href="https://appfabrika.com/" target="_blank" rel="noreferrer noopener">Bir Appfabrika ürünü</a></footer>
    </main>
  );
}
