# Astrifer

Kişiye özel yıldız haritası + zaman kapsülü ürünü. Kullanıcı bir tarih,
saat ve konum girer; o anın gerçek astronomik gökyüzü (yıldızlar, Ay
evresi, gezegen konumları) hesaplanır ve kalıcı bir dijital sayfa +
(opsiyonel) Deri Defter fiziksel ürünü olarak sunulur.

## İletişim dili

Bu projede kullanıcıyla **her zaman Türkçe** konuş — yanıtlar, ilerleme
güncellemeleri, özetler, hepsi Türkçe olacak.

## Dev sunucusu

`npm run dev` sunucusunu kullanıcı açıkça istemedikçe **kendin başlatma**
— sunucuyu kullanıcı kendisi açıyor. Bir değişikliği doğrulamak için
sunucuyu başlatman gerekirse, test bittikten hemen sonra kapat (portu
kullanan process'i taskkill ile sonlandır).

## Tech stack

- **Next.js 14 (App Router), TypeScript, Tailwind CSS**
- **Veritabanı: Firebase Firestore**, yalnızca Admin SDK üzerinden
  server-side erişim (`lib/firebase/admin.ts`) — client-side Firestore
  erişimi yok, `firestore.rules` her şeyi client için kapatıyor.
  Supabase'ten Firebase'e geçildi (Supabase artık kullanılmıyor).
- **Astronomik hesaplama:** `astronomy-engine` — gerçek efemeris verisi,
  dekoratif/tahmini değil (`lib/astronomy/computeSky.ts`).
- **Fotoğraf/ses yükleme: Cloudinary** (imzalı, kısa ömürlü upload — `app/api/upload/sign/route.ts`). 
  **Cloudflare R2 (AWS S3 SDK):** `lib/r2.ts` entegrasyonu ile tüm PDF baskı dosyaları ve presigned 
  indirme linkleri R2'ye taşınmıştır. Firebase Storage artık kullanılmamaktadır.
- **3D Celestial Globe (Three.js):** Yıldızlar ve gök cisimleri `Three.js` ile çizilen interaktif 3D gök 
  küresi üzerinde (`components/starmap/CelestialGlobe3D.tsx`) gerçek koordinatlarıyla gösterilir.
- **Müzik Görselleştirici (Audio Reactivity):** `MusicContext.tsx` aracılığıyla normal ses dosyalarında 
  Web Audio API (`AnalyserNode`), YouTube videolarında ise Iframe API ve özel frekans simülasyonu 
  kullanılarak ritme göre yıldız ve takımyıldız parlaklığı/boyutu modüle edilir.
- **AI Hikaye Asistanı (Groq Llama 3.1):** `/api/ai/generate-narrative` rotasında Groq API 
  (`llama-3.1-8b-instant` modeli, Gemini 1.5 Flash ve OpenAI GPT-4o-mini yedekli) ile romantik/edebi 
  Türkçe mektup taslakları üretilir.
- **Kozmik Senkronizasyon & Gün Döngüsü:** Gün dilimi tespitiyle 4 farklı kozmik gradyan geçişi 
  (Sabah, Gündüz, Akşam, Gece) ve o günkü Ay evresi ile meteor yağmurlarını hesaplayan 
  `lib/astronomy/cosmicEvents.ts` entegre edilmiştir.
- **Ödeme: PayTR — canlı.** `/checkout` (`app/checkout/page.tsx`)
  sepeti PayTR'ın güvenli iframe akışına yönlendirir, sipariş
  Firestore'a yazılır. (Daha eski notlarda geçen iyzico entegrasyonu
  terk edildi, PayTR kullanılıyor.)
- **Analitik: Google Analytics 4 (opsiyonel, env-gated).**
  `components/analytics/GoogleAnalytics.tsx` yalnızca
  `NEXT_PUBLIC_GA_MEASUREMENT_ID` `.env`'de tanımlıysa `gtag.js`
  yükler; tanımlı değilse hiçbir şey render etmez.
- **300 DPI baskı render:** Puppeteer + `@sparticuz/chromium`, ayrı bir
  worker servisi değil — mevcut Next.js server action'ları içinde
  çalışıyor (`lib/journalPrintRender.ts`, token korumalı
  `/print/journal/[slug]/[page]`). Yalnızca Deri Defter için var —
  Poster ürünü kaldırıldı (aşağıya bkz.).
