import { SiteHeader } from "@/components/site-header";
import { MarketplacePreview } from "@/components/marketplace-preview";
import {
  BenefitsSection,
  FaqSection,
  HowItWorksSection,
  JoinSection,
  LogisticsSection,
  TrustSection,
} from "@/components/home-sections";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <MarketplacePreview />
        <HowItWorksSection />
        <BenefitsSection />
        <LogisticsSection />
        <TrustSection />
        <JoinSection />
        <FaqSection />
      </main>
      <footer className="site-footer">
        <div className="container footer-main">
          <div className="footer-brand">
            <a className="brand" href="#top" aria-label="Tarladan Sofraya ana sayfa">
              <img src="/logo.svg" width="228" height="52" alt="Tarladan Sofraya" />
            </a>
            <p>Üreticiden doğrudan sofraya.</p>
          </div>
          <div className="footer-links">
            <a href="/urunler">Canlı pazaryerini keşfet</a>
            <a href="#nasil-calisir">Nasıl çalışır?</a>
            <a href="#nakliye">Nakliye modeli</a>
            <a href="#uyelik">Üyelik bilgisi</a>
          </div>
          <div className="footer-note">
            <span className="eyebrow">Canlı ürün keşfi</span>
            <p>Pazaryeri yalnızca doğrulanmış üreticilerin gerçek ilanlarını gösterir. Sepet, sipariş, nakliye teklifi ve ödeme akışları henüz açık değildir.</p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} Tarladan Sofraya</span>
          <span>Türkiye’de üretim yapanlar ve profesyonel alıcılar için.</span>
          <a href="https://appfabrika.com/" target="_blank" rel="noreferrer noopener">Bir Appfabrika ürünü</a>
        </div>
      </footer>
    </>
  );
}
