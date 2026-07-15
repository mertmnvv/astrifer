# Proje Durumu — 15 Temmuz 2026

Bu dosya, projenin **güncel durumunu ve bekleyen işleri** takip etmek
için — `CLAUDE.md`'nin aksine zamanla değişmesi beklenir. Yapısal/kalıcı
bilgi için `CLAUDE.md`'ye, geçmiş oturum ayrıntıları için `HANDOFF.md`'ye
bakın (o dosya artık kısmen eskimiş — aşağıdaki maddeler güncel).

## Şu an commit/push edilmemiş değişiklikler

Working tree'de iki dosyada küçük, tamamlanmış değişiklik var (henüz
commit edilmedi):

- **`CLAUDE.md`** — içerik kodun güncel haline yetişti: "İletişim dili"
  bölümü eklendi (bu projede kullanıcıyla her zaman Türkçe konuşulacağı
  netleştirildi), Dijital Sayfa maddesi artık sinematik kaydırma
  deneyimini ve numaralı Yıldız Anahtarı tasarımını doğru anlatıyor,
  klasör haritasındaki `astrolab/`, `starmap/`, `create/` satırları
  gerçek dosya listesiyle (StarKeyLegend, drawJewelStar, TitleReveal,
  SkyFocusSection, FirstMomentSection, PageLinkCard) eşleşti. Fonksiyonel
  bir değişiklik değil, dokümantasyon kodu yakalıyor.
- **`components/journal/night/NightCoverPage.tsx`** — kapak sayfasındaki
  "Astrifer" yazısı ve isimler artık otomatik boyutlanan önizlemelerde
  (ürün sayfası, İçindekiler grid'i, `/create` küçük önizleme) container
  genişliğine göre küçülüyor; önceden sabit `text-base`/`text-lg` dar
  konteynerlerde taşıyordu. 300 DPI baskı pipeline'ının (`widthPx`/
  `heightPx` sabit verildiği çağrılar) tipografisi kasıtlı olarak
  dokunulmadan bırakıldı — `isFixedSize` kontrolü bu ayrımı yapıyor.

## Son yapılan değişiklikler (commit edilmiş, push edilmiş)

`git log` sırasına göre en yeniden eskiye, bir önceki güncellemeden bu yana:

1. **Deri Defter sayfa önizlemelerinde eksik "use client" direktifini
   ekle (63a7e56)** — `StarKeyPage`, `BackCoverPage`, `BlankPage`,
   `EssayPage`, `MemoryPage` kendi içlerinde `useJournalTheme()`
   çağırıyordu ama "use client" yoktu; `/urun/defter` gibi bir Server
   Component'ten doğrudan render edilince "useJournalTheme is not a
   function" hatasıyla çöküyorlardı. Düzeltildi.
2. **Dijital sayfayı sinematik kaydırma deneyimine dönüştür (1dbb9c6)** —
   `/s/[slug]` artık tam ekran sahnelerden oluşuyor: isim + an
   (`TitleReveal.tsx`) → scroll'a bağlı bulanıklık/yakınlaşmayla
   netleşen gökyüzü madalyonu (`SkyFocusSection.tsx`) → sırayla beliren
   Yıldız Anahtarı kodları → kurucu andaki fotoğrafları büyüyen Zaman
   Çizelgesi'nden ayıran kendi sahnesi (`FirstMomentSection.tsx`).
3. **/create önizlemesindeki sayfa linkini kopyalanabilir bir levha
   kartına çevir (1f540f0)** — "Sayfanın Linki" satırı düz gri metindi;
   artık amber çerçeveli bir kart, slug'ı vurgulu gösteriyor ve tek
   dokunuşla kopyalama butonu var (`components/create/PageLinkCard.tsx`).
4. **Yıldız haritasında isim yerine numaralı Yıldız Anahtarı tasarımı
   kullan (fb500e0)** — Canlı önizleme (`/create`) ve Dijital Sayfa
   artık parlak yıldız/Ay/gezegen adlarını doğrudan gökyüzüne yazmıyor:
   her biri parlaklık sırasına göre numaralandırılıyor
   (`buildSkyLabels`), yıldızlar Deri Defter'deki mücevher-kesim
   işaretiyle aynı dilde çiziliyor (`drawJewelStar`), Güneş/Ay/gezegenler
   kendi ikonlarını koruyup yanına küçük bir numara rozeti alıyor. Yeni
   `StarKeyLegend` bileşeni bu numaraları gerçek adlara bağlayan bir
   "Yıldız Anahtarı" listesi gösteriyor — fiziksel ürünün Yıldız Anahtarı
   sayfasıyla aynı tasarım dili dijital tarafa da taşındı.
