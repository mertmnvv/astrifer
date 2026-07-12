# Astrifer

Kişiye özel yıldız haritası + zaman kapsülü ürünü. Kullanıcı bir tarih,
saat ve konum girer; o anın gerçek astronomik gökyüzü (yıldızlar, Ay
evresi, gezegen konumları) hesaplanır ve kalıcı bir dijital sayfa +
(opsiyonel) fiziksel ürün olarak sunulur.

## Tech stack

- **Next.js 14 (App Router), TypeScript, Tailwind CSS**
- **Veritabanı: Firebase Firestore**, yalnızca Admin SDK üzerinden
  server-side erişim (`lib/firebase/admin.ts`) — client-side Firestore
  erişimi yok, `firestore.rules` her şeyi client için kapatıyor.
  Supabase'ten Firebase'e geçildi (Supabase artık kullanılmıyor).
- **Astronomik hesaplama:** `astronomy-engine` — gerçek efemeris verisi,
  dekoratif/tahmini değil (`lib/astronomy/computeSky.ts`).
- **Fotoğraf/ses yükleme: Cloudinary** (imzalı, kısa ömürlü upload —
  `app/api/upload/sign/route.ts`). Firebase Storage bucket'ı bu iş için
  kurulmadı (Blaze plan gerektiriyordu); Firebase Storage yalnızca 300
  DPI baskı dosyaları için kullanılıyor (aşağıya bkz.).
- **Ödeme: iyzico — henüz entegre değil.** `/checkout` bir stub;
  ödeme akışı ayrı bir işte bağlanacak. `.env`'de `IYZICO_*`
  değişkenleri var ama kod tarafında kullanılmıyor.
- **300 DPI baskı render:** Puppeteer + `@sparticuz/chromium`, ayrı bir
  worker servisi değil — mevcut Next.js server action'ları içinde
  çalışıyor (`lib/printRender.ts`, token korumalı `/print/[slug]`).
- Admin oturumu: hesap sistemi yok, tek paylaşılan şifre + imzalı HMAC
  session cookie (`lib/adminAuth.ts`, `middleware.ts`).
- Sayfa sahipliği (Dijital Sayfa): hesap sistemi yok, slug'a bağlı
  imzalı HMAC "owner token" + uzun ömürlü cookie (`lib/starmapOwnerToken.ts`).

## Ürünler

- **Dijital Sayfa** (`/s/[slug]`) — kalıcı paylaşım sayfası. Statik tek
  "an" değil, **zamanla büyüyen bir fotoğraf zaman çizelgesi**
  (`starMaps/{slug}/entries` alt koleksiyonu, `components/starmap/Timeline.tsx`).
  Sayfa sahibi 6 ayda bir yeni bir an ekleyebilir; ekleme penceresi
  açıldığında sayfada rozet gösterilir.
- **Poster & Çerçeve** (`/urun/poster`) — boyut × çerçeve konfigüratörü,
  300 DPI baskı.
- **Deri Defter** (`/urun/defter`) — **suni/vegan deri** (asla "hakiki
  deri" denmez), gofre kapak deseni, altın yaldızlı sayfa kenarı,
  mühürlü cep içinde "Gelecek Mektubu", altın renkli kalem, 30 sayfa,
  "Birlikte Anılarımız" fotoğraf sayfası (en fazla 4 foto).

Fiyatlar `config/pricing` Firestore dokümanından okunuyor
(`lib/pricingConfig.ts`, `/admin/pricing`'den düzenlenebilir);
`lib/pricing.ts`'teki sabitler yalnızca fallback varsayılan.

## KRİTİK GÜVENLİK KURALI — asla atlama

300 DPI baskı kalitesindeki dosyalar **hiçbir zaman** public bir Storage
URL'i üzerinden erişilebilir olmamalı. İndirme yalnızca admin oturumu
doğrulanmış bir server action/API route üzerinden, sunucu tarafında
kısa ömürlü (5 dk) imzalı bir Storage URL mint edilerek çalışır
(`app/admin/(panel)/orders/actions.ts` → `getPrintDownloadUrlAction`,
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
  create/                 Ürün konfigüratörü — CreateForm.tsx (client) + actions.ts (Firestore yazan Server Action)
  s/[slug]/                Dijital Sayfa (public) — s/[slug]/claim/ sahiplik cookie'sini kurar
  urun/poster/, urun/defter/   Fiziksel ürün satış sayfaları
  print/[slug]/              Puppeteer'ın fotoğrafladığı, token korumalı çıplak canvas — insan için değil
components/
  astrolab/                framework-agnostic canvas çizimi (drawStarChart) + React sarmalayıcıları
  starmap/                  StarMapView, Timeline, AddEntryForm — Dijital Sayfa render'ı
  journal/                  Deri Defter'e özgü görseller (kapak, deri doku, içerik önizlemeleri)
  ui/                       Paylaşılan form bileşenleri (PhotoPicker, VoiceRecorder, ...)
lib/
  starmaps.ts                StarMapRecord/TimelineEntry tipleri + Firestore okuma/yazma
  starmapOwnerToken.ts, starmapTimeline.ts   Sahiplik token'ı + 6 aylık pencere mantığı
  pricingConfig.ts             Canlı, admin-düzenlenebilir fiyat kaynağı
  printRender.ts, printRenderToken.ts   300 DPI render pipeline'ı
  firebase/                    Admin SDK istemcisi + isFirebaseConfigured()
  astronomy/                   computeSky.ts — saf astronomi hesaplaması
types/firestore.ts            Elle yazılmış tüm Firestore doküman tipleri — şema değişince elle güncelle
scripts/                       Tek seferlik/doğrulama scriptleri (seed, cleanup)
firestore.rules, storage.rules    Client-side erişimi tamamen kapatan güvenlik kuralları
```

Daha fazla mimari detay için `README.md`; geçmiş oturumların ayrıntılı
notları için `HANDOFF.md` (kısmen eskimiş olabilir — güncel durum için
`PROJE_DURUMU.md`'ye bak).
