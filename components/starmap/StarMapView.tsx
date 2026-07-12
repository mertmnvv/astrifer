import Link from "next/link";
import { StarChart } from "@/components/astrolab/StarChart";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { AtlasPanel } from "@/components/atlas/AtlasPanel";
import { LedgerRule } from "@/components/atlas/LedgerRule";
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
  /** Preview from the configurator: swaps the footer CTA and shows a corner banner, no real page exists yet. */
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
      {/* Gökyüzü animasyonu — tüm sayfayı kaplayan sabit arka plan */}
      <div className="fixed inset-0 -z-10">
        <StarChart sky={sky} label={previewLabel} className="h-full w-full" palette={palette} />
      </div>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(11,8,16,0.55)_66%,#0b0810_100%)]"
      />

      <div className="fixed bottom-4 left-4 z-30 sm:bottom-6 sm:left-6">
        <MusicToggle />
      </div>

      {isPreview && (
        <div className="fixed right-4 top-4 z-40 sm:right-6 sm:top-6">
          <div className="flex items-center gap-2.5 rounded-full border border-amber/40 bg-void/80 px-3.5 py-2 shadow-lg shadow-black/40 backdrop-blur-sm">
            <span aria-hidden className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-amber motion-reduce:animate-none" />
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-amber">Önizleme</span>
            <span aria-hidden className="h-3 w-px bg-amber/30" />
            <Link
              href="/create"
              className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted underline underline-offset-2 transition-colors hover:text-amber"
            >
              Düzenle
            </Link>
          </div>
        </div>
      )}

      <main className="relative flex flex-col items-center px-4 py-12 sm:px-8 sm:py-16">
        <div className="flex min-h-[100dvh] w-full max-w-2xl flex-col items-center justify-center text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-dim">Astrifer Zaman Kapsülü</p>
          <h1 className="mt-5 font-display text-4xl italic leading-tight text-bright sm:text-6xl">{starMap.title}</h1>
          <LedgerRule className="mx-auto mt-6 max-w-[8rem]" />
          <p className="mt-6 font-mono text-xs uppercase tracking-widest text-amber">
            {dateLabel} · {starMap.locationName}
          </p>
          <div className="mt-12">
            <ScrollCue />
          </div>
        </div>

        {/* O Günün Önemi */}
        <RevealOnScroll durationMs={1000} className="mt-24 w-full max-w-xl">
          <AtlasPanel padding="lg" className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">O Günün Önemi</p>
            <LedgerRule className="mx-auto mt-4 max-w-[8rem]" />
            <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-subtle">
              {formatCoordinates(starMap.latitude, starMap.longitude)} · {starMap.locationName.toUpperCase()}
            </p>
            {starMap.message && (
              <p className="mt-7 font-display text-lg italic leading-relaxed text-text sm:text-xl">
                &ldquo;{starMap.message}&rdquo;
              </p>
            )}
            {skyLog && (
              <>
                <LedgerRule className="mx-auto mt-8 max-w-[10rem]" />
                <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.25em] text-dim">Gökyüzü Kaydı</p>
                <p className="mt-2 font-display text-sm italic leading-relaxed text-subtle">{skyLog}</p>
              </>
            )}
          </AtlasPanel>
        </RevealOnScroll>

        {/* Anılarımız — panel + her fotoğraf kendi gecikmesiyle beliriyor */}
        {starMap.photos.length > 0 && (
          <div className="mt-24 w-full max-w-2xl">
            <MemoriesGallery photos={starMap.photos} />
          </div>
        )}

        {/* Sesli Mesaj */}
        {starMap.voiceNoteUrl && (
          <RevealOnScroll durationMs={1000} className="mt-24 w-full max-w-sm">
            <VoiceNote url={starMap.voiceNoteUrl} />
          </RevealOnScroll>
        )}

        <RevealOnScroll durationMs={900} className="mt-24 flex w-full max-w-md flex-col items-center gap-6 text-center">
          <LedgerRule className="mx-auto max-w-[6rem]" />
          {isPreview ? (
            <>
              <p className="font-display text-xl italic text-text sm:text-2xl">Beğendin mi?</p>
              <p className="text-sm leading-relaxed text-subtle">
                Devam edip bu anı sepete ekleyebilir, dilediğin zaman düzenlemeye dönebilirsin.
              </p>
              <Link
                href="/create"
                className="rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-ink shadow-[0_10px_40px_-12px_rgba(230,163,92,0.6)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              >
                Düzenlemeye Dön
              </Link>
            </>
          ) : (
            <>
              <p className="font-display text-xl italic text-text sm:text-2xl">Bu an burada, sonsuza dek.</p>
              <p className="text-sm leading-relaxed text-subtle">
                Sen de sevdiğin bir anın gerçek gökyüzünü sonsuza dek sakla.
              </p>
              <Link
                href="/create"
                className="rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-ink shadow-[0_10px_40px_-12px_rgba(230,163,92,0.6)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              >
                Kendi Haritanı Oluştur
              </Link>
            </>
          )}
        </RevealOnScroll>
      </main>
    </PageGate>
  );
}
