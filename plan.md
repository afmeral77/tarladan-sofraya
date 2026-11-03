# Tarladan Sofraya — Uygulama ve Tasarım Planı

## Ürün ve bu aşamanın sınırı

Tarladan Sofraya, Türkiye'deki tarım üreticilerini manav, market, restoran ve diğer profesyonel alıcılarla doğrudan buluşturan B2B tarım ticaret platformudur. Marka vaadi: **“Üreticiden doğrudan sofraya.”** Kullanıcı rolleri üretici, alıcı/esnaf, nakliyeci ve yöneticidir. Uzun vadeli kapsam; ürün/stok/hasat yönetimi, çoklu üreticiden sepet ve sipariş, nakliye teklifleri ile teslimat, yönetim/komisyon/şikâyet/raporlar, ödeme ve bildirim entegrasyonları, SEO, güvenlik ve mevzuat değerlendirmesini içerir.

Kullanıcı onayı uyarınca seçilen yığın Next.js, TypeScript, Tailwind CSS, Supabase ve Vercel'dir. Aşama 1 marka/tasarım sistemi ve tanıtım ana sayfasını tamamladı; Aşama 2'deki Auth/katalog PostgreSQL temeli ve Aşama 3 rol kayıt ekranları hazır. Kullanıcının organizasyon ve aylık 0 USD proje maliyeti için ayrı onayıyla Supabase'de yeni, aktif `dmfcruizfwiuneilckji` projesi `eu-central-1` bölgesinde açıldı; mevcut, ilgisiz Supabase projelerine dokunulmadı. Aşama 4'te canlı ürün keşfi, producer ürün/stok/hasat yönetimi, doğrulanmış ürün/üretici sayfaları ve RLS'li fotoğraf yükleme eklendi; ilk gerçek ilanlar henüz girilmediği için katalog doğru biçimde boş durumu gösterir. WebDev proje capability'lerinde server/database etkin, fakat uygulamanın ürün verisinin tek kaynağı harici Supabase'tir; ayrı Manus-managed DB ürün tablosu olarak kullanılmıyor. GitHub kullanıcının ayrıca bağladığı repository'de eşitleme hedefidir; WebDev canonical `origin` Manus yönetiminde kalır. Vercel hesabı/projesi, özel domain, Auth SMTP/redirect, ödeme, harita, SMS veya WhatsApp entegrasyonlarının bağlandığı iddia edilmez. Sipariş/nakliye akışları sonraki aşamalardadır.

## Uygulama yaklaşımı

- Next.js App Router ile sunucu tarafında anlamlı ve indekslenebilir ilk HTML üret; ana sayfa başlık/açıklama ve sosyal paylaşım metadatasını route seviyesinde tanımla. Henüz gerçek bir domain belirlenmediğinden tahmini canonical/OG URL yazma.
- TypeScript ve Tailwind CSS ile tutarlı tasarım değişkenleri ve küçük, yeniden kullanılabilir arayüz bileşenleri oluştur. İstemci tarafı etkileşimi yalnızca mobil menü, arama alanı ve benzeri gerçekten etkileşimli bileşenlerle sınırlı tut.
- Özgün hero fotoğrafını görsel üretim aracıyla hazırla, ardından proje depolamasına yükleyerek uygulamada proje-içi görsel yolu ile kullan. Logoyu basit, ölçeklenebilir bir SVG işareti ve ayrı wordmark düzeni olarak kodla; marka yazısını raster görsel içine gömme.
- Uygulamanın uzun vadeli backend sınırı Supabase Auth, PostgreSQL/RLS, Storage, Realtime ve gerektiğinde Edge Functions'tır. İstemciler `@supabase/ssr` ve yalnızca publishable anahtar ile yapılandırılır; sunucu tarafı SSR istemcisi istek başına çerezleri kullanır. Public URL/publishable key committed `lib/supabase/config.ts` varsayılanlarıdır (gizli değer değildir) ve environment override'ı desteklenir; service-role/secret anahtarları tarayıcıya aktarılmayacaktır. İlk migration profiller, işletme ve rol kayıtları ile ürün kataloğu/stok/hasat çekirdeğini oluşturur; ikinci migration rol/işletme sahipliği ile moderasyon alanlarını sıkılaştırır. Sipariş ve ödeme tabloları bu ilk DB temelinin kapsamında değildir.
- Ödeme ve sipariş durumları ayrı tutulacak. iyzico/PayTR, Google Maps/Mapbox, e-posta/SMS/WhatsApp, GA4 ve Search Console yalnızca gerekli hesap ve yetkilendirme sağlandığında etkinleştirilir. Resmî HKS/API erişimi ve mevzuat yükümlülükleri araştırılıp doğrulanmadan uygunluk iddiası yapılmaz.

