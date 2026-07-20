# Deri Defter — Fiziksel Numune Hazırlığı (bekleyen iş)

Bu not, Deri Defter'in gerçekten basılıp ciltlenebilir olup olmadığını
doğrulamak için yapılan inceleme ve kod değişikliklerinin özeti. Kaldığımız
yerden devam etmek için buraya bakılabilir.

## Durum tespiti (baskı pipeline'ı kontrolü)

`lib/journalPrintRender.ts`, `lib/printSizing.ts`, `lib/journalPrintPdf.ts`
incelendi:

- **İç sayfalar (26 sayfa + mektup eki):** 300 DPI'da doğru hesaplanıyor,
  Puppeteer ile PNG render edilip `pdf-lib` ile gerçek fiziksel boyutta
  (cm→pt) tek bir PDF'e gömülüyor. Teknik olarak bir matbaaya götürülebilir
  olgunlukta.
- **Trim (kesim) ölçüsü placeholder:** `JOURNAL_TRIM_CM = { width: 14.8,
  height: 21 }` (A5) — kodun kendi yorumunda da belirtildiği gibi *"gerçek
  fiziksel kitap boyutu onaylanana kadar placeholder"*. Henüz bir ciltçiyle
  teyit edilmedi.
- **Kapak/cilt üretimi için hiç dosya çıktısı yok:** Suni deri kapak, sıcak
  yaldız (gofre) baskı, altın yaldızlı sayfa kenarı, dikişli ciltleme ve
  arka kapaktaki mühürlü cep — bunların hiçbiri bu pipeline'dan çıkmıyor.
  Web'deki `NightCoverPage` yalnızca ekran gösterimi için bir canvas
  çizimi; sıcak baskı kalıbı (die/foil stamp artwork) gibi bir üretim
  dosyası yok. Bu, bir ciltçiyle birlikte ayrıca çözülmesi gereken bir konu.

## Yapılan kod değişikliği: bleed (taşma payı) eklendi

`lib/journalPrintPdf.ts`'de `assembleJournalPdf` artık:

- Her sayfayı trim ölçüsü + **3mm bleed** (`DEFAULT_BLEED_CM = 0.3`)
  boyutunda üretiyor, görüntüyü kenarlara taşacak şekilde ölçekliyor
  (sayfa bileşenleri bleed-aware olmadığı için basit bir "overscan" —
  kenar birkaç mm gerilir, ideal değil ama ilk numune için yeterli).
- Gerçek kesim çizgisini gösteren ince magenta bir **trim-mark** dikdörtgeni
  çiziyor, matbaanın nereden keseceği net olsun diye.

Bu, önceden **hiç bleed olmaması** eksikliğini gideriyor (kesim makinesi
kayarsa kenarda beyaz şerit/kırpılmış içerik riski vardı).

Trim ölçüsü hâlâ değiştirilmedi — gerçek ölçü bir ciltçiyle netleşene kadar
placeholder olarak kalması bilinçli bir tercih.

## Numune PDF'ini gerçekten üretmek için gereken adımlar (henüz yapılmadı)

Ortamda (`.env.local`) Firebase var ama şunlar eksik, bu yüzden pipeline
uçtan uca çalıştırılamadı:

1. **`PUPPETEER_EXECUTABLE_PATH`** — yerel bir Chrome/Chromium yolu
   (`lib/printBrowser.ts` prod dışında bunu zorunlu tutuyor).
2. **R2 env değişkenleri** — `lib/r2.ts`'e bakıp hangi anahtarların
   gerektiği doğrulanmalı (upload hedefi, üretilen PDF buraya yükleniyor).

Bunlar tanımlandıktan sonra:

3. `npm run dev` çalışırken `scripts/seed-orders.mjs` ile defter içeren
   sahte bir sipariş oluştur.
4. Admin panelde ilgili siparişin sayfasında "Baskı Dosyalarını Oluştur"
   aksiyonunu tetikle (`app/admin/(panel)/orders/actions.ts` →
   `renderJournalPrintFilesAction`, ki `lib/journalPrintRender.ts`'i
   çağırıyor) — artık bleed'li/trim-mark'lı PDF üretilip R2'ye yüklenecek,
   admin'den indirilebilecek.

