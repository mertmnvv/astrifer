"use client";

import Link from "next/link";
import { CrossSell } from "@/components/CrossSell";
import { StarChart } from "@/components/astrolab/StarChart";
import { StarKeyLegend } from "@/components/astrolab/StarKeyLegend";
import { buildSkyLabels } from "@/components/astrolab/drawStarChart";
import { getSkyPalette, getTimedPalette } from "@/components/astrolab/palettes";
import { AtlasPanel } from "@/components/atlas/AtlasPanel";
import { LedgerRule } from "@/components/atlas/LedgerRule";
import { PageGate } from "@/components/journal/PageGate";
import { VoiceNote } from "@/components/journal/VoiceNote";
import { MusicToggle } from "@/components/ui/MusicToggle";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { CosmicCursorTrail } from "@/components/ui/CosmicCursorTrail";
import { computeSky } from "@/lib/astronomy/computeSky";
import { buildSkyNarrative } from "@/lib/astronomy/skyNarrative";
import { getCosmicEvents } from "@/lib/astronomy/cosmicEvents";
import type { StarMapRecord } from "@/lib/starmaps";
import { FirstMomentSection } from "./FirstMomentSection";
import { SkyFocusSection } from "./SkyFocusSection";
import { TitleReveal } from "./TitleReveal";
import { Timeline } from "./Timeline";

const SCENE_GAP = "mt-14 sm:mt-24";

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
  isInlinePreview?: boolean;
}