5. **Deri Defter'e 3 sabit renk teması ekle, /create'i 5 adımlı
   sihirbaza çevir (f8f608f)** — "Modern Gece + Altın" / "Sıcak Gece +
   Bakır" / "Mürdüm Gece + Gül Altını" temaları artık seçilen Gökyüzü
   Rengi'ne göre otomatik eşleniyor (`getJournalTheme`,
   `JournalThemeContext` üzerinden dağıtılıyor) — tek sabit tema yerine.
   `/create` tek uzun form yerine adım göstergeli, doğrulamalı 5 adımlı
   bir sihirbaza dönüştü (`CreateStepIndicator.tsx`,
   `JournalThemeSwatch.tsx`).
6. **Mobil hamburger menüsünü kaldır, nav linklerini doğrudan göster
   (2f0fe86)** ve önceki **mobil hamburger düzeltmesi (5915db6)** —
   mobil navigasyon deneyi geri alınıp linkler doğrudan görünür hale
   getirildi.
7. **Poster & Çerçeve ürününü kaldır, Deri Defter'i tam kapsamlı tanıtım
   sayfasına çevir (17a87ff)** — bu, bir önceki oturumun en büyük mimari
   değişikliğiydi ve artık tamamen commit/push edilmiş durumda. Silinenler:
   `/urun/poster` sayfası ve ona giden tüm linkler; `/create`'teki
   "Fiziksel Olarak da Saklayın" adımının poster yarısı; render/baskı
   motoru (`PosterArt.tsx`, `PosterTextBand.tsx`, `PosterPrintFrame.tsx`,
   `drawNebulaSky.ts`, `drawDeepSkyField.ts`, `starColors.ts`,
   `sceneSeed.ts`, `nebulaMood.ts`, `posterHeadline.ts`,
   `lib/printRender.ts`, `app/print/[slug]/`, ölü kod `PrintStarChart.tsx`);
   şema/tipler (`OrderDoc.size/frameOption/posterColorMood/...`,
   `ProductType`'tan `"poster"`, `PricingConfigDoc`'tan
   `posterSizes/frameOptions`); admin paneldeki poster'a özel alanlar;
   `lib/pricing.ts`'teki poster sabitleri. `/urun/defter` bu geçişte
   minimal placeholder'dan tam 9 bölümlük vitrin sayfasına genişletildi.
   **Astrifer artık yalnızca iki ürün satıyor: Dijital Sayfa + Deri
   Defter.**

Bunlardan önceki commit geçmişi (gerçek sepet, çapraz satış, mobil
navigasyon ilk denemesi, Derin Gökyüzü yeniden tasarımı vb.) için önceki
oturum notlarına ve `git log`'a bakın.

## Yarım kalan / başlanmamış istek: Geçici manuel sipariş akışı

Kullanıcı bu oturumda **iyzico entegrasyonu gelene kadarki geçici bir
manuel sipariş akışı** istedi, ama talimat tamamlanmadan kesintiye
uğradı — **hiçbir kod yazılmadı**, sadece spesifikasyon aşağıda not
edildi ki bir sonraki oturumda kaldığı yerden devam edilebilsin:

