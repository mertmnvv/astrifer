import type { Metadata } from "next";
import Link from "next/link";
import { StarChart } from "@/components/astrolab/StarChart";
import { CoverPanel } from "@/components/journal/CoverPanel";
import { PhotoSlot } from "@/components/journal/PhotoSlot";
import { computeSky } from "@/lib/astronomy/computeSky";
import { formatTRY } from "@/lib/pricing";
import { getPricingConfig } from "@/lib/pricingConfig";
import { DEMO_STAR_MAP } from "@/lib/starmaps";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deri Defter — Astrifer",
  description: "Kapağında adın, içinde o anın gerçek gökyüzü — deri ciltli, 30 sayfalık kişiye özel bir defter.",
};

const CONTENTS = [
  "Kapak — deri doku, kabartma Astrifer amblemi",
  "Başlık sayfası + gerçek yıldız haritan",
  "Gökyüzü Kaydı — o anın Ay evresi ve gezegenleri",
  "Birlikte Anılarımız — kendi fotoğraflarınla (en fazla 4)",
  "QR sayfası — dijital haritana anında bağlantı",
  "30 boş / çizgili sayfa — kendi sözleriniz için",
  "Altın yaldızlı sayfa kenarı — antika atlas ciltlerinden ince altın/pirinç şerit",
  "Gelecek Mektubu — mühürlü cep, arka kapakta dikili",
  "Altın renkli kalem — ayrı paketlenmiş hediye",
];

const PHOTO_ROTATIONS = [-2.5, 2, 1.5, -2];

export default async function JournalProductPage() {
  const sky = computeSky({
    date: DEMO_STAR_MAP.eventDateUtc,
    latitude: DEMO_STAR_MAP.latitude,
    longitude: DEMO_STAR_MAP.longitude,
  });
  const { journalPrice } = await getPricingConfig();

  const orderParams = new URLSearchParams({ product: "journal", price: journalPrice.toString() });

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col items-center text-center sm:mb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-amber">Deri Defter</p>
          <h1 className="mt-3.5 font-display text-3xl italic text-bright sm:text-5xl">
            Kapağında adın, içinde o an.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-subtle sm:text-base">
            Deri ciltli, 30 sayfalık kişiye özel bir defter — kapakta gerçek
            yıldız haritan, içinde anılarınız için boş sayfalar.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr]">
          <div className="order-1 flex flex-col items-center gap-4">
            <div className="w-full max-w-xs">
              <CoverPanel title={DEMO_STAR_MAP.title} subtitle="Örnek kapak" />
            </div>
            <p className="text-center text-xs text-subtle">Örnek kapak önizlemesi</p>
          </div>

          <div className="order-2 flex flex-col gap-8">
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-dim">İçindekiler</p>
              <ol className="space-y-2">
                {CONTENTS.map((item, index) => (
                  <li key={item} className="flex gap-3 text-sm text-text">
                    <span className="font-mono text-xs text-amber">{(index + 1).toString().padStart(2, "0")}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col items-center gap-2 rounded-2xl border border-text/10 bg-text/[0.035] p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-dim">
                Yıldız haritası — iki sayfa birlikte tek gökyüzü
              </p>
              <div className="relative aspect-[2/1] w-full overflow-hidden rounded-md shadow-xl shadow-black/50">
                <StarChart sky={sky} label="Örnek gökyüzü" className="h-full w-full" showLabels={false} />
                {/* Ciltin ortadaki gölgesi — iki sayfanın birleşip tek gökyüzü oluşturduğu izlenimi */}
                <div className="pointer-events-none absolute inset-y-0 left-1/2 w-12 -translate-x-1/2 bg-gradient-to-r from-black/35 via-transparent to-black/35" />
                <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/60" />
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 rounded-2xl border border-text/10 bg-text/[0.035] p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-dim">Anılar sayfası</p>
              <div className="grid grid-cols-4 gap-3 p-2">
                {DEMO_STAR_MAP.photos.slice(0, 4).map((photo, index) => (
                  <div key={photo.caption} className="w-20">
                    <PhotoSlot photo={photo} rotateDeg={PHOTO_ROTATIONS[index % PHOTO_ROTATIONS.length]} />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-text/10 bg-text/[0.035] p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-subtle">Fiyat</span>
                <span className="font-display text-3xl italic text-amber">{formatTRY(journalPrice)}</span>
              </div>
              <p className="mt-1 text-[11px] text-dim">
                Kargo dahil. Üretim süresi 5-7 iş günü. Altın renkli kalem hediyeli.
              </p>
            </div>

            <Link
              href={`/checkout?${orderParams.toString()}`}
              className="w-full rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-6 py-3 text-center font-mono text-xs uppercase tracking-widest text-ink transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
            >
              Sipariş Ver
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
