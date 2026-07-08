import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { StarChart } from "@/components/astrolab/StarChart";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { MemoriesGallery } from "@/components/journal/MemoriesGallery";
import { PageGate } from "@/components/journal/PageGate";
import { VoiceNote } from "@/components/journal/VoiceNote";
import { MusicToggle } from "@/components/ui/MusicToggle";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { computeSky } from "@/lib/astronomy/computeSky";
import { buildSkyNarrative } from "@/lib/astronomy/skyNarrative";
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

function formatCoordinates(latitude: number, longitude: number): string {
  const lat = `${Math.abs(latitude).toFixed(2)}°${latitude >= 0 ? "K" : "G"}`;
  const lon = `${Math.abs(longitude).toFixed(2)}°${longitude >= 0 ? "D" : "B"}`;
  return `${lat} ${lon}`;
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
  const skyLog = buildSkyNarrative(sky);
  const palette = getSkyPalette(starMap.palette);

  return (
    <PageGate
      title={starMap.title}
      subtitle={`${dateLabel} · ${starMap.locationName}`}
      musicUrl={starMap.musicUrl}
    >
      <main className="flex min-h-screen flex-col items-center px-4 py-12 sm:px-8 sm:py-16">
        {/* Büyük yıldız haritası — sayfanın asıl kahramanı */}
        <div className="flex w-full max-w-2xl flex-col items-center text-center">
          <div className="aspect-square w-full">
            <StarChart sky={sky} label={previewLabel} className="h-full w-full" palette={palette} />
          </div>
          <h1 className="mt-6 font-display text-3xl italic text-text sm:text-4xl">{starMap.title}</h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-haze">
            {dateLabel} · {starMap.locationName}
          </p>
        </div>
        <ScrollCue />

        {/* O Günün Önemi */}
        <RevealOnScroll className="mt-16 w-full max-w-xl">
          <div className="rounded-lg bg-panel-navy/60 p-6 text-center sm:p-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-brass-dim">O Günün Önemi</p>
            <div className="mx-auto mt-4 h-px w-8 bg-brass-dim/60" />
            <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-haze">
              {formatCoordinates(starMap.latitude, starMap.longitude)} · {starMap.locationName.toUpperCase()}
            </p>
            {starMap.message && (
              <p className="mt-6 font-display text-lg italic leading-relaxed text-text">
                “{starMap.message}”
              </p>
            )}
            {skyLog && (
              <div className="mt-6 border-t border-brass-dim/20 pt-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-brass-dim">
                  Gökyüzü Kaydı
                </p>
                <p className="mt-1.5 font-display text-sm italic leading-relaxed text-haze">{skyLog}</p>
              </div>
            )}
          </div>
        </RevealOnScroll>

        {/* Anılarımız — panel + her fotoğraf kendi gecikmesiyle beliriyor */}
        {starMap.photos.length > 0 && (
          <div className="mt-16 w-full max-w-2xl">
            <MemoriesGallery title={starMap.title} photos={starMap.photos} />
          </div>
        )}

        {/* Sesli Mesaj */}
        {starMap.voiceNoteUrl && (
          <RevealOnScroll className="mt-16 w-full max-w-sm">
            <VoiceNote url={starMap.voiceNoteUrl} />
          </RevealOnScroll>
        )}

        {/* QR / Footer */}
        <RevealOnScroll className="mt-16 w-full max-w-sm">
          <div className="relative rounded-md bg-parchment px-8 py-9 shadow-2xl shadow-black/50">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-brass-dim via-brass to-brass-dim" />
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-brass-dim via-brass to-brass-dim" />
            <div className="flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt={`${shareUrl} adresine yönlenen QR kod`}
                width={96}
                height={96}
                className="animate-qr-glow motion-reduce:animate-none border border-ink/70"
              />
              <p className="text-center font-mono text-[10px] uppercase tracking-widest text-leather-lt">
                Okut ve gökyüzü
                <br />
                yeniden canlansın
              </p>
              <p className="font-display text-sm italic text-leather-lt">
                {shareUrl.replace(/^https?:\/\//, "")}
              </p>
              <MusicToggle />
            </div>
          </div>
        </RevealOnScroll>

        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-haze">Sen de o anın gökyüzünü sonsuza dek sakla.</p>
          <Link
            href="/create"
            className="rounded-full bg-brass px-6 py-3 font-mono text-xs uppercase tracking-widest text-void transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
          >
            Kendi Haritanı Oluştur
          </Link>
        </div>
      </main>
    </PageGate>
  );
}
