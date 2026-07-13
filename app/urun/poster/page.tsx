import type { Metadata } from "next";
import { resolvePosterHeadline } from "@/components/astrolab/posterHeadline";
import { CrossSell } from "@/components/CrossSell";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { computeSky } from "@/lib/astronomy/computeSky";
import { formatCoords } from "@/lib/geo/formatCoords";
import { getPricingConfig } from "@/lib/pricingConfig";
import { getSiteUrl } from "@/lib/siteUrl";
import { DEMO_STAR_MAP } from "@/lib/starmaps";
import { PosterConfigurator } from "./PosterConfigurator";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Poster & Çerçeve — Astrifer",
  description: "Kendi yıldız haritanı 300 DPI baskı kalitesinde posterde ya da çerçevede duvarına as.",
};

export default async function PosterProductPage() {
  const sky = computeSky({
    date: DEMO_STAR_MAP.eventDateUtc,
    latitude: DEMO_STAR_MAP.latitude,
    longitude: DEMO_STAR_MAP.longitude,
  });
  const { posterSizes, frameOptions } = await getPricingConfig();

  const dateTimeLabel = new Intl.DateTimeFormat("tr-TR", {
    timeZone: DEMO_STAR_MAP.timezone,
    dateStyle: "long",
    timeStyle: "short",
  })
    .format(DEMO_STAR_MAP.eventDateUtc)
    .toUpperCase();
  const photoUrl = DEMO_STAR_MAP.entries.flatMap((entry) => entry.photos).find((photo) => photo.url)?.url ?? null;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen px-4 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
        <div className="mx-auto max-w-6xl">
          <header className="mb-8 flex flex-col items-center text-center sm:mb-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-amber">Poster &amp; Çerçeve</p>
            <h1 className="mt-3.5 font-display text-3xl italic text-bright sm:text-5xl">
              Duvarında sonsuza dek dursun.
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm text-subtle sm:text-base">
              300 DPI baskı kalitesinde, gerçek gökyüzünü yansıtan yıldız
              haritan — poster olarak ya da hazır çerçevede.
            </p>
          </header>
          <PosterConfigurator
            sky={sky}
            headline={resolvePosterHeadline("teklif")}
            names={DEMO_STAR_MAP.title}
            dateTimeLabel={dateTimeLabel}
            coordsLabel={formatCoords(DEMO_STAR_MAP.latitude, DEMO_STAR_MAP.longitude)}
            defaultMessage={DEMO_STAR_MAP.message ?? ""}
            photoUrl={photoUrl}
            qrUrl={`${getSiteUrl()}/s/${DEMO_STAR_MAP.slug}`}
            slug={DEMO_STAR_MAP.slug}
            posterSizes={posterSizes}
            frameOptions={frameOptions}
          />
          <CrossSell exclude="poster" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
