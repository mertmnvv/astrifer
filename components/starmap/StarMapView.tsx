"use client";

import Link from "next/link";
import { CrossSell } from "@/components/CrossSell";
import { StarChart } from "@/components/astrolab/StarChart";
import { StarKeyLegend } from "@/components/astrolab/StarKeyLegend";
import { buildSkyLabels } from "@/components/astrolab/drawStarChart";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { AtlasPanel } from "@/components/atlas/AtlasPanel";
import { LedgerRule } from "@/components/atlas/LedgerRule";
import { PageGate } from "@/components/journal/PageGate";
import { VoiceNote } from "@/components/journal/VoiceNote";
import { MusicToggle } from "@/components/ui/MusicToggle";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { computeSky } from "@/lib/astronomy/computeSky";
import { buildSkyNarrative } from "@/lib/astronomy/skyNarrative";
import type { StarMapRecord } from "@/lib/starmaps";
import { FirstMomentSection } from "./FirstMomentSection";
import { SkyFocusSection } from "./SkyFocusSection";
import { TitleReveal } from "./TitleReveal";
import { Timeline } from "./Timeline";

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

/**
 * "Düzenle"/"Düzenlemeye Dön" both send the visitor back to /create — this
 * builds the same query-param shape CreateForm's own buildShareParams()
 * produces, so its restore-from-URL effect can continue editing the
 * existing draft instead of handing back a blank form.
 */
function buildEditParams(starMap: StarMapRecord, step?: number, furthestStep?: number): URLSearchParams {
  const params = new URLSearchParams({
    title: starMap.title,
    message: starMap.message ?? "",
    location: starMap.locationName,
    lat: starMap.latitude.toString(),
    lon: starMap.longitude.toString(),
    timezone: starMap.timezone,
    date: starMap.eventDateUtc.toISOString(),
    palette: starMap.palette,
  });
  const initialEntry = starMap.entries.find((entry) => entry.isInitial) ?? starMap.entries[0];
  const photoUrls = (initialEntry?.photos ?? []).map((photo) => photo.url).filter((url): url is string => Boolean(url));
  if (photoUrls.length > 0) params.set("photos", photoUrls.join(","));
  if (starMap.voiceNoteUrl) params.set("voice", starMap.voiceNoteUrl);
  if (step) params.set("step", step.toString());
  if (furthestStep) params.set("furthestStep", furthestStep.toString());
  return params;
}

export interface StarMapViewProps {
  starMap: StarMapRecord;
  /** Preview from the configurator: swaps the footer CTA and shows a corner banner, no real page exists yet. */
  isPreview?: boolean;
  /** True only when a valid owner cookie was verified server-side — see app/s/[slug]/page.tsx. */
  isOwner?: boolean;
  step?: number;
  furthestStep?: number;
}