1. "Sepete Ekle" / "Ödemeye Geç" basıldığında: sipariş (seçilen ürünler,
   fiyat, dijital sayfa verisi, varsa Deri Defter'in Gelecek Mektubu
   metni + açılış tarihi) Firestore'a **`durum: ödeme bekleniyor`**
   olarak kaydedilsin; bu adımda kullanıcıdan e-posta + telefon istensin;
   kullanıcıya net bir onay sayfası gösterilsin ("Siparişiniz alındı,
   ödeme talimatları e-posta ile gönderildi").
2. Kullanıcıya otomatik e-posta: sipariş özeti + toplam tutar + ödeme
   talimatı (IBAN/banka bilgisi ya da WhatsApp/telefon — **bu bilgi
   kullanıcıdan alınacak, hardcode edilmeyecek**) + "ödeme onaylandıktan
   sonra üretime başlanacak" notu.
3. Admin'e (kullanıcının kendisine) yeni sipariş bildirimi — e-posta/
   Slack, tercih sorulacak.
4. Admin panelde sipariş durumunu manuel güncelleme: "ödeme bekleniyor /
   ödendi / üretimde / kargolandı".

Kullanıcı, sipariş veri modelinin iyzico bağlandığında bu manuel adımın
yerini alacak şekilde esnek kurulmasını istedi — ödeme yöntemi alanı
ileride `"manuel"` veya `"iyzico"` gibi değerler alabilmeli. **Devam
etmeden önce sorulması gerekenler:** ödeme talimatında hangi IBAN/
WhatsApp numarası gösterilecek, admin bildirimi e-posta mı Slack mı
olsun, e-posta göndermek için hangi servis kullanılacak (proje şu an
hiçbir transactional e-posta servisine bağlı değil).

## Bilinen eksikler / TODO

- **Ödeme (iyzico) entegrasyonu hâlâ yok.** `/checkout` gerçek sepeti
  okuyup gösteriyor ama "Ödemeye Geç" butonu devre dışı. Bu hâlâ en
  büyük eksik — yukarıdaki geçici manuel akış bunun için planlanan
  köprü ama henüz uygulanmadı.
- **Deri Defter 300 DPI baskı pipeline'ı var (ÇÖZÜLDÜ)** —
  `lib/journalPrintRender.ts` ile 26 sayfa (13 benzersiz dosya) render
  ediliyor ve admin panelden indirilebiliyor.
- **Fiyat güncellemesi:** Admin panelden düzenleme altyapısı çalışıyor.
  Firestore'daki `config/pricing` dokümanı henüz kaydedilmediyse
  `lib/pricing.ts`'teki statik varsayılanlar kullanılıyor — bu sayıların
  gerçek maliyetleri yansıtıp yansıtmadığı ayrı bir soru (özellikle Deri
  Defter için, KBC Kutu teklifi bekleniyor, aşağıya bkz.).
- **SMS hatırlatma sistemi için İYS uyumluluğu henüz hukuki olarak teyit
  edilmedi.** Zaman çizelgesi "6 ayda bir yeni an ekleme" bildirimi şu an
  yalnızca sayfa içi rozet (`lib/starmapTimeline.ts` → `isAddWindowOpen()`);
  SMS gönderimi kasıtlı olarak kapsam dışı.
- **KBC Kutu'dan (deri defter üreticisi) gerçek maliyet teklifi henüz
  alınmadı — defter fiyatı tahmini.**
- **Domain satın alma durumu (astrifer.com / astrifer.net) —
  BİLİNMİYOR, kontrol edilmeli.** `NEXT_PUBLIC_SITE_URL` hâlâ
  `.env.local`'da `http://localhost:3000` (doğrulandı, 15 Temmuz).
- **`FIREBASE_STORAGE_BUCKET` `.env.local`'da hâlâ BOŞ** (doğrulandı, 15
  Temmuz). `FIREBASE_PROJECT_ID`/`FIREBASE_CLIENT_EMAIL`/
  `FIREBASE_PRIVATE_KEY` dolu ama storage bucket adı hiç girilmemiş.
  `lib/firebase/admin.ts` bu boş değeri `initializeApp({ storageBucket })`'a
  geçiriyor — `getBucket()` çağrıldığında (journal print pipeline'ı bunu
  kullanıyor) muhtemelen çalışma zamanında hata veriyor.
  `lib/firebase/isConfigured.ts` storage bucket'ı hiç kontrol etmiyor,
  yani uygulama "Firebase yapılandırılmış" deyip devam ediyor — hata
  yalnızca admin panelden bir baskı indirme tetiklendiğinde ortaya
  çıkıyor. **Aksiyon gerekiyor:** gerçek bucket adı Firebase
  Console'dan alınıp `.env.local`'a (ve deploy ortamına) girilmeli.
- **`firestore.rules` / `storage.rules` deploy edilip edilmediği hâlâ
  BİLİNMİYOR** — repoda hâlâ `.firebaserc` yok (doğrulandı, 15 Temmuz),
  bu makinede Firebase CLI kurulu değil. Firebase Console'dan ya da CLI
  kurup login olduktan sonra kontrol edilmeli.
- **`ADMIN_PASSWORD=0000`** — `.env.local`'da hâlâ zayıf bir test şifresi
  duruyor (doğrulandı, 15 Temmuz), gerçek bir deploy'dan önce
  değiştirilmeli.