## Ayrıca bu oturumda yapılan (ilgili ama ayrı) değişiklik

`components/journal/night/journalTheme.ts` yeniden düzenlendi: üretim
basitliği için **iç sayfa görünümü artık tüm renk seçeneklerinde sabit**
(`JOURNAL_INTERIOR` sabiti) — yalnızca kapağın deri rengi (`leather`
alanı) sipariş bazında değişiyor. Gerçek dünyada tek bir kağıt/yaldız
partisiyle çalışıp yalnızca dış deriyi farklı renklerde tedarik eden bir
ciltçi mantığına karşılık geliyor. 6 kapak rengi: Gece Lacivert, Kahve
Kestane, Mürdüm, Zümrüt Yeşili, Bordo, Mor Kadife — hepsi aynı altın
yaldız foil rengini paylaşıyor.

## (Ayrı konu) Site geneli performans/kasma optimizasyonu — 2026-07-20

Kullanıcı ayrı bir istekle "tüm sitede kasma/donma optimizasyonu, özellikle
mobilde" istedi. Bir Explore ajanıyla tarama yapıldı, öncelik sırasına göre
şu düzeltmeler uygulandı:

- **`CelestialGlobe3D` (Three.js) artık `next/dynamic({ ssr:false })` ile
  lazy-load ediliyor** — `components/home/Hero.tsx` ve
  `components/starmap/SkyFocusSection.tsx`'te. Önceden ana bundle'a gömülü
  olan ~600KB+ Three.js, artık yalnızca ilgili bileşen client'ta mount
  olunca indiriliyor. En büyük mobil TTI/FCP kazanımı bu.
- **`renderer.setPixelRatio` retina'da sınırsızdı** — `CelestialGlobe3D.tsx`
  artık `Math.min(devicePixelRatio, 1.75)` ile cap'leniyor (iPhone gibi
  DPR=3 cihazlarda GPU/fragman shader yükünü ciddi azaltıyor).
- **Cloudinary görselleri artık orijinal boyutta çekilmiyor** — yeni
  `lib/cloudinary/transformUrl.ts` (`cloudinaryTransform(url, widthPx)`)
  URL'e `w_,q_auto,f_auto,c_limit` transform segmenti ekliyor. Uygulandığı
  yerler: `MemoryPage.tsx`, `PhotoSlot.tsx` (thumbnail, 500px),
  `Lightbox.tsx` (büyütülmüş görünüm, 1400px), `DigitalProductClient.tsx`
  (400px), admin sipariş detay sayfası (500px). `PhotoPicker.tsx`'e
  dokunulmadı — orası hep yerel `blob:` URL kullanıyor, Cloudinary'ye hiç
  değmiyor.
- **`SkyFocusSection`'da "4 kopya CelestialGlobe3D" bulgusu yanlış alarmdı**
  — ajanın bulduğu 4 satırın 2'si `isGravur` dallanmasında (yalnızca biri
  render olur), 2'si `isZoomed &&` koşuluyla zaten lazy-mount ediliyor.
  Gerçek eşzamanlı mount sayısı en fazla 2 (ana + zoom modal), ekstra
  düzeltme gerekmedi.

**Yapılmadı / sonraki tur için:** next/image'e geçiş (next.config.mjs'de
hiç `images` config yok, proje genelinde tüm görseller ham `<img>`),
R2'den gelen dosyalar için transform/resize katmanı yok (öncelik düşük,
R2 şu an yalnızca admin-only 300 DPI baskı dosyaları için kullanılıyor),
ProductsTeaser'daki sabit Unsplash URL'i responsive değil (düşük öncelik).

## Sıradaki adım

Kullanıcı ile birlikte: env değişkenlerini tamamlayıp gerçek bir numune
PDF'i üretmek, sonra bunu bir ciltçiye/matbaaya göstererek trim ölçüsünü
ve kapak üretim yöntemini netleştirmek.
