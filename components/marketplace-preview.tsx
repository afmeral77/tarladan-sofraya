"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  MapPin,
  Search,
  Sprout,
} from "lucide-react";

type SampleProduct = {
  name: string;
  category: string;
  region: string;
  season: string;
  tone: string;
  mark: string;
};

const sampleProducts: SampleProduct[] = [
  { name: "Salkım domates", category: "Sebze", region: "Ege · örnek bölge", season: "Örnek ürün", tone: "tomato", mark: "01" },
  { name: "Sofralık üzüm", category: "Meyve", region: "İç Anadolu · örnek bölge", season: "Örnek ürün", tone: "grape", mark: "02" },
  { name: "Kırmızı mercimek", category: "Bakliyat", region: "Güneydoğu · örnek bölge", season: "Örnek ürün", tone: "lentil", mark: "03" },
  { name: "Yeni mahsul patates", category: "Patates & soğan", region: "Akdeniz · örnek bölge", season: "Örnek ürün", tone: "potato", mark: "04" },
];

const categories = ["Tümü", "Sebze", "Meyve", "Bakliyat", "Tahıl", "Patates & soğan"];

export function MarketplacePreview() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [category, setCategory] = useState("Tümü");

  const filteredProducts = useMemo(() => {
    const normalizedQuery = submittedQuery.trim().toLocaleLowerCase("tr-TR");
    return sampleProducts.filter((product) => {
      const matchesCategory = category === "Tümü" || product.category === category;
      const searchable = `${product.name} ${product.category} ${product.region}`.toLocaleLowerCase("tr-TR");
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, submittedQuery]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(query);
    document.getElementById("pazar-yeri")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <section className="hero-section">
        <div className="container hero-shell">
          <img
            className="hero-photo"
            src="/manus-storage/tarladan_sofraya_hero_53de3854.jpg"
            alt="Sabah ışığında taze sebzeleri kasalara yerleştiren bir üretici ve ekili tarla sıraları"
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <div className="hero-content">
            <div className="hero-kicker">
              <span className="kicker-line" />
              <span>Türkiye’nin üretim ağına açılan yeni yol</span>
            </div>
            <h1>
              Tarladan
              <br />
              sofraya<span className="hero-period">.</span>
            </h1>
            <p className="hero-lede">
              Üreticiyi profesyonel alıcıyla buluşturan yeni nesil tedarik ağı.
              Ürünün kaynağını görün, taşımayı birlikte planlayın.
            </p>
            <a className="hero-link" href="#pazar-yeri">
              Pazaryerini keşfet <ArrowDownRight size={18} aria-hidden="true" />
            </a>
          </div>
          <div className="hero-caption">
            <span className="caption-dot" />
            <span>Her iyi tedarik, üretildiği yeri bilmekle başlar.</span>
          </div>
          <div className="hero-side-label">ÜRETİCİDEN DOĞRUDAN SOFRAYA</div>
        </div>

        <div className="container search-dock-wrap">
          <form className="search-dock" onSubmit={handleSearch} role="search">
            <div className="search-label">
              <span className="search-icon-wrap"><Search size={19} aria-hidden="true" /></span>
              <label htmlFor="market-search">Bugün ne arıyorsunuz?</label>
            </div>
            <input
              id="market-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ürün, kategori veya bölge yazın"
              autoComplete="off"
            />
            <div className="search-separator" />
            <div className="search-region">
              <MapPin size={17} aria-hidden="true" />
              <span>Türkiye geneli</span>
            </div>
            <button className="search-submit" type="submit" aria-label="Örnek ürünlerde ara">
              <span>Ara</span><ArrowRight size={18} aria-hidden="true" />
            </button>
          </form>
          <p className="search-note"><span /> Arama önizlemesi örnek içerik üzerindedir; henüz canlı ürün teklifi göstermez.</p>
        </div>
      </section>

      <section className="market-section section-pad" id="pazar-yeri">
        <div className="container">
          <div className="section-heading market-heading">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" /> Pazar yerini keşfet</span>
              <h2>Ürünün yolu<br /><em>kaynağından</em> başlar.</h2>
            </div>
            <div className="market-intro">
              <p>Farklı bölgelerden gelen ürünleri tek bir yerde keşfedin. Ürün, miktar ve taşıma bilgisi aynı alışveriş yolculuğunda buluşsun.</p>
              <a className="text-link" href="#nasil-calisir">Platformu tanıyın <ArrowUpRight size={16} aria-hidden="true" /></a>
            </div>
          </div>

          <div className="market-tools">
            <div className="category-list" aria-label="Örnek ürün kategorileri">
              {categories.map((item) => (
                <button
                  className={`category-pill${category === item ? " is-selected" : ""}`}
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  aria-pressed={category === item}
                >
                  {item}
                </button>
              ))}
            </div>
            <span className="market-count">{filteredProducts.length.toString().padStart(2, "0")} örnek kart</span>
          </div>

          <div className="sample-notice" role="note">
            <BadgeCheck size={16} aria-hidden="true" />
            <span>Şeffaflık notu: Aşağıdaki ürün ve bölge adları tasarım örneğidir; canlı stok, fiyat, üretici veya doğrulama kaydı değildir.</span>
          </div>

          {filteredProducts.length ? (
            <div className="product-preview-grid">
              {filteredProducts.map((product) => (
                <article className={`product-card ${product.tone}`} key={product.name}>
                  <div className="product-art" aria-hidden="true">
                    <span className="product-mark">{product.mark}</span>
                    <span className="produce-shape shape-one" />
                    <span className="produce-shape shape-two" />
                    <span className="produce-shape shape-three" />
                    <span className="produce-leaf" />
                    <span className="product-art-word">TARLADAN<br />GELEN</span>
                  </div>
                  <div className="product-info">
                    <div className="product-overline"><span>{product.category}</span><span>{product.season}</span></div>
                    <h3>{product.name}</h3>
                    <p><MapPin size={14} aria-hidden="true" />{product.region}</p>
                    <div className="product-footer"><span>Fiyat ve stok bilgisi henüz örneklenmemiştir.</span><Sprout size={17} aria-hidden="true" /></div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-results">
              <Search size={22} aria-hidden="true" />
              <p>Bu örnek aramayla eşleşen kart yok. Farklı bir kelime veya kategori deneyin.</p>
            </div>
          )}
          <div className="market-bottom-line"><span /> Ürünler üretildiği yer ve taşıma bilgisiyle birlikte sunulacak.</div>
        </div>
      </section>
    </>
  );
}
