import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ContinueYourPageBanner } from "@/components/ContinueYourPageBanner";
import { CrossSell } from "@/components/CrossSell";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { BackCoverPage } from "@/components/journal/night/BackCoverPage";
import { EssayPage } from "@/components/journal/night/EssayPage";
import { MemoryPage } from "@/components/journal/night/MemoryPage";
import { NightCoverPage } from "@/components/journal/night/NightCoverPage";
import { QrPage } from "@/components/journal/night/QrPage";
import { StarKeyPage } from "@/components/journal/night/StarKeyPage";
import { StarMapSpreadPage } from "@/components/journal/night/StarMapSpreadPage";
import { pickNumberedStars, splitSkyByAzimuth } from "@/components/journal/starMapSpread";
import { ScaledPreview } from "@/components/ScaledPreview";
import { computeSky } from "@/lib/astronomy/computeSky";
import { buildSkyEssay, buildSkyNarrative } from "@/lib/astronomy/skyNarrative";
import { getSiteUrl } from "@/lib/siteUrl";
import { getPricingConfig } from "@/lib/pricingConfig";
import { DEMO_STAR_MAP, getStarMapBySlug } from "@/lib/starmaps";
import { ownerCookieName, verifyOwnerToken } from "@/lib/starmapOwnerToken";
import { JournalConfigurator } from "./JournalConfigurator";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deri Defter — Astrifer",
  description: "Kapağında adın, içinde o anın gerçek gökyüzü — premium suni deri ciltli, 26 sayfalık kişiye özel bir defter.",
};

const MEMORY_CAPTIONS = ["İlk “Merhaba”", "O Gece", "Yüzük", "Ailece"];

export default async function JournalProductPage({
  searchParams,
}: {
  searchParams: { slug?: string };
}) {
  const ownStarMap = searchParams.slug ? await getStarMapBySlug(searchParams.slug) : null;
  const ownerToken = ownStarMap ? cookies().get(ownerCookieName(ownStarMap.slug))?.value : undefined;
  const isVerifiedOwner = ownStarMap ? await verifyOwnerToken(ownStarMap.slug, ownerToken) : false;
  const source = isVerifiedOwner && ownStarMap ? ownStarMap : DEMO_STAR_MAP;

  const sky = computeSky({
    date: source.eventDateUtc,
    latitude: source.latitude,
    longitude: source.longitude,
  });
  const page1Stars = pickNumberedStars(splitSkyByAzimuth(sky, 0, 180), 6, 1);
  const page2Stars = pickNumberedStars(splitSkyByAzimuth(sky, 180, 360), 6, 7);
  const initialEntry = source.entries.find((entry) => entry.isInitial) ?? source.entries[0];
  const memoryPhotos = initialEntry?.photos ?? [];
  const qrUrl = `${getSiteUrl()}/s/${source.slug}`;
  const { journalPrice } = await getPricingConfig();

  const CONTENTS: { title: string; preview: React.ReactNode }[] = [
    { title: "Kapak — suni deri, altın yaldız ince-çizgi-yıldız logo ve isimler", preview: <NightCoverPage names={source.title} /> },
    { title: "Büyük Yıldız Haritası — 1. sayfa, mücevher kesimi numaralı yıldızlar", preview: <StarMapSpreadPage sky={sky} numberedStars={page1Stars} /> },
    { title: "Büyük Yıldız Haritası — 2. sayfa", preview: <StarMapSpreadPage sky={sky} numberedStars={page2Stars} /> },
    {
      title: "Yıldız Anahtarı + Günün Anlamı",
      preview: (
        <ScaledPreview designWidth={600} designHeight={800} className="h-full w-full">
          <StarKeyPage numberedStars={[...page1Stars, ...page2Stars]} narrative={buildSkyNarrative(sky)} widthPx={600} heightPx={800} />
        </ScaledPreview>
      ),
    },
    ...MEMORY_CAPTIONS.map((caption, index) => ({
      title: `Birlikte Anılarımız — ${caption}`,
      preview: <MemoryPage photo={memoryPhotos[index] ?? {}} caption={memoryPhotos[index]?.caption ?? caption} />,
    })),
    {
      title: "Günün Anlamı ve Önemi — uzun, düzyazı formatında",
      preview: (
        <ScaledPreview designWidth={600} designHeight={800} className="h-full w-full">
          <EssayPage essay={buildSkyEssay(sky)} widthPx={600} heightPx={800} />
        </ScaledPreview>
      ),
    },
    { title: "QR sayfası — dijital yaşayan sayfaya bağlantı", preview: <QrPage qrUrl={qrUrl} /> },
    { title: "15 boş / çizgili sayfa — kendi sözleriniz için", preview: <div className="flex h-full w-full items-center justify-center bg-[#05060d] text-center font-mono text-3xl italic text-amber">15</div> },
    { title: "Arka kapak — Gelecek Mektubu, mühürlü cep", preview: <BackCoverPage /> },
  ];

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen px-4 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
        <div className="mx-auto max-w-5xl">
          <header className="mb-8 flex flex-col items-center text-center sm:mb-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-amber">Deri Defter</p>
            <h1 className="mt-3.5 font-display text-3xl italic text-bright sm:text-5xl">
              Kapağında adın, içinde o an.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-subtle sm:text-base">
              Premium suni deri ciltli, 26 sayfalık kişiye özel bir defter — kapakta gerçek
              yıldız haritan, içinde anılarınız ve mühürlü bir gelecek mektubu.
            </p>
          </header>

          <ContinueYourPageBanner />

          <div className="mb-10">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-dim">İçindekiler</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {CONTENTS.map((item, index) => (
                <div key={item.title} className="flex flex-col gap-2 rounded-2xl border border-text/10 bg-text/[0.035] p-2.5">
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-md">{item.preview}</div>
                  <p className="flex gap-1.5 text-[11px] leading-snug text-text">
                    <span className="shrink-0 font-mono text-[10px] text-amber">{(index + 1).toString().padStart(2, "0")}</span>
                    <span>{item.title}</span>
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-amber">
              + Yanında altın renkli kalem gönderilir (ayrı paketleme)
            </p>
          </div>

          <JournalConfigurator names={source.title} journalPrice={journalPrice} slug={source.slug} />
          <CrossSell exclude="journal" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
