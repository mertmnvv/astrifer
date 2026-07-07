import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { StarChart } from "@/components/astrolab/StarChart";
import { MusicToggle } from "@/components/ui/MusicToggle";
import { computeSky } from "@/lib/astronomy/computeSky";
import { getStarMapBySlug } from "@/lib/starmaps";

export const revalidate = 3600;

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://astrifer.com";
}

function formatEventDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: timezone,
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const starMap = await getStarMapBySlug(params.slug);
  if (!starMap) return {};

  const description = starMap.message ?? `${starMap.locationName} üzerindeki gerçek gökyüzü.`;
  return {
    title: `${starMap.title} — Astrifer`,
    description,
    openGraph: {
      title: `${starMap.title} — Astrifer`,
      description,
      url: `${siteUrl()}/s/${starMap.slug}`,
      type: "website",
    },
  };
}

export default async function SharedStarMapPage({
  params,
}: {
  params: { slug: string };
}) {
  const starMap = await getStarMapBySlug(params.slug);
  if (!starMap) notFound();

  const sky = computeSky({
    date: starMap.eventDateUtc,
    latitude: starMap.latitude,
    longitude: starMap.longitude,
  });

  const shareUrl = `${siteUrl()}/s/${starMap.slug}`;
  const qrDataUrl = await QRCode.toDataURL(shareUrl, {
    margin: 1,
    width: 240,
    color: { dark: "#2a2318", light: "#f3ecda" },
  });

  const dateLabel = formatEventDate(starMap.eventDateUtc, starMap.timezone);
  const previewLabel = `${starMap.locationName} üzerinde ${dateLabel} anının gökyüzü`;

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-12 sm:px-8 sm:py-16">
      <div className="flex w-full max-w-xl flex-col items-center text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brass">Astrifer</p>
        <h1 className="mt-3 font-display text-3xl italic text-text sm:text-4xl">{starMap.title}</h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-haze">
          {dateLabel} · {starMap.locationName}
        </p>

        <div className="mt-8 aspect-square w-full max-w-md">
          <StarChart sky={sky} label={previewLabel} className="h-full w-full" />
        </div>

        {starMap.message && (
          <p className="mt-8 max-w-md font-display text-xl italic leading-relaxed text-text">
            “{starMap.message}”
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {starMap.musicUrl && <MusicToggle src={starMap.musicUrl} />}
          <div className="flex flex-col items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt={`${shareUrl} adresine yönlenen QR kod`}
              width={96}
              height={96}
              className="rounded-md border border-brass-dim/40"
            />
            <span className="font-mono text-[10px] uppercase tracking-widest text-haze/70">
              {shareUrl.replace(/^https?:\/\//, "")}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center gap-3 border-t border-brass-dim/30 pt-8 text-center">
        <p className="text-sm text-haze">Sen de o anın gökyüzünü sonsuza dek sakla.</p>
        <Link
          href="/create"
          className="rounded-full bg-brass px-6 py-3 font-mono text-xs uppercase tracking-widest text-void transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
        >
          Kendi Haritanı Oluştur
        </Link>
      </div>
    </main>
  );
}
