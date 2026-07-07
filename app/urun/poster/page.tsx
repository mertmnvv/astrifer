import type { Metadata } from "next";
import { computeSky } from "@/lib/astronomy/computeSky";
import { DEMO_STAR_MAP } from "@/lib/starmaps";
import { PosterConfigurator } from "./PosterConfigurator";

export const metadata: Metadata = {
  title: "Poster & Çerçeve — Astrifer",
  description: "Kendi yıldız haritanı 300 DPI baskı kalitesinde posterde ya da çerçevede duvarına as.",
};

export default function PosterProductPage() {
  const sky = computeSky({
    date: DEMO_STAR_MAP.eventDateUtc,
    latitude: DEMO_STAR_MAP.latitude,
    longitude: DEMO_STAR_MAP.longitude,
  });

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 text-center sm:mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brass">Astrifer</p>
          <h1 className="mt-3 font-display text-3xl italic text-text sm:text-5xl">
            Duvarında sonsuza dek dursun.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-haze sm:text-base">
            300 DPI baskı kalitesinde, astrolab bezeliyle çerçevelenmiş yıldız
            haritan — poster olarak ya da hazır çerçevede.
          </p>
        </header>
        <PosterConfigurator sky={sky} previewLabel={`${DEMO_STAR_MAP.locationName} örnek gökyüzü`} />
      </div>
    </main>
  );
}
