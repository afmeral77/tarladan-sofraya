import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CircleHelp,
  ClipboardCheck,
  Handshake,
  Leaf,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";

const processSteps = [
  {
    number: "01",
    icon: MapPin,
    title: "Kaynağını bulun",
    text: "Bölgelere ve ürün gruplarına göre üretici tekliflerini keşfedin; ürünün nerede yetiştiğini görün.",
    meta: "KEŞFET",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    title: "Siparişi netleştirin",
    text: "Miktar, kalite beklentisi ve teslimat planını üreticiyle açıkça belirleyin.",
    meta: "ANLAŞ",
  },
  {
    number: "03",
    icon: Truck,
    title: "Taşımayı planlayın",
    text: "Uygun taşıma seçeneğini değerlendirin; ürün bedeliyle nakliye maliyetini ayrı görün.",
    meta: "ULAŞTIR",
  },
];

export function HowItWorksSection() {
  return (
    <section className="process-section section-pad" id="nasil-calisir">
      <div className="container">
        <div className="section-heading process-heading">
          <div>
            <span className="eyebrow"><span className="eyebrow-dot" /> Basit, açık, birlikte</span>
            <h2>İyi tedarik,<br /><em>iyi bir akışla</em> başlar.</h2>
          </div>
          <p>Üretici, alıcı ve nakliyeci aynı yolculuğun parçası. Her adım, kimin ne yapacağını netleştirmek için tasarlanıyor.</p>
        </div>
        <div className="process-track">
          {processSteps.map(({ number, icon: Icon, title, text, meta }, index) => (
            <article className="process-card" key={number}>
              <div className="process-card-top"><span>{number}</span><Icon size={21} strokeWidth={1.6} aria-hidden="true" /></div>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="process-meta">{meta}</span>
              {index < processSteps.length - 1 && <span className="process-connector" aria-hidden="true"><ArrowRight size={17} /></span>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BenefitsSection() {
  return (
    <section className="benefits-section section-pad">
      <div className="container benefits-layout">
        <div className="benefits-story">
          <span className="eyebrow"><span className="eyebrow-dot" /> İki taraf, ortak değer</span>
          <h2>Üreticiye daha<br />güçlü bir <em>pazar.</em></h2>
          <p className="benefits-lede">Alıcıya daha kolay bir tedarik. İki tarafın ihtiyacını aynı sistemde buluşturan bir iş modeli.</p>
          <div className="benefits-stamp"><Leaf size={18} aria-hidden="true" /><span>Üretimden ticarete<br />daha kısa bir yol</span></div>
        </div>
        <div className="benefit-panels">
          <article className="benefit-panel producer-panel">
            <div className="benefit-panel-heading"><span className="benefit-index">01 / ÜRETİCİ</span><SproutIcon /></div>
            <h3>Ürününüz doğru alıcıya ulaşsın.</h3>
            <p>Ürünlerinizi, hasat zamanınızı ve stok durumunuzu tek bir üretici profilinde düzenleyin.</p>
            <ul>
              <li><span /> Ürün ve hasat bilgisi bir arada</li>
              <li><span /> Fiyat ve stok bilgisini yayınlayın</li>
              <li><span /> Üretici doğrulaması sonrası pazaryerinde görünün</li>
            </ul>
            <a href="/kayit?rol=producer" className="benefit-link">Üretici hesabı oluştur <ArrowUpRight size={16} aria-hidden="true" /></a>
          </article>
          <article className="benefit-panel buyer-panel">
            <div className="benefit-panel-heading"><span className="benefit-index">02 / ALICI</span><Boxes size={22} strokeWidth={1.5} aria-hidden="true" /></div>
            <h3>Tedarik kararınızı kolaylaştırın.</h3>
            <p>Ürünleri, üretim bölgelerini ve taşıma seçeneklerini daha düzenli karşılaştırın.</p>
            <ul>
              <li><span /> Farklı üreticileri keşfet</li>
              <li><span /> İhtiyacına uygun miktarı planla</li>
              <li><span /> Nakliye bedelini ayrı değerlendir</li>
            </ul>
            <a href="#uyelik" className="benefit-link">Alıcı yolculuğu <ArrowUpRight size={16} aria-hidden="true" /></a>
          </article>
        </div>
      </div>
    </section>
  );
}

function SproutIcon() {
  return <Leaf size={22} strokeWidth={1.5} aria-hidden="true" />;
}

export function LogisticsSection() {
  return (
    <section className="logistics-section section-pad" id="nakliye">
      <div className="container logistics-shell">
        <div className="logistics-copy">
          <span className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> Ürün kadar önemli</span>
          <h2>Yolunu da<br /><em>birlikte</em> planlayın.</h2>
          <p>Platform kendi filosunu işletmek yerine, taşıma ihtiyacını üretici, alıcı ve anlaşmalı nakliyeciler arasında düzenlemeyi hedefler.</p>
          <a className="logistics-link" href="#uyelik">Nakliye modelini tanıyın <ArrowRight size={17} aria-hidden="true" /></a>
        </div>
        <div className="route-visual" aria-label="Üretim noktasından alıcıya taşımayı anlatan şematik görsel">
          <div className="route-visual-top"><span>TEDARİK YOLCULUĞU</span><span>01 — 03</span></div>
          <div className="route-line"><span className="route-node route-start"><Leaf size={17} aria-hidden="true" /></span><span className="route-dash" /><span className="route-truck"><Truck size={24} aria-hidden="true" /></span><span className="route-dash" /><span className="route-node route-end"><PackageCheck size={18} aria-hidden="true" /></span></div>
          <div className="route-labels"><div><b>Üretim noktası</b><span>Ürün ve çıkış bilgisi</span></div><div><b>Taşıma planı</b><span>Teklif ve araç kapasitesi</span></div><div><b>Alıcı noktası</b><span>Teslimat takibi</span></div></div>
          <div className="route-cost"><div className="route-cost-icon"><Handshake size={18} aria-hidden="true" /></div><div><b>Şeffaf maliyet yapısı</b><span>Ürün bedeli ve nakliye bedeli ayrı değerlendirilir.</span></div><span className="cost-tag">AYRI GÖSTERİM</span></div>
          <div className="route-corner-note">TAŞIMA<br />AKIŞI</div>
        </div>
      </div>
    </section>
  );
}

export function TrustSection() {
  return (
    <section className="trust-section section-pad" id="guven">
      <div className="container trust-layout">
        <div className="trust-main">
          <span className="eyebrow"><span className="eyebrow-dot" /> Her aşamada açıklık</span>
          <h2>Güven, görünür<br />olduğunda <em>büyür.</em></h2>
          <p>İyi ticaret; doğru bilgi, açık sorumluluk ve izlenebilir adımlarla kurulur. Tarladan Sofraya bu ilkeleri ürün keşfinden teslimata kadar tasarlıyor.</p>
          <a className="text-link" href="#sikca-sorulanlar">Sık sorulanları inceleyin <ArrowUpRight size={16} aria-hidden="true" /></a>
        </div>
        <div className="trust-grid">
          <article className="trust-item"><div className="trust-icon"><ShieldCheck size={21} aria-hidden="true" /></div><span className="trust-number">01</span><h3>Doğrulanabilir bilgi</h3><p>Üretici, ürün ve işletme bilgileri uygun doğrulama adımlarıyla sunulacak.</p></article>
          <article className="trust-item"><div className="trust-icon"><ClipboardCheck size={21} aria-hidden="true" /></div><span className="trust-number">02</span><h3>Açık işlem adımları</h3><p>Sipariş, ödeme ve teslimat durumları birbirinden ayrı ve anlaşılır izlenecek.</p></article>
          <article className="trust-item"><div className="trust-icon"><Truck size={21} aria-hidden="true" /></div><span className="trust-number">03</span><h3>Şeffaf lojistik</h3><p>Taşıma teklifi ve teslimat bilgileri sipariş akışına bağlanacak.</p></article>
          <article className="trust-item"><div className="trust-icon"><CircleHelp size={21} aria-hidden="true" /></div><span className="trust-number">04</span><h3>Net rol paylaşımı</h3><p>Üretici, alıcı, nakliyeci ve platformun sorumlulukları açıkça tanımlanacak.</p></article>
        </div>
      </div>
    </section>
  );
}

export function JoinSection() {
  return (
    <section className="join-section" id="uyelik">
      <div className="container join-shell">
        <div className="join-orbit orbit-one" />
        <div className="join-orbit orbit-two" />
        <div className="join-copy">
          <span className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> Tarladan Sofraya’ya katılın</span>
          <h2>Birlikte, daha<br /><em>iyi bir yol</em> açalım.</h2>
          <p>Üretici, alıcı/esnaf veya nakliyeci olarak hesabınızı oluşturun ve işletme profilinizi tamamlayın.</p>
        </div>
        <div className="join-actions">
          <a className="join-action-card" href="/kayit?rol=producer">
            <span className="join-role">ÜRETİCİ</span><SproutIcon /><h3>Ürününüzü tanıtın.</h3>
            <p>Hesabınızı açın, üretici profilinizi oluşturun ve doğrulama sürecine katılın.</p>
            <span className="join-card-cta">Üretici olarak kayıt olun <span aria-hidden="true">→</span></span>
          </a>
          <a className="join-action-card join-action-light" href="/kayit?rol=buyer">
            <span className="join-role">ALICI / ESNAF</span><Boxes size={22} strokeWidth={1.5} aria-hidden="true" /><h3>Tedarik ağınızı genişletin.</h3>
            <p>İşletme türünüzü seçin ve alıcı profilinizi tamamlayın.</p>
            <span className="join-card-cta">Alıcı olarak kayıt olun <span aria-hidden="true">→</span></span>
          </a>
        </div>
        <div className="join-footnote"><span /> Hesap kaydı ve işletme profili akışı hazır. Canlı stok, ürün teklifi, sepet ve sipariş sonraki geliştirme aşamalarında açılacaktır.</div>
        <p className="join-carrier-link">Nakliye hizmeti mi sunuyorsunuz? <a href="/kayit?rol=carrier">Nakliyeci olarak kayıt olun.</a></p>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "Tarladan Sofraya kimler için?",
    a: "Tarım üreticileri ile manav, market, restoran ve diğer profesyonel alıcıları bir araya getirmek için tasarlanan bir B2B tedarik ağıdır. Nakliye firmaları da taşıma sürecinde yer alır.",
  },
  {
    q: "Platform ürünleri kendisi mi satıyor?",
    a: "İş modeli üretici ile profesyonel alıcıyı doğrudan buluşturmayı ve lojistik organizasyonunu kolaylaştırmayı hedefler. Platformun hukuki ve ticari rolü, hizmete açılmadan önce ayrıca netleştirilecektir.",
  },
  {
    q: "Nakliye bedeli ürün fiyatına dahil mi?",
    a: "Hedeflenen modelde nakliye bedeli, ürün bedelinden ayrı gösterilir. Taşıma teklifi, araç kapasitesi ve teslimat adımları sonraki ürün aşamalarında devreye alınacaktır.",
  },
  {
    q: "Şu anda üyelik veya sipariş oluşturabilir miyim?",
    a: "Üretici, profesyonel alıcı ve nakliyeci için hesap kaydı hazır. E-posta doğrulaması gerekir. Üreticiler ürün, fiyat, stok ve hasat bilgilerini yönetebilir; onaylanmış üreticilerin canlı ilanları pazaryerinde görünür. Sepet, sipariş ve ödeme akışları henüz açılmamıştır. Ana sayfadaki örnek kartlar canlı ilan değildir.",
  },
];

export function FaqSection() {
  return (
    <section className="faq-section section-pad" id="sikca-sorulanlar">
      <div className="container faq-layout">
        <div className="faq-intro">
          <span className="eyebrow"><span className="eyebrow-dot" /> Merak edilenler</span>
          <h2>Kısa ve<br /><em>net yanıtlar.</em></h2>
          <p>Platform ve çalışma biçimi hakkında ilk bilgiler.</p>
        </div>
        <div className="faq-list">
          {faqs.map((item, index) => (
            <details className="faq-item" key={item.q} open={index === 0}>
              <summary><span className="faq-index">0{index + 1}</span><span>{item.q}</span><span className="faq-plus" aria-hidden="true">+</span></summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
          <div className="join-footnote"><span /> Ürün ve stok yönetimi ile doğrulanmış üreticilerin canlı ilanları kullanılabilir. Sepet, sipariş ve ödeme sonraki aşamalardadır.</div>
