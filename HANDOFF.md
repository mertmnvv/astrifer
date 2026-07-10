# Astrifer — Oturum Devir Notları

Bu dosya, önceki bir Claude Code oturumunda yapılan işleri özetler; yeni bir
oturuma/asistana context aktarmak için yazıldı. Repo: `c:\Mert\repo\astrifer`,
branch: `claude/astrifer-star-map-setup-nam82w`.

## Proje nedir

Next.js 14 (App Router) + TypeScript + Tailwind ile kişiye özel yıldız
haritası ürünü: kullanıcı tarih/saat/konum girer (`/create`), gerçek
astronomik verilerle (`astronomy-engine`) o anın gökyüzü hesaplanır, kalıcı
bir paylaşım sayfası (`/s/[slug]`) ve fiziksel poster/defter ürünü olarak
sunulur (fiziksel ürün kısmı henüz iskelet). Detaylı mimari için `README.md`.

## ⚠️ En kritik gotcha — önce bunu oku

**Firebase artık yapılandırılı** (`.env.local` doldu, aşağıda detay var).
Bu, `lib/starmaps.ts`'teki `getStarMapBySlug()`'ın davranışını değiştirdi:

- Firebase yapılandırılı **değilken**: her `/s/<herhangi-bir-slug>` otomatik
  olarak `DEMO_STAR_MAP` sahte verisini gösterirdi (bkz. `lib/starmaps.ts:74-77`).
- Firebase yapılandırılı **iken** (şu an bu durumdayız): kod gerçek
  Firestore'daki `starMaps` koleksiyonuna bakar. O koleksiyonda **hiç doküman
  yok** (sadece `templates` koleksiyonu seed edildi) — yani şu an
  `/s/ornek` gibi bir slug ziyaret edilirse **404 (`notFound()`) döner**,
  demo veri artık görünmez.

Yeni bir AI bu davranış değişikliğini bilmeden "neden `/s/[slug]` bozuldu"
diye şaşırabilir. Kalıcı çözüm: `/create → /checkout` akışının gerçekten bir
`starMaps` dokümanı yazması gerekiyor (şu an yazmıyor, bkz. "Yapılmayanlar").
Geçici çözüm: Firestore'a elle bir `starMaps/ornek` dokümanı eklemek ya da
test için `.env.local`'daki Firebase satırlarını geçici olarak yorum satırı
yapmak.

## Bu oturumda yapılanlar (kronolojik)

### 1. `/create` sayfası yeniden tasarlandı
Ana sayfada (`app/page.tsx`, önceki bir oturumda yapılmış) kurulan paylaşılan
pazarlama tasarım dili `/create`'e taşındı: `SiteHeader`/`SiteFooter`, eyebrow
+ italik başlık deseni, `RevealOnScroll` giriş animasyonu, form alanları tek
bir panel kartında gruplandı.
- Değişen dosyalar: `app/create/page.tsx`, `app/create/CreateForm.tsx`
- Commit: `256456a`