- Admin oturumu: hesap sistemi yok, tek paylaşılan şifre + imzalı HMAC
  session cookie (`lib/adminAuth.ts`, `middleware.ts`).
- Sayfa sahipliği (Dijital Sayfa): hesap sistemi yok, slug'a bağlı
  imzalı HMAC "owner token" + uzun ömürlü cookie (`lib/starmapOwnerToken.ts`).

## Ürünler

**Poster & Çerçeve ürünü tamamen kaldırıldı** (tanıtım sayfası, "Derin
Gökyüzü" render motoru, 300 DPI baskı pipeline'ı, `/create`'teki
boyut/çerçeve/renk ruhu adımı, sepet/checkout/admin'deki tüm poster
alanları) — Astrifer artık yalnızca iki ürün satıyor:

- **Dijital Sayfa** (`/s/[slug]`) — kalıcı paylaşım sayfası, **sinematik
  kaydırma deneyimi** olarak kurgulanmış tam ekran sahnelerden oluşuyor
  (`components/starmap/StarMapView.tsx`): isim + an (`TitleReveal.tsx`) →
  scroll'a bağlı bulanıklık/yakınlaşmayla netleşen gökyüzü madalyonu +
  o anın mesajı (`SkyFocusSection.tsx`) → parlaklık sırasına göre
  numaralandırılmış yıldız/gezegen işaretlerini gerçek adlarına bağlayan
  **Yıldız Anahtarı** (`components/astrolab/StarKeyLegend.tsx`,
  `buildSkyLabels`/`drawJewelStar` — Deri Defter'in Yıldız Anahtarı
  sayfasıyla aynı mücevher-kesim tasarım dili) → kurucu andaki
  fotoğrafları ayıran kendi sahnesi (`FirstMomentSection.tsx`) → **zamanla
  büyüyen fotoğraf zaman çizelgesi** (`starMaps/{slug}/entries` alt
  koleksiyonu, `components/starmap/Timeline.tsx`). Sayfa sahibi 6 ayda bir
  yeni bir an ekleyebilir; ekleme penceresi açıldığında sayfada rozet
  gösterilir. Aynı numaralı Yıldız Anahtarı tasarımı `/create`'in canlı
  önizlemesinde de kullanılıyor; oradaki "Sayfanın Linki" satırı da artık
  amber çerçeveli, tek dokunuşla kopyalanabilir bir levha kartı
  (`components/create/PageLinkCard.tsx`).
