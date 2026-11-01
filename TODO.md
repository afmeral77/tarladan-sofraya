# Ürün Kapsamı ve İlerleme

## Aşama 1 — Marka, tasarım sistemi ve ana sayfa
- [x] Özgün Tarladan Sofraya görsel kimliği oluştur: koyu doğal yeşil, açık yeşil, kırık beyaz/krem ve toprak tonları; modern/profesyonel tipografi; tarım ve üretim görselleri; marka logosu ve tutarlı tasarım sistemi.
- [x] Mobil öncelikli, responsive ve SEO hazırlıklı ana sayfayı oluştur. Ana sayfada güçlü hero, “Üreticiden doğrudan sofraya” mesajı, ürün arama, öne çıkan tarım ürünleri, üretici keşfi, nasıl çalışır, üretici/alıcı avantajları, nakliye sistemi, güven/şeffaflık, iki rol için çağrı, SSS ve footer bulunmalı.

## Aşama 2 — Kod deposu, Supabase ve Vercel altyapısı
- [ ] Onaylanan Next.js, TypeScript, Tailwind CSS, Supabase ve Vercel yığınını kur; GitHub'da özel veya uygun erişim kontrollü repository, Supabase PostgreSQL projesi ve Vercel dağıtım altyapısı hesap bağlantısı gerektiriyorsa güvenli yetkilendirme ile bağlanmalı. Erişim olmadan bağlantı yapılmış gibi sunma.
- [ ] Domain marka adıyla bağlantıya hazır olmalı; henüz satın alınmamış/bağlanmamış domaini hazırmış gibi gösterme.

## Aşama 3 — Kullanıcı kayıtları ve rol bazlı yetkilendirme
- [ ] Dört rolü destekle: üretici, alıcı/esnaf (manav, market, restoran/lokanta), nakliyeci/lojistik firması ve yönetici. Kayıt, profil ve işletme bilgileri rol ihtiyaçlarına göre yönetilmeli; doğrulama ve e-posta doğrulama akışları uygun biçimde kurulmalı.
- [ ] Sunucu tarafı yetkilendirme ve RLS ile kullanıcı yalnız yetkili olduğu kayıtları görmeli; üretici diğer üreticilerin özel bilgilerine, alıcı başka işletmelerin siparişlerine erişememeli; yönetici rol/yetkileri güvenli yönetilmeli.

## Aşama 4 — Ürün pazaryeri, katalog ve stok
- [ ] Üretici ürün ekleyebilmeli, ürün fotoğrafı yükleyebilmeli, kilogram/ton/kasa/adet miktarı yönetebilmeli; güncel fiyat, hasat tarihi, tahmini stok ve minimum sipariş miktarı belirleyebilmeli.
- [ ] Alıcı ürün arayıp filtreleyebilmeli; üreticileri karşılaştırabilmeli. Fiyat, ürün miktarı, kalite sınıfı, üretici bilgisi, bölge ve hasat tarihi görünmeli. Kategoriler: sebze, meyve, bakliyat, tahıl, patates-soğan ve diğer tarım ürünleri. Bölge ve fiyat filtreleri sağlanmalı.
- [ ] Üretici sayfası; üretici profili, üretim bölgesi, ürünleri, stok ve doğrulama durumunu içermeli. Alıcı sayfası; işletme profili, sipariş geçmişi, favoriler, tekrar sipariş ve fiyat karşılaştırmasını içermeli.

## Aşama 5 — Sipariş, nakliye ve teslimat
- [ ] Gerçek iş akışı desteklenmeli: üretici kayıt olur; ürün ekler; alıcı ürünleri keşfeder ve sipariş oluşturur; üretici siparişi onaylar; nakliye talebi açılır; nakliyeciler teklif verir; uygun taşıma seçilir; teslimat takip edilir ve kanıtlanır; sipariş tamamlanır ve işlem kayıt altına alınır. Her adımda durumlar ve yetkiler doğru çalışmalı.
- [ ] Sepet ve sipariş farklı üreticilerden ürün seçimini desteklemeli; sipariş geçmişi ve tekrar sipariş sunmalı. Sipariş durumu ödeme durumundan ayrı tutulmalı.
- [ ] Nakliyeci firma kaydı, araç türü/kapasitesi, hizmet bölgeleri, taşıma teklifleri, sipariş/yük bilgisi, teslimat durumu ve teslimat kanıtı/fotoğraf yükleme akışları bulunmalı. Taşıma talepleri yük miktarı, çıkış/varış ve araç kapasitesini göstermeli; araç kapasitesi eşleştirme, sipariş birleştirme, rota/mesafe ve tahmini taşıma süresi mimariye hazırlanmalı. Nakliye maliyeti ürün fiyatından ayrı görünmeli.
- [ ] Alıcı favori üreticileri kaydedebilmeli; üretici satış geçmişi ve raporlama görmeli.