export function StarMapView({ starMap, isPreview = false, isOwner = false, step, furthestStep }: StarMapViewProps) {
  const sky = computeSky({
    date: starMap.eventDateUtc,
    latitude: starMap.latitude,
    longitude: starMap.longitude,
  });

  const dateLabel = formatEventDate(starMap.eventDateUtc, starMap.timezone);
  const previewLabel = `${starMap.locationName} üzerinde ${dateLabel} anının gökyüzü`;
  const skyLog = buildSkyNarrative(sky);
  const palette = getSkyPalette(starMap.palette);
  const isGravur = palette.id === "gravur-atlas";
  const hasStarKey = buildSkyLabels(sky).length > 0;
  const editHref = `/create?${buildEditParams(starMap, step, furthestStep).toString()}`;
  const initialEntry = starMap.entries.find((entry) => entry.isInitial) ?? starMap.entries[0];
  const periodicEntries = starMap.entries.filter((entry) => entry !== initialEntry);

  return (
    <PageGate title={starMap.title} subtitle={`${dateLabel} · ${starMap.locationName}`} musicUrl={starMap.musicUrl} isGravur={isGravur}>
      {isGravur ? (
        <>
          <div aria-hidden className="fixed inset-0 -z-20 bg-gravur-paper" />
          <div aria-hidden className="fixed inset-0 -z-10 opacity-[0.35] pointer-events-none select-none">
            <StarChart sky={sky} label={previewLabel} className="h-full w-full" palette={palette} showLabels={false} />
          </div>
        </>
      ) : (
        <>
          {/* Gökyüzü animasyonu — tüm sayfayı kaplayan sabit arka plan, atmosfer için soluk/bulanık; net "harita" aşağıdaki madalyonda */}
          <div aria-hidden className="fixed inset-0 -z-10 opacity-75 blur-[1.5px]">
            <StarChart sky={sky} label={previewLabel} className="h-full w-full" palette={palette} showLabels={false} />
          </div>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_40%,rgba(11,8,16,0.25)_0%,rgba(11,8,16,0.6)_66%,#0b0810_100%)]"
          />
        </>
      )}

      <div className="fixed bottom-4 left-4 z-30 sm:bottom-6 sm:left-6">
        <MusicToggle />
      </div>

      {isPreview && (
        <>
          <div className="watermark-overlay" />
          <div className={`fixed inset-x-0 top-0 z-50 border-b px-4 py-3 backdrop-blur-md ${
            isGravur 
              ? "border-gravur-copper/20 bg-gravur-paper/95 text-gravur-ink" 
              : "border-amber/20 bg-void/90 text-text"
          }`}>
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2.5">
                <span aria-hidden className={`h-1.5 w-1.5 shrink-0 animate-pulse rounded-full motion-reduce:animate-none ${
                  isGravur ? "bg-gravur-copper" : "bg-amber"
                }`} />
                <p className={`font-mono text-[10px] uppercase tracking-wider font-semibold ${
                  isGravur ? "text-gravur-copper" : "text-amber"
                }`}>
                  Tasarım Önizleme Modu
                </p>
                <span aria-hidden className={`hidden h-3 w-px sm:inline ${
                  isGravur ? "bg-gravur-copper/30" : "bg-amber/30"
                }`} />
                <p className={`hidden text-xs sm:inline ${
                  isGravur ? "text-gravur-ink-soft" : "text-subtle"
                }`}>
                  Sayfanızı kaydetmek için yan sekmedeki tasarım ekranına dönebilirsiniz.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={editHref}
                  className={`rounded-full border px-3.5 py-1.5 font-mono text-[9.5px] uppercase tracking-widest transition-colors ${
                    isGravur
                      ? "border-gravur-copper/40 text-gravur-copper hover:bg-gravur-copper hover:text-gravur-paper"
                      : "border-amber/40 text-amber hover:bg-amber hover:text-ink"
                  }`}
                >
                  Düzenle
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.close();
                    } catch {
                      // Fallback: window.close might be blocked
                    }
                  }}
                  className={`rounded-full px-3.5 py-1.5 font-mono text-[9.5px] uppercase tracking-widest transition-colors ${
                    isGravur
                      ? "bg-gravur-copper/10 text-gravur-ink-soft hover:bg-gravur-copper/20 hover:text-gravur-ink"
                      : "bg-amber/[0.08] text-muted hover:bg-amber/15 hover:text-bright"
                  }`}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <main className={`relative flex flex-col items-center px-4 py-12 sm:px-8 sm:py-16 ${
        isPreview ? "pt-24 sm:pt-28" : ""
      } ${
        isGravur ? "theme-gravur text-gravur-ink" : ""
      }`}>
        {/* Sahne 1 — İsim ve an, gökyüzü henüz atmosferik arka planda */}
        <TitleReveal title={starMap.title} dateLabel={dateLabel} locationName={starMap.locationName} />

        {/* Sahne 2 — kaydırdıkça netleşen/yakınlaşan gökyüzü madalyonu + o anın mesajı */}
        <SkyFocusSection
          sky={sky}
          previewLabel={previewLabel}
          palette={palette}
          coordsLabel={`${formatCoordinates(starMap.latitude, starMap.longitude)} · ${starMap.locationName.toUpperCase()}`}
          message={starMap.message}
          skyLog={skyLog}
          interactive={true}
          isPreviewMode={isPreview}
          title={starMap.title}
          dateLabel={dateLabel}
        />

        {/* Yıldız Anahtarı — haritadaki numaralı yıldız/gezegen işaretlerini gerçek adlarına bağlar */}
        {hasStarKey && (
          <RevealOnScroll durationMs={1000} className="mt-24 w-full max-w-xl">
            <div className="relative">
              <AtlasPanel padding="lg" className={`text-center ${isGravur ? "border-gravur-ink/15 bg-gravur-ink/[0.025]" : ""}`}>
                <StarKeyLegend sky={sky} palette={palette} className="mx-auto max-w-sm" />
              </AtlasPanel>
              {isPreview && (
                <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl border px-6 text-center backdrop-blur-[2px] ${
                  isGravur 
                    ? "border-gravur-copper/20 bg-gravur-paper-dim/80 text-gravur-ink" 
                    : "border-amber/20 bg-void/80 text-amber"
                }`}>
                  <svg
                    className={`mb-3 h-7 w-7 ${isGravur ? "text-gravur-copper/80" : "text-amber/80"}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <p className={`font-mono text-[10px] font-bold uppercase tracking-[0.25em] ${isGravur ? "text-gravur-copper" : "text-amber"}`}>
                    Yıldız Anahtarı Önizlemesi
                  </p>
                  <p className={`mt-2 max-w-xs text-xs leading-relaxed ${isGravur ? "text-gravur-ink-soft" : "text-subtle"}`}>
                    Haritadaki yıldızların tam listesi satın aldığınızda aktif olacaktır.
                  </p>
                </div>
              )}
            </div>
          </RevealOnScroll>
        )}

        {/* İlk An — kurucu andaki fotoğraflar, aşağıdaki büyüyen çizelgeden ayrı bir sahne */}
        {initialEntry && (initialEntry.photos.length > 0 || isPreview) && (
          <RevealOnScroll durationMs={1000} className="mt-24 w-full max-w-xl">
            <FirstMomentSection photos={initialEntry.photos ?? []} isPreviewMode={isPreview} editHref={editHref} />
          </RevealOnScroll>
        )}

        {/* Zaman Çizelgesi — kurucu an sonrası eklenen, büyüyen fotoğraf koleksiyonu, sahibiyse ekleme kontrolleriyle */}
        {(periodicEntries.length > 0 || isOwner) && (
          <div className="mt-24 w-full max-w-2xl">
            <Timeline
              slug={starMap.slug}
              createdAt={starMap.createdAt}
              entries={periodicEntries}
              isOwner={isOwner}
              isPreviewMode={isPreview}
            />
          </div>
        )}

        {/* Sesli Mesaj */}
        {(starMap.voiceNoteUrl || isPreview) && (
          <RevealOnScroll durationMs={1000} className="mt-24 w-full max-w-sm">
            {starMap.voiceNoteUrl ? (
              <VoiceNote url={starMap.voiceNoteUrl} />
            ) : (
              <Link
                href={editHref}
                className={`flex items-center gap-4 rounded-2xl border border-dashed px-5 py-4 transition-colors group text-left ${
                  isGravur
                    ? "border-gravur-copper/40 bg-gravur-copper/[0.02] hover:bg-gravur-copper/[0.04]"
                    : "border-amber/30 bg-amber/[0.02] hover:bg-amber/[0.04]"
                }`}
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                  isGravur
                    ? "border-gravur-copper/40 bg-gravur-copper/5 text-gravur-copper group-hover:bg-gravur-copper group-hover:text-gravur-paper"
                    : "border-amber/30 bg-amber/5 text-amber group-hover:bg-amber group-hover:text-ink"
                }`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-mono text-[9px] uppercase tracking-wider font-bold ${
                    isGravur ? "text-gravur-copper" : "text-amber"
                  }`}>
                    Sesli Mesaj Eklenmedi
                  </p>
                  <p className={`text-[11px] leading-normal mt-0.5 ${
                    isGravur ? "text-gravur-ink-soft" : "text-subtle"
                  }`}>
                    Sesli bir mesaj kaydetmek veya yüklemek ister misiniz?
                  </p>
                </div>
              </Link>
            )}
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
                href={editHref}
                className="rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-ink shadow-[0_10px_40px_-12px_rgba(230,163,92,0.6)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              >
                Düzenlemeye Dön
              </Link>
            </>
          ) : isOwner ? (
            <>
              <p className="font-display text-xl italic text-text sm:text-2xl">
                Anını fiziksel bir ürüne dönüştür.
              </p>
              <p className="text-sm leading-relaxed text-subtle">
                Bu gökyüzünü deri defterde sonsuza dek sakla.
              </p>
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
        {!isPreview && isOwner && (
          <div className="w-full max-w-2xl">
            <CrossSell exclude={["digital"]} />
          </div>
        )}
      </main>
    </PageGate>
  );
}