## Aşama 3 — Kimlik doğrulama, rol kaydı ve Appfabrika atfı

- Supabase Auth e-posta/parola sağlayıcısı kullanılacak. Salt-okunur Auth ayar ucu e-posta sağlayıcısının açık, signup'ın etkin ve `mailer_autoconfirm=false` (doğrulama gerekiyor) olduğunu gösterdi. Kullanıcı kendisini üretici, alıcı/esnaf veya nakliyeci olarak kaydedebilir; yönetici rolü genel kayıt ekranından verilemez. `profiles.role` kaydı auth trigger'ından gelir; tarayıcı rol/admin veya doğrulama bayraklarını doğrudan değiştiremez.
- Rotalar: `/kayit`, `/giris`, `/sifre-sifirla`, `/sifre-yenile`, `/kayit/profil`, `/hesabim`; Supabase doğrulama/parola bağlantıları `/auth/callback` route handler'ında PKCE kodu server-side exchange ile işler. `proxy.ts` Supabase `getClaims()` ile session yeniler; cookie `SameSite=None; Secure` yazılır ve böylece HTTPS gömülü Preview çalışır. Yetkili sayfa doğrulanmış claim ile sunucu tarafında korunur; hedef yönlendirmeler yalnızca güvenli yerel path kabul eder.
- E-posta doğrulaması sonrası işletme profilini tamamlama adımı `SECURITY INVOKER` olan tek bir PostgreSQL RPC ile atomik yapılır; rol `auth.uid()` profiliyle doğrulanır ve tüm yazmalar mevcut kolon grant'leri ile RLS politikalarına tabidir. Buyer subtype doğrudan DB yazmalarında da CHECK constraint ile zorunludur. Üretici public adı/şehir/bölge, alıcı işletme türü (manav, market, restoran, lokanta, diğer), nakliyeci araç türü/kapasitesi/hizmet bölgeleri ile ortak işletme/iletişim ve isteğe bağlı vergi alanları alınır. Yönetici profil kaydı platform yönetim sürecine aittir.
- Her auth/profil ekranı mevcut responsive marka sistemini kullanır; ana sayfa üyelik CTA'ları gerçek kayıt ekranlarına bağlanır. Ana sayfa ve auth alanı `Bir Appfabrika ürünü` atfını [appfabrika.com](https://appfabrika.com/) adresine bağlar.
- Kod e-posta callback URL'lerini mevcut tarayıcı origin'inden üretir. Supabase Auth URL Configuration'da localhost, HTTPS Preview callback ve sonradan seçilecek kesin production URL allowlist edilmelidir. Bu ayarlar ve özel SMTP kimlik bilgileri proje API'sinden yönetilemiyor; manuel dashboard ayarı gereksinimi teslimde açıkça bildirilir. Özel SMTP olmadan doğrulama e-postalarının gerçek kullanıcıya teslim edildiği iddia edilmez.
- Uygulama referansları: [Supabase SSR client ve proxy](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [parola tabanlı e-posta Auth](https://supabase.com/docs/guides/auth/passwords), [redirect allowlist ve Site URL](https://supabase.com/docs/guides/auth/redirect-urls), [production Auth checklist / SMTP](https://supabase.com/docs/guides/deployment/going-into-prod), [Appfabrika](https://appfabrika.com/).

## Aşama 4 — Canlı ürün kataloğu, fotoğraflar ve üretici stok yönetimi

- Pazaryeri sayfası Supabase'ten gerçek aktif ürünleri sunucu tarafında getirir. Mevcut RLS yalnız aktif ürünü onaylı ve herkese açık üretici altında anon/kimliği doğrulanmış kullanıcılara gösterir; yeni ürün yoksa açık boş durum gösterilir, sahte fiyat/stok/üretici kaydı eklenmez. Kategori, metin (ürün/açıklama/bölge/üretici), bölge, fiyat aralığı, minimum stok, hasat tarihi ve kalite sınıfı filtreleri URL search params ile uygulanır; sıralama ve mobil filtre formu sağlanır.
- Üretici hesabı yalnız kendi ürünlerini görür, ekler ve düzenler. Form kilogram/ton/kasa/adet birimini; güncel TRY fiyatını; kalite, minimum sipariş, açıklama ve üretim bölgesini; mevcut stok, tahmini stok, tahmini miktar ve hasat gününü tutarlı biçimde yönetir. `save_producer_product` RPC `SECURITY INVOKER` olur; kimliği ve producer rolünü `auth.uid()` ile denetleyip ürün, stok ve hasat değişikliklerini mevcut RLS/kolon izinleri içinde tek PostgreSQL transaction'ında yazar. Onaysız veya public olmayan üreticinin ürünü herkese gösterilmez.
- Ürün fotoğrafı `product-images` Supabase Storage bucket'ına JS SDK ile yüklenir. Bucket'ta yalnız JPEG/PNG/WebP ve 5 MiB sınırı uygulanır; upload/update/delete yalnız oturum açmış producer rolüne ve kendi `auth.uid()` klasörüne Storage RLS ile sınırlandırılır. Uygulama DB'de yalnız nesne yolunu saklar ve resmi SDK public URL'siyle gösterir; kullanıcı kontrollü dosya adı ya da anahtar URL'si kabul edilmez, service-role anahtarı kullanılmaz.
- Her ürün sayfası gerçek katalog RLS sonucundan beslenir, slug+UUID taşıyan indekslenebilir URL, sayfa metadata'sı ve alanları mevcut üründen türetilen Product JSON-LD sunar. Üretici profil sayfasında açık işletme profili, bölge, doğrulama durumu, aktif ürünleri ve stok görünür. Alıcı pazaryeri aynı birim/fiyat/kalite/bölge/hasat ve miktar bilgisini yan yana en fazla üç ürün karşılaştırmasına aktarır; henüz olmayan nakliye bedeli veya sipariş işlevi varmış gibi gösterilmez.
- Rotalar: `/urunler`, `/urunler/[slug]-[id]`, `/ureticiler/[id]`, `/uretici/urunler`, `/uretici/urunler/yeni`, `/uretici/urunler/[id]/duzenle`. Üretici route'ları doğrulanmış producer oturumu gerektirir. SQL migration, RLS/Storage setup, route manifest ve generated Database types sürümlü dosyalarda tutulur. Migration yalnız geriye uyumlu kolon, indeks, upload kuralları ve güvenli RPC ekler; mevcut tabloları silmez/değiştirmez.
- Supabase kaynakları: [Storage Quickstart](https://supabase.com/docs/guides/storage/quickstart), [bucket MIME/size kısıtları](https://supabase.com/docs/guides/storage/buckets/creating-buckets), [public/private asset serving](https://supabase.com/docs/guides/storage/serving/downloads).

## Proje yapısı
- `app/`: Next.js App Router sayfaları, global stiller ve metadata; `/`, kayıt/giriş/parola/profil/hesabım sayfaları ve Auth callback route handler.
- `components/`: Navbar, hero, ürün keşif kartları, işleyiş/avantaj/güven bölümleri, CTA/footer ve paylaşılan auth shell/form/profil bileşenleri.
- `public/`: favicon ve statik, küçük marka varlıkları; büyük/üretilmiş görseller mümkün olduğunda proje managed storage yolundan sunulur.
- `app.config.ts`: WebDev proje logosu gibi platform metadata'sı.
- `public/manus-routes.json`: sayfa route envanteri; sadece gerçekten mevcut route'ları tanımlar.
- `plan.md` ve `TODO.md`: kararlar, tasarım sistemi ve tamamlanmamış ürün kapsamı.
- `lib/supabase/`: tarayıcı, çerez destekli sunucu istemcileri ve SSR session yenileme proxy'si; yalnız public ortam değişkeni kullanımı.
- `app/api/health/supabase/`: RLS kapsamındaki kategori tablosuna sınırlı sorgu ile ortam konfigürasyonu/bağlantı durumu kontrolü.
- `supabase/migrations/`: şema, RLS politikaları ve güvenli profil tamamlama RPC'sinin sürümlenmiş SQL değişiklikleri; mevcut gerçek proje ref'i `dmfcruizfwiuneilckji`.
- `supabase/README.md` ve `.env.example`: bağlantı/anahtar güvenliği ve sonraki dağıtım ortamlarının kurulum notları.
- Aşama 4 ekleri: `app/(marketplace)/urunler/` canlı pazaryeri ve dinamik ürün detayları, `app/(marketplace)/ureticiler/[producerId]/` açık profil, `app/(account)/uretici/urunler/` producer CRUD, `app/actions/products.ts` server action, `components/catalog/` arama/filtre/kart/karşılaştırma/form, `lib/catalog/` güvenli veri sorguları; SQL migration'lar ürün görsel yolu, Storage bucket/RLS (producer rolü ve kendi klasörü), bounded search RPC ve atomik `SECURITY INVOKER` product RPC'sini sürümler.

## Görsel yaklaşım

Karar verilmeden önce düşünülen üç tasarım yönü:
- Kırsal modernist editoryal — olasılık 0,04.
- İskandinav tarım teknolojisi minimalizmi — olasılık 0,03.
- **Neo-rural pazar defteri** — olasılık 0,06; seçilen yön.

### Tasarım hareketi

Neo-rural pazar defteri: çağdaş B2B ürün tasarımını tarımsal köken, saha dokusu ve editoryal anlatımla buluşturur. Eski hal defteri ve kasa etiketlerinden ilham alan düzen, dijital netlikle sadeleştirilir; nostaljik veya rustik dekorasyona dönüşmez.

### Temel ilkeler

1. **Güven ve açıklık:** ürün, miktar, kalite, üretim bölgesi ve lojistik maliyetini ayrı ve okunur göster.
2. **Üreticiye saygı:** fotoğraf ve metinlerde emeği, ürünü ve kökeni görünür kıl; platformu aracı kalabalığından arındır.
3. **Ticari netlik:** güçlü tipografik hiyerarşi, tanımlı CTA'lar ve hızlı ürün keşfi.
4. **Saha sıcaklığı, dijital hassasiyet:** doğal görseller ve toprak tonlarını yalın SaaS bileşenleriyle dengele.

### Renk felsefesi

Koyu doğal yeşil güven ve tarımsal uzmanlığı; açık yaprak yeşili taze arzı; kırık beyaz/krem alanlar ürün bilgisinin rahat okunmasını; sınırlı toprak/terracotta vurgusu hasat ve lojistik detaylarını anlatır. Kendi markasına ait imza renk derin orman-yeşili **#174D3A**; destek tonları **#5C8D54**, **#F5F3EA**, **#E7DDC9** ve kontrollü **#B96C45**.

### Yerleşim paradigması

Ortada tek, tekrarlayan eşit kutular yerine editoryal, asimetrik ve yatay bir akış: geniş saha görseli yanında metin; ardından arama/keşif şeridi; yatay kategori satırı ve değişen yoğunlukta içerik bölümleri. Üretici ile alıcı akışı sayfa içinde karşılıklı ve anlaşılır biçimde anlatılır. Mobilde akış tek kolona düşer; temel arama ve eylemler kolay erişilir.

### İmza unsurları

- Ürün kökeni ve kalite detaylarını çağrıştıran ince kasa-etiketi/hal fişi çizgileri.
- Tarladaki ekim sıralarından esinlenen kontrollü çizgisel bölücüler.
- Doğal ürün fotoğraflarını çerçeveleyen krem zemin ve küçük terracotta durum vurguları.

### Etkileşim ve hareket

İşlevsel, kısa ve sakin etkileşimler: menü açılışı, arama odağı, hover/focus durumları ve kategori seçimi. Düşük mesafeli fade/slide geçişleri (yaklaşık 160–220 ms) yalnızca anlam kattığında; prefers-reduced-motion saygısı. Gereksiz parallax, sürekli hareket ve ürün bilgisini geciktiren animasyon kullanılmaz.

### Tipografi sistemi

Başlıklarda karakterli, okunaklı bir editorial serif olan **DM Serif Display**; gövde, gezinme ve arayüzde **Manrope**. Başlıklar kısa, belirgin ve sıkı aralıklı; arayüz metni işlevsel, açık ve yeterli kontrastlı. Harf biçimi sayısal fiyat/miktar okumayı zorlaştırmayacak.

### Marka özü ve sesi

**Konumlandırma:** Üreticiyi profesyonel alıcıyla, fiyatı ve lojistiği görünür kılan doğrudan tarım tedarik ağı. Üç kişilik sıfat: güvenilir, üretken, şeffaf.

Marka sesi açık, sıcak ama profesyonel; kısa fiiller ve gerçek ticari fayda. Örnekler: “Ürünü kaynağından bulun.” “Hasadı görün, nakliyeyi birlikte planlayın.”

### Wordmark ve logo

Özgün işaret: üstten bakıldığında açılan ekim sıralarını ve bu sıraların birleştiği sade bir sofrayı/daireyi birleştiren, koyu yeşil çizgilerden oluşan kompakt sembol. Yanında özel aralıklı, güçlü wordmark “Tarladan Sofraya”; marka yazısı sembolden ayrı tutulur ve küçük ölçekte işaret tek başına okunabilir.

## Ana sayfa içerik mimarisi

1. Güven veren, kısa değer önerili header; pazar yeri ve üretici keşif bağlantıları; “Üretici ol” ve “Alıcı ol” eylemleri.
2. “Üreticiden doğrudan sofraya.” mesajlı geniş fotoğraf hero'su ve ürün/bölge arama girişi.
3. Kategoriler ve öne çıkan ürün örnekleri; demo içerikleri gerçek işlem veya doğrulanmış üretici gibi sunulmaz.
4. Üretici keşif alanı ve üreticiye/alıcıya ayrı değer önerileri.
5. Platformun nasıl çalıştığı: ürünü keşfet, siparişi netleştir, taşımayı planla.
6. Ayrı gösterilen lojistik ve nakliye maliyeti anlatımı; şeffaflık/doğrulama ilkeleri.
7. Üretici ve profesyonel alıcı için rol bazlı CTA'lar.
8. Sık sorulan sorular ve kapsamı abartmayan footer.

## Marka sesi örnekleri ve içerik doğruluğu

Gerçek fiyat, üretici adı, doğrulama rozeti, teslimat SLA'sı veya pazar istatistiği uydurulmaz. Taslak örnek ürünler açıkça örnek içerik olarak işaretlenir. İlk sürüm iletişim/üyelik çağrıları için gerçek çalışmayan işlemler başarı sonucu gibi gösterilmez; kullanıcıya hazır olmadığı anlaşılır biçimde sunulur.
