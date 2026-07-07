# Astrifer

Kişiye özel yıldız haritası: kullanıcı bir tarih/saat/konum girer, o anın
astronomik olarak doğru gökyüzü render edilir. Dijital paylaşılabilir sayfa +
fiziksel poster/çerçeve olarak satılır.

## Yığın

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Astronomik hesaplama: [`astronomy-engine`](https://github.com/cosinekitty/astronomy) — gerçek efemeris
- Supabase (Postgres + Auth + Storage)
- Ödeme: iyzico (planlanan)
- 300 DPI baskı render: Puppeteer, ayrı bir worker servisi olarak (planlanan)

## Klasör yapısı

```
app/                    route'lar (App Router)
  create/               ürün konfigüratörü (/create)
  s/[slug]/             paylaşılan yıldız haritası sayfası (iskelet)
  urun/poster/          fiziksel ürün satış sayfası (iskelet)
  api/geocode/          yer arama proxy'si (Nominatim + tz-lookup)
components/
  astrolab/             framework-agnostic canvas çizim katmanı (drawStarChart)
                         + React sarmalayıcı (StarChart)
  ui/                   paylaşılan form bileşenleri
lib/
  astronomy/            computeSky.ts — saf astronomi hesaplaması, render'dan bağımsız
  geocode/               yerleşik şehir listesi, saat dilimi dönüşümü
  supabase/              client/server/admin Supabase istemcileri
  templates.ts           Supabase erişilemediğinde kullanılan yedek şablon listesi
supabase/
  migrations/            şema (templates, star_maps, orders + storage bucket'ları + RLS)
  seed.sql               varsayılan şablonlar
types/
  supabase.ts            elle yazılmış Database tipi (supabase gen types ile değiştirin)
```

## Geliştirme

```bash
npm install
cp .env.example .env.local   # Supabase/iyzico anahtarlarını doldurun
npm run dev
```

Supabase env değişkenleri boşsa `/create` sayfası `lib/templates.ts` içindeki
yedek şablon listesiyle çalışır — yerel geliştirme için Supabase projesi şart
değildir.

## Güvenlik notu: 300dpi baskı varlığı

`starmaps-print` storage bucket'ı private'dır ve `storage.objects` üzerinde
anon/authenticated için hiçbir SELECT politikası yoktur. Baskıya hazır görsele
yalnızca service role ile çalışan sunucu taraflı kod (örn. bir Edge Function)
kısa ömürlü bir signed URL üreterek erişebilir; bu URL asla client'a kalıcı
olarak saklanmamalıdır.
