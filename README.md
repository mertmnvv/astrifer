# Astrifer

Kişiye özel yıldız haritası: kullanıcı bir tarih/saat/konum girer, o anın
astronomik olarak doğru gökyüzü render edilir. Dijital paylaşılabilir sayfa +
fiziksel poster/çerçeve olarak satılır.

## Yığın

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Astronomik hesaplama: [`astronomy-engine`](https://github.com/cosinekitty/astronomy) — gerçek efemeris
- Firebase (Firestore + Storage), Admin SDK üzerinden sunucu tarafı erişim
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
components/
  astrolab/             framework-agnostic canvas çizim katmanı (drawStarChart)
                         + React sarmalayıcı (StarChart)
  ui/                   paylaşılan form bileşenleri
lib/
  astronomy/            computeSky.ts — saf astronomi hesaplaması, render'dan bağımsız
  geocode/               yerleşik şehir listesi, saat dilimi dönüşümü
  firebase/              Admin SDK istemcisi (lib/firebase/admin.ts) + isFirebaseConfigured()
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