export function StarMapView({
  starMap,
  isPreview = false,
  isOwner = false,
  step,
  furthestStep,
  isInlinePreview = false,
}: StarMapViewProps) {
  const sky = computeSky({
    date: starMap.eventDateUtc,
    latitude: starMap.latitude,
    longitude: starMap.longitude,
  });

  const dateLabel = formatEventDate(starMap.eventDateUtc, starMap.timezone);
  const previewLabel = `${starMap.locationName} üzerinde ${dateLabel} anının gökyüzü`;
  const skyLog = buildSkyNarrative(sky);
  const palette = getTimedPalette(getSkyPalette(starMap.palette));
  const isGravur = palette.id === "gravur-atlas";
  // Shared per-theme style tokens — computed once instead of scattering
  // `isGravur ? x : y` across every element below.
  const t = {
    accentText: isGravur ? "text-gravur-copper" : "text-amber",
    accentBg: isGravur ? "bg-gravur-copper" : "bg-amber",
    accentBorder: isGravur ? "border-gravur-copper/40" : "border-amber/40",
    accentBorderSoft: isGravur ? "border-gravur-copper/20" : "border-amber/20",
    bannerBg: isGravur ? "bg-gravur-paper/95 text-gravur-ink" : "bg-void/90 text-text",
    bodyText: isGravur ? "text-gravur-ink-soft" : "text-subtle",
    panelBorder: isGravur ? "border-gravur-ink/10 bg-gravur-ink/[0.015]" : "border-amber/15 bg-amber/[0.02]",
    cardBorder: isGravur ? "border-gravur-ink/10 bg-gravur-paper/40" : "border-text/5 bg-text/[0.015]",
    keyLegendBorder: isGravur ? "border-gravur-ink/15 bg-gravur-ink/[0.025]" : "",
    lockOverlay: isGravur ? "border-gravur-copper/20 bg-gravur-paper-dim/80 text-gravur-ink" : "border-amber/20 bg-void/80 text-amber",
    dashedCard: isGravur
      ? "border-gravur-copper/40 bg-gravur-copper/[0.02] hover:bg-gravur-copper/[0.04]"
      : "border-amber/30 bg-amber/[0.02] hover:bg-amber/[0.04]",
    dashedIcon: isGravur
      ? "border-gravur-copper/40 bg-gravur-copper/5 text-gravur-copper group-hover:bg-gravur-copper group-hover:text-gravur-paper"
      : "border-amber/30 bg-amber/5 text-amber group-hover:bg-amber group-hover:text-ink",
    ctaHeading: isGravur ? "text-gravur-ink" : "text-text",
    videoCard: isGravur ? "border-gravur-ink/10 bg-gravur-ink/[0.02]" : "border-text/10 bg-text/[0.035]",
    ctaButton: isGravur
      ? "bg-gravur-copper text-gravur-paper shadow-[0_10px_40px_-12px_rgba(138,90,59,0.5)] hover:opacity-90"
      : "bg-gradient-to-br from-amber-light to-amber-deep text-ink shadow-[0_10px_40px_-12px_rgba(230,163,92,0.6)] hover:opacity-90",
  };
  const hasStarKey = buildSkyLabels(sky).length > 0;
  const editHref = `/create?${buildEditParams(starMap, step, furthestStep).toString()}`;
  const initialEntry = starMap.entries.find((entry) => entry.isInitial) ?? starMap.entries[0];
  const periodicEntries = starMap.entries.filter((entry) => entry !== initialEntry);

  return (
    <PageGate title={starMap.title} subtitle={`${dateLabel} · ${starMap.locationName}`} musicUrl={starMap.musicUrl} isGravur={isGravur}>
      {!isGravur && <CosmicCursorTrail />}
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

      {isPreview && !isInlinePreview && (
        <>
          <div className={`watermark-overlay ${isGravur ? "watermark-gravur" : ""}`} />
          <div className={`fixed inset-x-0 top-0 z-50 border-b px-4 py-3 backdrop-blur-md ${t.accentBorderSoft} ${t.bannerBg}`}>
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2.5">
                <span aria-hidden className={`h-1.5 w-1.5 shrink-0 animate-pulse rounded-full motion-reduce:animate-none ${t.accentBg}`} />
                <p className={`font-mono text-[10px] uppercase tracking-wider font-semibold ${t.accentText}`}>
                  Tasarım Önizleme Modu
                </p>
                <span aria-hidden className={`hidden h-3 w-px sm:inline ${isGravur ? "bg-gravur-copper/30" : "bg-amber/30"}`} />
                <p className={`hidden text-xs sm:inline ${t.bodyText}`}>
                  Sayfanızı kaydetmek için yan sekmedeki tasarım ekranına dönebilirsiniz.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={editHref}
                  className={`rounded-full border px-3.5 py-1.5 font-mono text-[9.5px] uppercase tracking-widest transition-colors ${t.accentBorder} ${
                    isGravur
                      ? "text-gravur-copper hover:bg-gravur-copper hover:text-gravur-paper"
                      : "text-amber hover:bg-amber hover:text-ink"
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
        isPreview && !isInlinePreview ? "pt-24 sm:pt-28" : ""
      }`}>
        {/* Sahne 1 — İsim ve an, gökyüzü henüz atmosferik arka planda */}
        <TitleReveal title={starMap.title} dateLabel={dateLabel} locationName={starMap.locationName} palette={palette} />

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

        {/* Kozmik Gökyüzü Olayları Kartı */}
        {sky && (() => {
          const cosmicEvents = getCosmicEvents(sky);
          return (
            <RevealOnScroll durationMs={1000} className={`${SCENE_GAP} w-full max-w-xl`}>
              <AtlasPanel padding="lg" className={`flex flex-col gap-4 text-center ${t.panelBorder}`}>
                <div className="flex flex-col items-center gap-1">
                  <p className={`font-mono text-[9.5px] uppercase tracking-[0.25em] ${t.accentText} flex items-center gap-1.5`}>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                      <circle cx="12" cy="12" r="2.5" />
                      <path strokeLinecap="round" d="M12 2v2M12 20v2M2 12h2M20 12h2M5.636 5.636l1.414 1.414M16.95 16.95l1.414 1.414M5.636 18.364l1.414-1.414M16.95 7.05l1.414-1.414" />
                    </svg>
                    <span>Kozmik Gökyüzü Olayları</span>
                  </p>
                  <div className={`w-[80px] h-[1px] ${isGravur ? "bg-gravur-copper/35" : "bg-amber/35"} mt-1.5`} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 text-left">
                  <div className={`p-3.5 rounded-xl border ${t.cardBorder}`}>
                    <p className={`font-mono text-[8.5px] uppercase tracking-wider ${t.accentText}`}>
                      Ay Evresi: {cosmicEvents.moonPhaseName}
                    </p>
                    <p className={`text-xs mt-1 leading-normal ${t.bodyText}`}>
                      {cosmicEvents.moonDescription}
                    </p>
                  </div>
                  {cosmicEvents.specialEvent ? (
                    <div className={`p-3.5 rounded-xl border ${t.cardBorder}`}>
                      <p className={`font-mono text-[8.5px] uppercase tracking-wider ${t.accentText}`}>
                        Gök Olayı: {cosmicEvents.specialEvent}
                      </p>
                      <p className={`text-xs mt-1 leading-normal ${t.bodyText}`}>
                        {cosmicEvents.specialEventDescription}
                      </p>
                    </div>
                  ) : (
                    <div className={`p-3.5 rounded-xl border ${t.cardBorder}`}>
                      <p className={`font-mono text-[8.5px] uppercase tracking-wider ${t.accentText}`}>
                        Meteor Görünümü
                      </p>
                      <p className={`text-xs mt-1 leading-normal ${t.bodyText}`}>
                        Gökyüzü berrak ve durgun, sakin akan yıldız ışıklarıyla kaplı.
                      </p>
                    </div>
                  )}
                </div>
              </AtlasPanel>
            </RevealOnScroll>
          );
        })()}

        {/* Yıldız Anahtarı — haritadaki numaralı yıldız/gezegen işaretlerini gerçek adlarına bağlar */}
        {hasStarKey && (
          <RevealOnScroll durationMs={1000} className={`${SCENE_GAP} w-full max-w-xl`}>
            <div className="relative">
              <AtlasPanel padding="lg" className={`text-center ${t.keyLegendBorder}`}>
                <StarKeyLegend sky={sky} palette={palette} className="mx-auto max-w-sm" />
              </AtlasPanel>
              {isPreview && (
                <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl border px-6 text-center backdrop-blur-[2px] ${t.lockOverlay}`}>
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
                  <p className={`font-mono text-[10px] font-bold uppercase tracking-[0.25em] ${t.accentText}`}>
                    Yıldız Anahtarı Önizlemesi
                  </p>
                  <p className={`mt-2 max-w-xs text-xs leading-relaxed ${t.bodyText}`}>
                    Haritadaki yıldızların tam listesi satın aldığınızda aktif olacaktır.
                  </p>
                </div>
              )}
            </div>
          </RevealOnScroll>
        )}

        {/* İlk An — kurucu andaki fotoğraflar, aşağıdaki büyüyen çizelgeden ayrı bir sahne */}
        {initialEntry && (initialEntry.photos.length > 0 || isPreview) && (
          <RevealOnScroll durationMs={1000} className={`${SCENE_GAP} w-full max-w-xl`}>
            <FirstMomentSection photos={initialEntry.photos ?? []} palette={palette} isPreviewMode={isPreview} editHref={editHref} />
          </RevealOnScroll>
        )}

        {/* Zaman Çizelgesi — kurucu an sonrası eklenen, büyüyen fotoğraf koleksiyonu, sahibiyse ekleme kontrolleriyle */}
        {(periodicEntries.length > 0 || isOwner) && (
          <div className={`${SCENE_GAP} w-full max-w-2xl`}>
            <Timeline
              slug={starMap.slug}
              createdAt={starMap.createdAt}
              entries={periodicEntries}
              palette={palette}
              isOwner={isOwner}
              isPreviewMode={isPreview}
            />
          </div>
        )}

        {/* Sesli / Görüntülü Mesaj */}
        {(starMap.videoUrl || starMap.voiceNoteUrl || isPreview) && (
          <RevealOnScroll durationMs={1000} className={`${SCENE_GAP} w-full max-w-lg flex justify-center`}>
            {starMap.videoUrl ? (
              <div className={`w-full max-w-md flex flex-col gap-3 rounded-2xl border p-5 backdrop-blur-md ${t.videoCard}`}>
                <video src={starMap.videoUrl} controls className="w-full rounded-xl bg-black shadow-lg" />
                <div className="flex items-center gap-2">
                  <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${isGravur ? "bg-gravur-copper animate-pulse" : "bg-amber animate-pulse"}`} />
                  <span className={`font-mono text-[9px] uppercase tracking-wider font-semibold ${isGravur ? "text-gravur-copper" : "text-amber"}`}>
                    Görüntülü Zaman Kapsülü Mesajı
                  </span>
                </div>
              </div>
            ) : starMap.voiceNoteUrl ? (
              <div className="w-full max-w-sm">
                <VoiceNote url={starMap.voiceNoteUrl} />
              </div>
            ) : (
              // Önizleme modu yer tutucusu — video/ses tercihine göre ikon ve metin değişir, kart aynı
              (() => {
                const isVideoPreferred = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("video") !== null;
                const iconPath = isVideoPreferred
                  ? "m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                  : "M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z";
                const heading = isVideoPreferred ? "Video Mesaj Eklenmedi" : "Sesli Mesaj Eklenmedi";
                const body = isVideoPreferred
                  ? "Görüntülü bir anı mesajı kaydetmek veya yüklemek ister misiniz?"
                  : "Sesli bir mesaj kaydetmek veya yüklemek ister misiniz?";

                return (
                  <Link
                    href={editHref}
                    className={`flex w-full ${isVideoPreferred ? "max-w-md" : "max-w-sm"} items-center gap-4 rounded-2xl border border-dashed px-5 py-4 transition-colors group text-left ${t.dashedCard}`}
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${t.dashedIcon}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-mono text-[9px] uppercase tracking-wider font-bold ${t.accentText}`}>{heading}</p>
                      <p className={`text-[11px] leading-normal mt-0.5 ${t.bodyText}`}>{body}</p>
                    </div>
                  </Link>
                );
              })()
            )}
          </RevealOnScroll>
        )}

        <RevealOnScroll durationMs={900} className={`${SCENE_GAP} flex w-full max-w-md flex-col items-center gap-6 text-center`}>
          <LedgerRule
            className="mx-auto max-w-[6rem]"
            ruleClassName={isGravur ? "border-gravur-ink/15" : "border-text/10"}
            accentClassName={t.accentText}
          />
          {isPreview ? (
            <>
              <p className={`font-display text-xl italic sm:text-2xl ${t.ctaHeading}`}>Beğendin mi?</p>
              <p className={`text-sm leading-relaxed ${t.bodyText}`}>
                Devam edip bu anı sepete ekleyebilir, dilediğin zaman düzenlemeye dönebilirsin.
              </p>
              <Link
                href={editHref}
                className={`rounded-full px-7 py-3.5 font-mono text-xs uppercase tracking-widest transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber ${t.ctaButton}`}
              >
                Düzenlemeye Dön
              </Link>
            </>
          ) : isOwner ? (
            <>
              <p className={`font-display text-xl italic sm:text-2xl ${t.ctaHeading}`}>
                Anını fiziksel bir ürüne dönüştür.
              </p>
              <p className={`text-sm leading-relaxed ${t.bodyText}`}>
                Bu gökyüzünü deri defterde sonsuza dek sakla.
              </p>
            </>
          ) : (
            <>
              <p className={`font-display text-xl italic sm:text-2xl ${t.ctaHeading}`}>Bu an burada, sonsuza dek.</p>
              <p className={`text-sm leading-relaxed ${t.bodyText}`}>
                Sen de sevdiğin bir anın gerçek gökyüzünü sonsuza dek sakla.
              </p>
              <Link
                href="/create"
                className={`rounded-full px-7 py-3.5 font-mono text-xs uppercase tracking-widest transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber ${t.ctaButton}`}
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