### 2. `/s/[slug]` paylaşım sayfası yeniden tasarlandı
Kullanıcı isteği: "kitap gibi açılsın, sonra bütün sayfa yıldızlarla dolsun,
aşağı kaydırdıkça yavaşça açılsın, müzik açılsın".
- `components/journal/PageGate.tsx` — kapak artık düz fade yerine
  framer-motion ile gerçek 3D `rotateY` (~1.15s, sol kenardan/spine'dan
  açılıyor, `backface-visibility: hidden` ile ~600ms'de kayboluyor).
  `prefers-reduced-motion` için düz fade'e düşüyor.
- `components/ui/Starfield.tsx` — yeni: sabit (fixed), tüm sayfayı kaplayan,
  160 yıldızlı ambient arka plan (deterministic seeded PRNG, SSR/hydration
  uyumlu). Sadece üstteki gerçek `StarChart` değil, tüm sayfa yıldızlı
  görünüyor.
- `components/ui/RevealOnScroll.tsx` — yeni opsiyonel `durationMs` prop'u
  eklendi (varsayılan 700ms); slug sayfasında 1000ms kullanılıyor, daha
  "yavaşça açılan" bir his için.
- Müzik zaten "Aç" butonuna basılınca başlıyordu (`MusicContext`), değişmedi.
- Commit: `09fa2ea`

### 3. Firebase entegrasyonu (Firestore)
- `.env.local` oluşturuldu (repo'da yok, `.gitignore`'da `.env*.local` zaten
  hariç). Gerçek servis hesabı bilgileri kullanıcı tarafından paylaşıldı
  (proje: `astrifer-app`).
- `npm run seed:firebase` çalıştırıldı → Firestore `templates` koleksiyonuna
  5 varsayılan şablon yazıldı. `/create` artık bunları gerçekten Firestore'dan
  çekiyor (fallback listesi değil) — doğrulandı.
- **Firebase Storage kurulmadı**: proje için hiç default bucket
  provision edilmemiş (`astrifer-app.appspot.com` ve
  `astrifer-app.firebasestorage.app` ikisi de yok — muhtemelen Console'da
  Storage hiç "Get started" ile açılmamış, ya da Blaze plana geçilmemiş).
  Bu yüzden 4. maddede Cloudinary'ye geçildi, Firebase Storage şu an
  **kullanılmıyor**.
- **`firestore.rules` / `storage.rules` deploy edilmedi**: `firebase deploy`
  hem CLI login (`firebase login` tarayıcı/OAuth ister, bu sandboxed ortamda
  TTY yok) hem de servis hesabının Service Usage API izni olmaması yüzünden
  bu oturumda tamamlanamadı. Kullanıcının kendi terminalinde şunu çalıştırması
  gerekiyor:
  ```bash
  firebase login
  firebase deploy --only firestore:rules,storage:rules --project astrifer-app
  ```
  Not: Admin SDK (sunucu tarafı, `lib/firebase/admin.ts`) zaten bu kurallardan
  bağımsız çalışıyor — sadece client-side Firestore/Storage erişimi olsaydı
  bu kurallar devreye girerdi (bu projede client-side erişim yok, her şey
  Admin SDK üzerinden server-side).
- Commit yok (ortam kurulumu, kod değişikliği değil) — `.env.local` zaten
  git'e girmiyor.

### 4. Cloudinary entegrasyonu (fotoğraf/sesli mesaj yükleme)
Firebase Storage'ın Blaze plan gerektirmesi nedeniyle ücretsiz alternatif
olarak seçildi (kullanıcı onayıyla). Önceden `PhotoPicker`/`VoiceRecorder`
sadece tarayıcı içi `URL.createObjectURL` önizlemesi yapıyordu, hiçbir yere
yüklemiyordu (bkz. eski kod yorumları) — şimdi gerçek bir upload pipeline var:

- `app/api/upload/sign/route.ts` — yeni API route. Cloudinary API secret'ı
  hiç client'a göndermeden, sadece o istek için geçerli kısa ömürlü bir
  imza üretir. İzin verilen klasörler sabit kodlu (`ALLOWED_FOLDERS`):
  `astrifer/starmaps/photos`, `astrifer/starmaps/voice`.
- `lib/cloudinary/config.ts`, `lib/cloudinary/uploadFile.ts` — server-only
  config + client-safe `uploadToCloudinary(file, folder)` helper (imza al →
  dosyayı doğrudan `api.cloudinary.com`'a POST et → `secure_url` dön).
- `components/ui/PhotoPicker.tsx`, `components/ui/VoiceRecorder.tsx` —
  `PickedPhoto`/`VoiceRecorderValue` tiplerine `status`
  (`uploading`/`done`/`error`) ve `url`/`remoteUrl` eklendi. Dosya seçilir
  seçilmez yerel önizleme + arka planda upload başlıyor; hata olursa
  "Yüklenemedi — tekrar dene" ile retry var.
- `app/create/CreateForm.tsx` — submit artık `photos.length` sayısı yerine
  gerçek Cloudinary URL'lerini (`photos` param, virgülle ayrılmış) ve
  `voice=1` flag'i yerine gerçek ses URL'sini checkout'a taşıyor. Herhangi
  bir yükleme devam ederken "Devam Et" butonu disabled + "Yükleniyor…"
  yazıyor; başarısız yükleme varsa submit engelleniyor.
- `app/checkout/page.tsx` — `photoCount`/`hasVoiceNote` yerine gerçek
  `photoUrls`/`voiceUrl` parse ediliyor (checkout hâlâ bir stub, sadece özet
  gösteriyor — bkz. aşağıda).
- Uçtan uca doğrulandı: `curl` ile imza+upload, Playwright ile gerçek
  `/create` arayüzünden dosya seçip checkout'a kadar (URL'de gerçek
  `res.cloudinary.com` linki göründü), `tsc` + `eslint` temiz.
- Commit: `7a00fb6`

## Ortam durumu (`.env.local`, repo'da değil)

| Değişken | Durum |
|---|---|
| `FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY` | Dolu, doğrulandı (Firestore okuma/yazma çalışıyor) |
| `FIREBASE_STORAGE_BUCKET` | **Boş** — bucket hiç provision edilmedi |
| `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` | Dolu, doğrulandı (uçtan uca upload test edildi) |
| `ADMIN_PASSWORD` | `0000` — sadece local test için, zayıf |
| `ADMIN_SESSION_SECRET` | Rastgele üretildi (`openssl rand -hex 32`) |
| `IYZICO_*`, `GEOCODING_API_KEY`, `PRINT_WORKER_*` | Boş, kullanılmıyor |

`.env.example` de yeni Cloudinary değişkenleriyle güncellendi (boş placeholder
olarak, gerçek değerler yok).

## Güvenlik notları

- Firebase servis hesabının private key'i bu oturumda kullanıcı tarafından
  sohbete yapıştırıldı. `.env.local`'a yazıldı (git'e girmiyor), ama sohbet
  geçmişinde durur — projeyi ciddiye alıyorsanız Firebase Console'dan bu
  service account key'i iptal edip yenisini oluşturmayı düşünün.
