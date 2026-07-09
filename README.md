# Astrifer

Kişiye özel yıldız haritası: kullanıcı bir tarih/saat/konum girer, o anın
astronomik olarak doğru gökyüzü render edilir. Dijital paylaşılabilir sayfa +
fiziksel poster/çerçeve olarak satılır.

## Yığın

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Astronomik hesaplama: [`astronomy-engine`](https://github.com/cosinekitty/astronomy) — gerçek efemeris
- Firebase (Firestore), Admin SDK üzerinden sunucu tarafı erişim
- Cloudinary — fotoğraf/sesli mesaj yüklemeleri (Firebase Storage'ın Blaze planı
  gerektirmesi nedeniyle ücretsiz alternatif olarak seçildi)
- Ödeme: iyzico (planlanan)
- 300 DPI baskı render: Puppeteer, ayrı bir worker servisi olarak (planlanan)

## Klasör yapısı

```
app/                    route'lar (App Router)
  create/               ürün konfigüratörü (/create)
  s/[slug]/             paylaşılan yıldız haritası sayfası (iskelet)
  urun/poster/          fiziksel ürün satış sayfası (iskelet)
  admin/                sipariş/şablon yönetim paneli (/admin) — bkz. aşağıda
  api/geocode/          yer arama proxy'si (Nominatim + tz-lookup)
  api/upload/sign/      Cloudinary imzalı upload için kısa ömürlü imza üretir
components/
  astrolab/             framework-agnostic canvas çizim katmanı (drawStarChart)
                         + React sarmalayıcı (StarChart)
  ui/                   paylaşılan form bileşenleri
lib/
  astronomy/            computeSky.ts — saf astronomi hesaplaması, render'dan bağımsız
  geocode/               yerleşik şehir listesi, saat dilimi dönüşümü
  firebase/              Admin SDK istemcisi (lib/firebase/admin.ts) + isFirebaseConfigured()
  cloudinary/            imzalı upload config + client helper (uploadFile.ts)
  templates.ts           Firestore erişilemediğinde kullanılan yedek şablon listesi
scripts/
  seed-firestore.mjs     varsayılan şablonları Firestore'a yazan tek seferlik script
types/
  firestore.ts            elle yazılmış doküman tipleri (templates/starMaps/orders)
firestore.rules          Firestore güvenlik kuralları
storage.rules            Storage güvenlik kuralları
firebase.json             Firebase CLI config (rules dosyalarına işaret eder)
```

## Geliştirme

```bash
npm install
cp .env.example .env.local   # Firebase/iyzico anahtarlarını doldurun
npm run dev
```

Firebase env değişkenleri boşsa `/create` sayfası `lib/templates.ts` içindeki
yedek şablon listesiyle çalışır — yerel geliştirme için Firebase projesi şart
değildir.

Gerçek bir Firebase projesine bağlanmak için:

```bash
firebase login
firebase use --add                          # proje ID'ni seç, .firebaserc oluşur (commit edilmez)
firebase deploy --only firestore:rules,storage:rules
npm run seed:firebase                        # varsayılan 5 şablonu Firestore'a yazar
```

`FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`,
Firebase Console → Project Settings → Service Accounts → "Generate new
private key" ile indirilen JSON'dan gelir. Vercel'de `FIREBASE_PRIVATE_KEY`'i
tek satırda `\n` kaçışlarıyla girin — `lib/firebase/admin.ts` bunları kendisi
gerçek satır sonlarına çevirir.

## Fotoğraf/sesli mesaj yüklemeleri (Cloudinary)

`/create` konfigüratöründeki fotoğraf ve sesli mesaj alanları, dosyayı
doğrudan tarayıcıdan Cloudinary'ye yükler — sunucu sadece kısa ömürlü bir
imza üretir (`app/api/upload/sign`), dosyanın kendisi hiçbir zaman bizim
sunucumuzdan geçmez. `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` /
`CLOUDINARY_API_SECRET` boşsa bu route 503 döner ve PhotoPicker/VoiceRecorder
yükleme başarısız olarak işaretlenir — konfigüratörün geri kalanı yine de
çalışır durumda kalır.

Kurulum: [cloudinary.com](https://cloudinary.com) üzerinde ücretsiz bir hesap
aç, Console ana sayfasındaki "Product Environment Credentials" bölümünden
Cloud Name / API Key / API Secret'ı `.env.local`'a kopyala. Ekstra bir
upload preset veya bucket oluşturmak gerekmiyor — izin verilen klasörler
`app/api/upload/sign/route.ts`'teki `ALLOWED_FOLDERS` listesinde sabit
kodlanmış.

## Admin paneli (/admin)

Siparişleri (`orders`) ve şablonları (`templates`) yönetmek için tek şifreli
bir panel. Kullanıcı hesabı sistemi yok — `ADMIN_PASSWORD` ile giriş yapılır,
imzalı bir session cookie'si (`lib/adminAuth.ts`, `middleware.ts`) 7 gün
geçerli kalır.

```bash
# .env.local
ADMIN_PASSWORD=güçlü-bir-şifre
ADMIN_SESSION_SECRET=rastgele-uzun-bir-değer   # openssl rand -hex 32
```

- `/admin` — özet: toplam sipariş, ciro, duruma göre dağılım
- `/admin/orders` — sipariş listesi; durum güncelleme (pending → paid → fulfilled → shipped) ve kargo takip numarası girme
- `/admin/templates` — şablonları aktif/pasif yapma, yeni şablon ekleme

Panel her sayfada Admin SDK üzerinden okuma/yazma yapar (client-side Firestore
erişimi yok), bu yüzden `firestore.rules`'taki `allow write: if false`
kuralları etkilenmez.

## Güvenlik notu: 300dpi baskı varlığı

`starmaps-print/` Storage path'i tamamen kapalıdır (`storage.rules`'ta
`allow read, write: if false`). Baskıya hazır görsele yalnızca Admin SDK ile
çalışan sunucu taraflı kod (örn. bir Route Handler) kısa ömürlü bir signed
URL üreterek erişebilir; bu URL asla client'a kalıcı olarak saklanmamalıdır.