## Aşama 6 — Yönetim ve ticari sistem
- [ ] Yönetici tüm kullanıcıları yönetebilmeli; üretici ve işletme doğrulayabilmeli; ürün ve sipariş yönetebilmeli; nakliye tekliflerini izleyebilmeli; komisyon/hizmet bedellerini, şikâyet ve uyuşmazlıkları, platform raporlarını ve kullanıcı/işlem denetim kayıtlarını yönetebilmeli.
- [ ] Gelir kanalları: gerçekleşen siparişlerden şeffaf hizmet bedeli, esnaf aboneliği, İşletme Pro aboneliği ve nakliye organizasyon hizmet bedeli. Başlangıç fiyatları yönetim panelinden değiştirilebilir olmalı; tüm ücretler işlemden önce üretici ve alıcıya gösterilmeli.
- [ ] Veritabanı uygun olduğunda `profiles`, `businesses`, `producers`, `buyers`, `carriers`, `products`, `product_categories`, `inventory`, `harvests`, `orders`, `order_items`, `transport_requests`, `transport_offers`, `deliveries`, `payments`, `subscriptions`, `reviews`, `notifications`, `disputes`, `platform_settings`, `audit_logs` tablolarını içermeli; ilişkiler, indeksler ve veri bütünlüğü doğru kurulmalı.

## Aşama 7 — Ödeme, harita ve bildirim entegrasyonları
- [ ] Supabase Auth, e-posta doğrulama, kullanıcı rolleri, PostgreSQL, Storage ve sipariş bildirimleri için Realtime desteklenmeli; gerekli işlemlerde Edge Functions kullanılmalı.
- [ ] Harita/konum çözümü Google Maps veya Mapbox üzerinden üretici, alıcı, nakliyeci konumu, mesafe, rota ve tahmini taşıma süresini desteklemeli.
- [ ] Türkiye'de çalışan iyzico ve PayTR seçenekleri değerlendirilmeli; ödeme başlatma, callback/webhook ve ödeme durumu takibi kurulmalı. Gerçek sağlayıcı hesabı ve API anahtarı yokken canlı ödeme varmış gibi gösterilmemeli. Platformun hukuki ve ticari rolüyle uyumlu ödeme modeli seçilmeli. Gerçek ödeme entegrasyonu kurulana kadar sipariş ve ödeme durumları ayrı yönetilmeli.
- [ ] E-posta sipariş/durum bildirimleri, yeni nakliye teklifleri, SMS sağlayıcısı altyapısı ve WhatsApp Business API hazırlığı olmalı. Gerçek hesap/anahtar bağlantısı yoksa tamamlandı denmemeli.
- [ ] Google Analytics 4 temel dönüşüm takibi ve Search Console hazırlığı; sipariş analitiği ve kullanıcı aktivitesi uygun gizlilik/izinlerle eklenmeli.

## Aşama 8 — Güvenlik, mevzuat, SEO ve canlı yayın
- [ ] Güvenlik: formlar doğrulanmalı; sunucu tarafı erişim kontrolleri, tüm kullanıcı tablolarında RLS, API rate limiting, webhook imza doğrulaması, dosya yükleme kontrolleri, XSS/CSRF önlemleri, güvenli hata yönetimi ve kritik işlemlerde audit log bulunmalı. Service role anahtarı frontend'e konmamalı. Yedekleme stratejisi belirlenmeli. Entegrasyonlar başarılı, başarısız ve eksik kimlik bilgisi durumlarında ele alınmalı.
- [ ] HKS yükümlülükleri, ürün künyesi/bildirim süreçleri, vergi ve faturalandırma gereklilikleri; üretici, alıcı ve platformun hukuki rolleri araştırılmalı. Resmî API erişimi varsa seçenekler değerlendirilmeli; yoksa manuel kayıt/doğrulama modülü oluşturulmalı. Hukuki uygunluk teyit edilmeden uyumluluk iddiası yapılmamalı.
- [ ] SEO: SEO uyumlu URL, anlamlı sayfa içeriği, başlık/açıklama, ürünlerde yapılandırılmış veri, sitemap, robots.txt, Open Graph, mobil performans ve hızlı yükleme ile Google indekslenebilirliği sağlanmalı.
- [ ] Vercel üzerinde dağıtıma hazır olmalı ve özel domain bağlantısı hazırlanmalı; GitHub, Supabase ve Vercel gerçekten bağlanmadan bağlı oldukları söylenmemeli. Son güvenlik/iş akışı kontrolleri sonrası canlı yayın gerçekleştirilmelidir.

## Tamamlananlar
- [x] Next.js + TypeScript + Tailwind, Supabase ve Vercel mimarisi kullanıcı tarafından onaylandı.
- [x] WebDev managed proje çalışma alanı başlatıldı; proje başlatılması tek başına GitHub, Supabase veya Vercel hesabı bağlantısı anlamına gelmez.
- [x] Aşama 1 marka sistemi, özgün logo/hero, responsive Türkçe tanıtım ana sayfası, ürün örnek arama/filtre önizlemesi ve başlangıç SEO/robots içerikleri hazırlandı. Üyelik ve canlı tekliflerin henüz kullanılabilir olmadığı kullanıcıya açıkça bildiriliyor.

## Açık / güncel durum
Aşama 1 tamamlandı. Sonraki sıradaki çalışma Aşama 2'dir; kullanıcı hesapları veya özel domain/entegrasyon bağlantıları henüz yapılmış sayılmaz.