- Cloudinary tarafı daha güvenli kuruldu: API secret hep server-side kalıyor,
  client sadece kısa ömürlü imza alıyor.
- `ADMIN_PASSWORD=0000` gerçek bir deploy'dan önce mutlaka değiştirilmeli.

## Yapılmayanlar / bilinen eksikler (kapsam dışı bırakıldı)

- **Ödeme/checkout**: `/checkout` hâlâ bir stub (`"Ödeme akışı henüz
  bağlanmadı"` yazıyor) — iyzico entegrasyonu yok, sipariş/`starMaps`
  dokümanı oluşturan hiçbir API route yok. Bu yüzden "en kritik gotcha"
  bölümünde bahsedilen sorun var: gerçek bir yıldız haritası hiçbir zaman
  Firestore'a yazılmıyor.
- **Firestore/Storage rules deploy edilmedi** (yukarıda detay var).
- **Firebase Storage bucket'ı hiç kurulmadı** (Cloudinary'ye geçildiği için
  şu an gerekli olmayabilir — ama admin panelindeki 300dpi baskı varlığı
  (`starmaps-print/` path'i, `storage.rules`'ta tamamen kapalı) için ileride
  gerekebilir).
- **300dpi baskı render pipeline'ı** (Puppeteer worker) hiç başlamadı.
- **Checkout sayfasının kendisi tasarım güncellemesi almadı** (create ve
  slug sayfaları güncellendi, checkout hâlâ eski/sade stub tasarımda).

## Faydalı komutlar

```bash
npm run dev                    # localhost:3000 (dolu ise sıradaki boş porta kayar)
npm run seed:firebase          # templates koleksiyonunu tekrar yazar (idempotent)
node --env-file=.env.local scripts/seed-firestore.mjs   # aynısı, env dosyası açıkça belirtilerek
npx tsc --noEmit -p .          # type-check
npx next lint                  # eslint
```

## Önerilen sıradaki adımlar (öncelik sırasıyla)

1. Checkout/ödeme akışını gerçek hale getirmek — en azından `/checkout`'ta
   "siparişi tamamla" gibi bir aksiyonun bir `starMaps` Firestore dokümanı
   yazması (iyzico olmadan bile, "kritik gotcha"yı çözer).
2. Kullanıcının kendi terminalinde `firebase login` + rules deploy'u
   tamamlaması.
3. Checkout sayfasının görsel tasarımını create/slug ile aynı dile getirmek.
4. iyzico entegrasyonu.
