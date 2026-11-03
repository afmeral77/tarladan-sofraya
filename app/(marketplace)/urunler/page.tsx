import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Filter, Search, Sprout } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { getCatalogPage, parseCatalogFilters } from "@/lib/catalog/queries";
import type { CatalogFilters } from "@/lib/catalog/types";

export const metadata: Metadata = {
  title: "Tarım ürünleri pazaryeri | Tarladan Sofraya",
  description: "Türkiye’de üreticilerin güncel ürünlerini fiyat, bölge, stok ve hasat bilgileriyle keşfedin.",
};

const PAGE_SIZE = 18;
type SearchParams = Record<string, string | string[] | undefined>;
type Props = { searchParams: Promise<SearchParams> };

function pageHref(filters: CatalogFilters, page: number): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.category) params.set("kategori", filters.category);
  if (filters.region) params.set("bolge", filters.region);
  if (filters.minPrice !== null) params.set("fiyatMin", String(filters.minPrice));
  if (filters.maxPrice !== null) params.set("fiyatMax", String(filters.maxPrice));
  if (filters.minQuantity !== null) params.set("stokMin", String(filters.minQuantity));
  if (filters.harvestFrom) params.set("hasatBaslangic", filters.harvestFrom);
  if (filters.harvestTo) params.set("hasatBitis", filters.harvestTo);
  if (filters.qualityGrade) params.set("kalite", filters.qualityGrade);
  if (filters.sort !== "newest") params.set("sirala", filters.sort);
  params.set("sayfa", String(page));
  return `/urunler?${params.toString()}`;
}

