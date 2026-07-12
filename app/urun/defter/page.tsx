import type { Metadata } from "next";
import Link from "next/link";
import { CoverPanel } from "@/components/journal/CoverPanel";
import {
  CoverPreview,
  FutureLetterPreview,
  GiltEdgePreview,
  GoldPenPreview,
  MemoriesPreview,
  PageStackPreview,
  QrPreview,
  SkyLogPreview,
  TitleSpreadPreview,
} from "@/components/journal/ContentPreviews";
import { computeSky } from "@/lib/astronomy/computeSky";
import { buildSkyNarrative } from "@/lib/astronomy/skyNarrative";
import { formatTRY } from "@/lib/pricing";
import { getPricingConfig } from "@/lib/pricingConfig";
import { DEMO_STAR_MAP } from "@/lib/starmaps";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deri Defter — Astrifer",
  description: "Kapağında adın, içinde o anın gerçek gökyüzü — vegan deri ciltli, 30 sayfalık kişiye özel bir defter.",
};

export default async function JournalProductPage() {
  const sky = computeSky({
    date: DEMO_STAR_MAP.eventDateUtc,
    latitude: DEMO_STAR_MAP.latitude,
    longitude: DEMO_STAR_MAP.longitude,
  });
  const narrative = buildSkyNarrative(sky);
  const dateLabel = new Intl.DateTimeFormat("tr-TR", {
    timeZone: DEMO_STAR_MAP.timezone,
    dateStyle: "long",
  }).format(DEMO_STAR_MAP.eventDateUtc);
  const { journalPrice } = await getPricingConfig();

  const orderParams = new URLSearchParams({ product: "journal", price: journalPrice.toString() });

  const CONTENTS = [
    { title: "Kapak — deri doku, kabartma Astrifer amblemi", preview: <CoverPreview title={DEMO_STAR_MAP.title} /> },
    {
      title: "Başlık sayfası + gerçek yıldız haritan",
      preview: (
        <TitleSpreadPreview
          title={DEMO_STAR_MAP.title}
          dateLabel={dateLabel}
          locationName={DEMO_STAR_MAP.locationName}
          sky={sky}
        />
      ),
    },
    { title: "Gökyüzü Kaydı — o anın Ay evresi ve gezegenleri", preview: <SkyLogPreview narrative={narrative} /> },
    {
      title: "Birlikte Anılarımız — kendi fotoğraflarınla (en fazla 4)",
      preview: <MemoriesPreview photos={DEMO_STAR_MAP.entries.flatMap((entry) => entry.photos)} />,
    },
    { title: "QR sayfası — dijital haritana anında bağlantı", preview: <QrPreview /> },
    { title: "30 boş / çizgili sayfa — kendi sözleriniz için", preview: <PageStackPreview /> },
    {
      title: "Altın yaldızlı sayfa kenarı — antika atlas ciltlerinden ince altın/pirinç şerit",
      preview: <GiltEdgePreview />,
    },
    { title: "Gelecek Mektubu — mühürlü cep, arka kapakta dikili", preview: <FutureLetterPreview /> },
    { title: "Altın renkli kalem — ayrı paketlenmiş hediye", preview: <GoldPenPreview /> },
  ];

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col items-center text-center sm:mb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-amber">Deri Defter</p>
          <h1 className="mt-3.5 font-display text-3xl italic text-bright sm:text-5xl">
            Kapağında adın, içinde o an.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-subtle sm:text-base">
            Vegan deri ciltli, 30 sayfalık kişiye özel bir defter — kapakta gerçek
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
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {CONTENTS.map((item, index) => (
                  <div
                    key={item.title}
                    className="flex flex-col gap-2 rounded-2xl border border-text/10 bg-text/[0.035] p-2.5"
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden rounded-md">{item.preview}</div>
                    <p className="flex gap-1.5 text-[11px] leading-snug text-text">
                      <span className="shrink-0 font-mono text-[10px] text-amber">
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                      <span>{item.title}</span>
                    </p>
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
