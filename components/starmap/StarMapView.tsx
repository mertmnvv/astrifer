import Link from "next/link";
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
import type { StarMapRecord } from "@/lib/starmaps";

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

export interface StarMapViewProps {
  starMap: StarMapRecord;
  /** Preview from the configurator: swaps the footer CTA and adds a banner, no real page exists yet. */
  isPreview?: boolean;
}

export function StarMapView({ starMap, isPreview = false }: StarMapViewProps) {
  const sky = computeSky({
    date: starMap.eventDateUtc,
    latitude: starMap.latitude,
    longitude: starMap.longitude,
  });

  const dateLabel = formatEventDate(starMap.eventDateUtc, starMap.timezone);
  const previewLabel = `${starMap.locationName} üzerinde ${dateLabel} anının gökyüzü`;
  const skyLog = buildSkyNarrative(sky);
  const palette = getSkyPalette(starMap.palette);

  return (
    <PageGate title={starMap.title} subtitle={`${dateLabel} · ${starMap.locationName}`} musicUrl={starMap.musicUrl}>
      {isPreview && (
        <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-center gap-3 bg-amber px-4 py-2 text-ink">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Önizleme — henüz kaydedilmedi</span>
          <Link href="/create" className="font-mono text-[10px] uppercase tracking-[0.2em] underline underline-offset-2">
            Düzenlemeye dön
          </Link>
        </div>
      )}
      {/* Gökyüzü animasyonu — tüm sayfayı kaplayan sabit arka plan */}
      <div className="fixed inset-0 -z-10">
        <StarChart sky={sky} label={previewLabel} className="h-full w-full" palette={palette} />
      </div>
      <main className="relative flex flex-col items-center px-4 py-12 sm:px-8 sm:py-16">
        <div className="flex min-h-[100dvh] w-full max-w-2xl flex-col items-center justify-center text-center">
          <h1 className="font-display text-3xl italic text-bright sm:text-4xl">{starMap.title}</h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-amber">
            {dateLabel} · {starMap.locationName}
          </p>
          <ScrollCue />
        </div>

        {/* O Günün Önemi */}
        <RevealOnScroll durationMs={1000} className="mt-16 w-full max-w-xl">
          <div className="rounded-[20px] border border-text/10 bg-text/[0.035] px-8 py-9 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">O Günün Önemi</p>
            <div className="mx-auto mt-4 h-px w-8 bg-amber/50" />
            <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-subtle">
              {formatCoordinates(starMap.latitude, starMap.longitude)} · {starMap.locationName.toUpperCase()}
            </p>
            {starMap.message && (
              <p className="mt-6 font-display text-lg italic leading-relaxed text-text">“{starMap.message}”</p>
            )}
            {skyLog && (
              <div className="mt-6">
                <div className="h-px bg-text/10" />
                <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.25em] text-dim">Gökyüzü Kaydı</p>
                <p className="mt-1.5 font-display text-sm italic leading-relaxed text-subtle">{skyLog}</p>
              </div>
            )}
          </div>
        </RevealOnScroll>

        {/* Anılarımız — panel + her fotoğraf kendi gecikmesiyle beliriyor */}
        {starMap.photos.length > 0 && (
          <div className="mt-16 w-full max-w-2xl">
            <MemoriesGallery photos={starMap.photos} />
          </div>
        )}

        {/* Sesli Mesaj */}
        {starMap.voiceNoteUrl && (
          <RevealOnScroll durationMs={1000} className="mt-16 w-full max-w-sm">
            <VoiceNote url={starMap.voiceNoteUrl} />
          </RevealOnScroll>
        )}

        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <MusicToggle />
          {isPreview ? (
            <>
              <p className="text-sm text-subtle">Beğendin mi? Devam edip sepete ekleyebilirsin.</p>
              <Link
                href="/create"
                className="rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-6 py-3 font-mono text-xs uppercase tracking-widest text-ink transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              >
                Düzenlemeye Dön
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-subtle">Sen de o anın gökyüzünü sonsuza dek sakla.</p>
              <Link
                href="/create"
                className="rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-6 py-3 font-mono text-xs uppercase tracking-widest text-ink transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              >
                Kendi Haritanı Oluştur
              </Link>
            </>
          )}
        </div>
      </main>
    </PageGate>
  );
}