export default async function MarketplacePage({ searchParams }: Props) {
  const filters = parseCatalogFilters(await searchParams);
  const catalog = await getCatalogPage(filters);
  const pageCount = Math.ceil(catalog.totalCount / PAGE_SIZE);

  return (
    <>
      <SiteHeader />
      <main className="catalog-page">
        <section className="catalog-hero">
          <div className="container catalog-hero-inner">
            <div className="catalog-breadcrumb"><Link href="/">Ana sayfa</Link><span aria-hidden="true">/</span><span>Pazaryeri</span></div>
            <span className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> DOĞRUDAN ÜRETİCİDEN</span>
            <h1>Ürünü bulun.<br /><em>Kaynağını bilin.</em></h1>
            <p>Fiyatı, bölgeyi, kaliteyi ve güncel stok bilgisini aynı yerde karşılaştırın.</p>
            <div className="catalog-hero-stats"><span><strong>01</strong> Üreticiden ürün</span><span><strong>02</strong> Açık fiyat ve stok</span><span><strong>03</strong> Bölge ve hasat bilgisi</span></div>
          </div>
          <div className="catalog-hero-mark" aria-hidden="true"><Sprout size={76} strokeWidth={0.8} /></div>
        </section>

        <section className="container catalog-content">
          <form className="catalog-filter-panel" action="/urunler" method="get" aria-label="Ürün arama ve filtreleri">
            <div className="catalog-filter-title"><div><span className="eyebrow"><span className="eyebrow-dot" /> PAZARYERİ</span><h2>Ürünleri keşfedin.</h2></div><Filter size={20} aria-hidden="true" /></div>
            <label className="catalog-filter-field catalog-filter-search"><span>Ürün, üretici veya bölge</span><div className="catalog-search-input"><Search size={17} aria-hidden="true" /><input type="search" name="q" defaultValue={filters.query} placeholder="Örn. domates, Antalya…" maxLength={100} /></div></label>
            <div className="catalog-filter-grid">
              <label className="catalog-filter-field"><span>Kategori</span><select name="kategori" defaultValue={filters.category}><option value="">Tüm kategoriler</option>{catalog.categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}</select></label>
              <label className="catalog-filter-field"><span>Bölge / il</span><input type="text" name="bolge" defaultValue={filters.region} placeholder="Örn. Ege" maxLength={80} /></label>
              <label className="catalog-filter-field"><span>Minimum fiyat (₺)</span><input type="number" name="fiyatMin" min="0" step="0.01" defaultValue={filters.minPrice ?? ""} inputMode="decimal" /></label>
              <label className="catalog-filter-field"><span>Maksimum fiyat (₺)</span><input type="number" name="fiyatMax" min="0" step="0.01" defaultValue={filters.maxPrice ?? ""} inputMode="decimal" /></label>
              <label className="catalog-filter-field"><span>Minimum stok miktarı</span><input type="number" name="stokMin" min="0" step="0.01" defaultValue={filters.minQuantity ?? ""} inputMode="decimal" /></label>
              <label className="catalog-filter-field"><span>Kalite sınıfı</span><input type="text" name="kalite" defaultValue={filters.qualityGrade} placeholder="Örn. Sınıf I" maxLength={80} /></label>
              <label className="catalog-filter-field"><span>Hasat başlangıcı</span><input type="date" name="hasatBaslangic" defaultValue={filters.harvestFrom} /></label>
              <label className="catalog-filter-field"><span>Hasat bitişi</span><input type="date" name="hasatBitis" defaultValue={filters.harvestTo} /></label>
              <label className="catalog-filter-field"><span>Sıralama</span><select name="sirala" defaultValue={filters.sort}><option value="newest">En yeni</option><option value="price_asc">Fiyat: artan</option><option value="price_desc">Fiyat: azalan</option></select></label>
            </div>
            <div className="catalog-filter-actions"><button type="submit" className="catalog-filter-submit"><Search size={16} aria-hidden="true" /> Sonuçları göster</button><Link href="/urunler" className="catalog-filter-reset">Filtreleri temizle</Link></div>
          </form>

          <div className="catalog-results">
            <div className="catalog-results-heading"><div><span className="eyebrow"><span className="eyebrow-dot" /> CANLI KATALOG</span><h2>{catalog.totalCount ? `${catalog.totalCount.toLocaleString("tr-TR")} ürün bulundu` : "Ürünleri keşfedin"}</h2></div><p>Ürünler doğrulanmış, herkese açık üretici listelerinden gösterilir.</p></div>
            {catalog.error ? (
              <div className="catalog-empty-state"><div className="catalog-empty-icon"><Search size={24} aria-hidden="true" /></div><h3>Katalog şu anda yüklenemiyor.</h3><p>Veritabanı yanıt vermedi. Biraz sonra tekrar deneyebilir veya filtreleri temizleyebilirsiniz.</p><Link href="/urunler">Yeniden dene <ArrowRight size={15} aria-hidden="true" /></Link></div>
            ) : catalog.products.length ? (
              <>
                <CatalogBrowser products={catalog.products} />
                {pageCount > 1 && <nav className="catalog-pagination" aria-label="Pazaryeri sayfaları">{filters.page > 1 ? <Link href={pageHref(filters, filters.page - 1)}><ArrowLeft size={15} aria-hidden="true" /> Önceki</Link> : <span /> }<span>Sayfa {filters.page} / {pageCount}</span>{filters.page < pageCount ? <Link href={pageHref(filters, filters.page + 1)}>Sonraki <ArrowRight size={15} aria-hidden="true" /></Link> : <span />}</nav>}
              </>
            ) : (
              <div className="catalog-empty-state"><div className="catalog-empty-icon"><Sprout size={25} aria-hidden="true" /></div><h3>Bu ölçütlerde henüz yayınlanmış ürün yok.</h3><p>Filtreleri değiştirebilir ya da üretici olarak ürününüzü ekleyebilirsiniz. Gerçek ilanlar doğrulanmış üreticilerden geldikçe burada görünür.</p><Link href="/kayit?rol=producer">Üretici hesabı oluştur <ArrowRight size={15} aria-hidden="true" /></Link></div>
            )}
            <p className="catalog-disclosure">Ürün fiyatı üretici tarafından bildirilir. Nakliye bedeli, teklif ve sipariş özellikleri henüz bu katalog ekranına dahil değildir.</p>
          </div>
        </section>
      </main>
    </>
  );
}