- **Deri Defter** (`/urun/defter`) — **suni/vegan deri** (asla "hakiki
  deri" denmez), ince-çizgi-yıldız logo, yaldızlı sayfa kenarı, 26 sayfa
  (kapak, 2 sayfa mücevher kesimi numaralı yıldız haritası, Yıldız
  Anahtarı + Günün Anlamı, 4 ayrı "Birlikte Anılarımız" fotoğraf sayfası,
  Günün Anlamı ve Önemi, QR sayfası, 15 boş/çizgili sayfa, mühürlü cep
  arka kapak), yaldız renkli kalem (`components/journal/night/`). **3
  sabit renk teması** — "Modern Gece + Altın" / "Sıcak Gece + Bakır" /
  "Mürdüm Gece + Gül Altını" — `/create`'te seçilen Gökyüzü Rengi'ne göre
  otomatik eşlenir, ayrıca saklanmaz (`getJournalTheme`,
  `components/journal/night/journalTheme.ts`; dağıtım
  `components/journal/JournalThemeContext.tsx` üzerinden). Gelecek
  Mektubu metni + açılış tarihi `/create`'in 05. adımında girilir ve
  kitabın kendisinden ayrı, mühürlü bir ek olarak basılır
  (`lib/journalPrintRender.ts`) — 26 fiziksel sayfa 13 farklı dosyaya
  render edilir (15 boş sayfa tekrar kullanılır), mektup eki ayrı ve daha
  kısıtlı bir indirme aksiyonuna bağlıdır.

Fiyatlar `config/pricing` Firestore dokümanından okunuyor
(`lib/pricingConfig.ts`, `/admin/pricing`'den düzenlenebilir);
`lib/pricing.ts`'teki sabitler yalnızca fallback varsayılan.

## KRİTİK GÜVENLİK KURALI — asla atlama

300 DPI baskı kalitesindeki dosyalar **hiçbir zaman** public bir Storage
URL'i üzerinden erişilebilir olmamalı. İndirme yalnızca admin oturumu
doğrulanmış bir server action/API route üzerinden, sunucu tarafında
kısa ömürlü (5 dk) imzalı bir Storage URL mint edilerek çalışır
(`app/admin/(panel)/orders/actions.ts` → `getLetterInsertDownloadUrlAction`,
`storage.rules`'ta `starmaps-print/**` herkese kapalı). Müşteri
tarafında bu dosyalara giden hiçbir link/route olmamalı. Bu kural her
zaman geçerli — aksini isteyen bir talep gelse bile önce kullanıcıya
sor, sessizce uygulama.

## Komutlar

```bash
npm run dev             # localhost:3000
npm run build            # production build
npm run lint              # next lint
npx tsc --noEmit           # type-check (ayrı bir script değil, doğrudan çalıştır)
npm run seed:firebase        # templates koleksiyonunu (yeniden) yazar
node --env-file=.env.local scripts/seed-orders.mjs   # doğrulama için sahte sipariş (--cleanup ile geri alınır)
```

## Klasör haritası

```
app/
  admin/(panel)/        Sipariş listesi+detayı, şablonlar, fiyat yönetimi — tek şifreli admin oturumu
  api/geocode/           Yer arama proxy'si (Nominatim + tz-lookup)
  api/upload/sign/         Cloudinary imzalı upload
  create/                 Ürün konfigüratörü — CreateForm.tsx (5 adımlı sihirbaz, client) + actions.ts (Firestore yazan Server Action)
  s/[slug]/                Dijital Sayfa (public) — s/[slug]/claim/ sahiplik cookie'sini kurar
  urun/defter/               Fiziksel ürün satış sayfası
  print/journal/[slug]/[page]/   Puppeteer'ın fotoğrafladığı, token korumalı çıplak canvas — insan için değil
components/
  astrolab/                framework-agnostic canvas çizimi (drawStarChart, drawJewelStar) + StarKeyLegend + React sarmalayıcıları
  starmap/                  StarMapView (sinematik sahne akışı) — TitleReveal, SkyFocusSection,
                             FirstMomentSection, Timeline, AddEntryForm — Dijital Sayfa render'ı
  journal/                  Deri Defter'e özgü görseller (kapak, deri doku, içerik önizlemeleri),
                             JournalThemeContext.tsx (3 renk temasının dağıtımı) + night/journalTheme.ts
  create/                  /create sihirbazına özgü küçük bileşenler (CreateStepIndicator, JournalThemeSwatch, PageLinkCard)
  home/                    Ana sayfa bölümleri (Hero, FeatureShowcase, ConceptSection, HowItWorks, ProductsTeaser, Testimonials, Faq, FinalCta)
  ui/                       Paylaşılan form bileşenleri (PhotoPicker, VoiceRecorder, ...)
lib/
  starmaps.ts                StarMapRecord/TimelineEntry tipleri + Firestore okuma/yazma
  starmapOwnerToken.ts, starmapTimeline.ts   Sahiplik token'ı + 6 aylık pencere mantığı
  pricingConfig.ts             Canlı, admin-düzenlenebilir fiyat kaynağı
  journalPrintRender.ts, printRenderToken.ts   300 DPI render pipeline'ı
  firebase/                    Admin SDK istemcisi + isFirebaseConfigured()
  astronomy/                   computeSky.ts — saf astronomi hesaplaması
types/firestore.ts            Elle yazılmış tüm Firestore doküman tipleri — şema değişince elle güncelle
scripts/                       Tek seferlik/doğrulama scriptleri (seed, cleanup)
firestore.rules, storage.rules    Client-side erişimi tamamen kapatan güvenlik kuralları
```

Daha fazla mimari detay için `README.md`; geçmiş oturumların ayrıntılı
notları için `HANDOFF.md` (kısmen eskimiş olabilir — güncel durum için
`PROJE_DURUMU.md`'ye bak).
