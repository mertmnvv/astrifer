"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { SkyPalette } from "@/components/astrolab/palettes";
import { LedgerRule } from "@/components/atlas/LedgerRule";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";

/** Three.js is ~600KB+ min — keep it out of the initial bundle, only fetch client-side once this section mounts. */
const CelestialGlobe3D = dynamic(
  () => import("./CelestialGlobe3D").then((mod) => mod.CelestialGlobe3D),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse bg-panel/40" /> },
);


export interface SkyFocusSectionProps {
  sky: ComputeSkyResult | null;
  previewLabel: string;
  palette: SkyPalette;
  coordsLabel: string;
  message?: string | null;
  skyLog?: string | null;
  interactive?: boolean;
  isPreviewMode?: boolean;
  title?: string;
  dateLabel?: string;
}

/**
 * The page's cinematic centerpiece: the star chart medallion with coordinates,
 * message and sky log. Fully visible on load — no scroll-linked animation.
 */
export function SkyFocusSection({
  sky,
  palette,
  coordsLabel,
  message,
  skyLog,
  title = "",
  dateLabel = "",
}: SkyFocusSectionProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const isGravur = palette.id === "gravur-atlas";
  const t = {
    plateBg: "bg-gravur-paper",
    plateBorder: "border-gravur-ink/10",
    ink: "text-gravur-ink",
    inkSoft: "text-gravur-ink-soft",
    copper: "text-gravur-copper",
  };

  if (isGravur) {
    return (
      <div className="flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4 text-center">
        <div
          className={`relative w-full max-w-[460px] sm:max-w-[520px] ${t.plateBg} p-2.5 sm:p-3.5 shadow-2xl shadow-black/50 border ${t.plateBorder}`}
        >
          <div className="relative border-[1.5px] border-gravur-ink px-4 py-5 sm:px-6 sm:py-6 flex flex-col">
            {/* Corner Ornaments */}
            <div className="absolute top-[-1.5px] left-[-1.5px] w-[22px] h-[22px]">
              <svg viewBox="0 0 22 22"><path d="M1 21 V6 Q1 1 6 1 H21" fill="none" stroke="#241F19" strokeWidth="1.2"/><circle cx="6" cy="6" r="1.5" fill="#8A5A3B"/></svg>
            </div>
            <div className="absolute top-[-1.5px] right-[-1.5px] w-[22px] h-[22px] scale-x-[-1]">
              <svg viewBox="0 0 22 22"><path d="M1 21 V6 Q1 1 6 1 H21" fill="none" stroke="#241F19" strokeWidth="1.2"/><circle cx="6" cy="6" r="1.5" fill="#8A5A3B"/></svg>
            </div>
            <div className="absolute bottom-[-1.5px] left-[-1.5px] w-[22px] h-[22px] scale-y-[-1]">
              <svg viewBox="0 0 22 22"><path d="M1 21 V6 Q1 1 6 1 H21" fill="none" stroke="#241F19" strokeWidth="1.2"/><circle cx="6" cy="6" r="1.5" fill="#8A5A3B"/></svg>
            </div>
            <div className="absolute bottom-[-1.5px] right-[-1.5px] w-[22px] h-[22px] scale-[-1]">
              <svg viewBox="0 0 22 22"><path d="M1 21 V6 Q1 1 6 1 H21" fill="none" stroke="#241F19" strokeWidth="1.2"/><circle cx="6" cy="6" r="1.5" fill="#8A5A3B"/></svg>
            </div>

            {/* Cartouche Header */}
            <div className="cartouche flex flex-col items-center mb-1">
              <div className="rule-top flex items-center justify-center gap-2.5 mb-1.5 w-full">
                <div className="w-11 h-[1px] bg-gravur-copper"></div>
                <svg viewBox="0 0 14 14" className="w-3.5 h-3.5 shrink-0"><path d="M7 0 L8.5 5.5 L14 7 L8.5 8.5 L7 14 L5.5 8.5 L0 7 L5.5 5.5 Z" fill="#8A5A3B"/></svg>
                <div className="w-11 h-[1px] bg-gravur-copper"></div>
              </div>
              <div className={`font-mono text-[9.5px] tracking-[0.16em] uppercase ${t.copper}`}>
                Levha No. {coordsLabel.split(" · ")[0] || "41°01′K"}
              </div>
            </div>

            {/* Starmap Box (3D Celestial Globe Only) */}
            <div className="relative w-full my-4 group">
              <div className={`w-full aspect-[4/3] overflow-hidden border border-gravur-ink shadow-sm ${t.plateBg} relative`}>
                <div className="w-full h-full relative">
                  <CelestialGlobe3D sky={sky} palette={palette} className="w-full h-full" />
                </div>
              </div>
              {/* Prominent Fullscreen Expand Button */}
              <button
                type="button"
                onClick={() => setIsZoomed(true)}
                className={`absolute -bottom-3 right-4 z-40 ${t.plateBg} border border-gravur-ink px-4 py-1.5 rounded-sm ${t.ink} hover:bg-gravur-ink/5 transition-all shadow-md flex items-center gap-1.5`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span className="font-mono text-[9.5px] tracking-widest uppercase font-bold">Genişlet</span>
              </button>
            </div>

            {/* Plate Name & Date */}
            <h2 className={`font-display font-medium text-2xl tracking-normal mb-1 font-gravur-serif ${t.ink}`}>
              {title}
            </h2>
            <div className={`font-display text-[11px] tracking-[0.06em] uppercase font-gravur-sc ${t.inkSoft}`}>
              {dateLabel}
            </div>

            {/* Separation Rule */}
            <div className="flex items-center justify-center gap-2 my-3">
              <div className="w-8 h-[1px] bg-gravur-ink"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gravur-copper"></div>
              <div className="w-8 h-[1px] bg-gravur-ink"></div>
            </div>

            {/* Plate Message */}
            {message && (
              <p className={`font-display italic text-[14.5px] leading-relaxed px-2 mb-4 font-gravur-serif ${t.inkSoft}`}>
                &ldquo;{message}&rdquo;
              </p>
            )}

            {/* Plate Foot */}
            <div className="flex justify-between items-center border-t border-gravur-ink pt-3.5 mt-2 w-full text-left">
              <div className={`font-display text-[10px] leading-normal uppercase font-gravur-sc ${t.inkSoft}`}>
                {coordsLabel.split(" · ")[1] || "ÜSKÜDAR İSTANBUL"}
              </div>
              <div className="w-9 h-9 shrink-0">
                <svg viewBox="0 0 40 40" className="w-full h-full">
                  <circle cx="20" cy="20" r="17" fill="none" stroke="#241F19" strokeWidth="1"/>
                  <circle cx="20" cy="20" r="12" fill="none" stroke="#241F19" strokeWidth=".5"/>
                  <path d="M20 4 L23 20 L20 36 L17 20 Z" fill="#241F19"/>
                  <path d="M4 20 L20 17 L36 20 L20 23 Z" fill="#8A5A3B"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {skyLog && (
          <div className="mt-10 flex max-w-md flex-col items-center gap-6">
            <LedgerRule className="mx-auto max-w-[8rem]" ruleClassName="border-gravur-ink/15" accentClassName={t.copper} />
            <div className="flex flex-col items-center gap-2">
              <p className={`font-mono text-[9px] uppercase tracking-[0.25em] ${t.copper}`}>Gökyüzü Kaydı</p>
              <p className={`font-display text-sm italic leading-relaxed font-gravur-serif ${t.inkSoft}`}>{skyLog}</p>
            </div>
          </div>
        )}

        {/* Fullscreen Zoom Lightbox Modal */}
        {isZoomed && (
          <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${t.plateBg} backdrop-blur-md`}>
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className={`absolute top-[max(1.5rem,env(safe-area-inset-top))] right-4 md:right-6 z-[110] bg-gravur-ink/10 rounded-full p-3 ${t.ink} hover:bg-gravur-ink/25 transition-colors`}
              aria-label="Kapat"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="w-full h-full relative">
              <CelestialGlobe3D sky={sky} palette={palette} className="w-full h-full" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-[100svh] w-full max-w-4xl flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-[9.5px] font-medium uppercase tracking-[0.38em] text-[rgb(var(--accent-rgb))]">
        O Anın Gökyüzü
      </p>
      <div className="relative mt-6 w-full max-w-3xl">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-10 -z-10 rounded-[2.5rem] animate-glow-pulse bg-[radial-gradient(60%_60%_at_50%_45%,rgb(var(--accent-rgb)/0.2),transparent_70%)]"
        />
        <div className="relative rounded-[2rem] border border-[rgb(var(--accent-rgb)/0.2)] bg-panel/30 p-2 backdrop-blur-md group">
          <div className="aspect-[4/3] sm:aspect-[16/10] overflow-hidden rounded-[1.6rem] border border-[rgb(var(--accent-rgb)/0.35)] shadow-[0_35px_90px_-30px_rgba(0,0,0,0.7)] relative">
            <CelestialGlobe3D sky={sky} palette={palette} className="w-full h-full" />
          </div>

          {/* Prominent Fullscreen Expand Button (Placed outside the overflow-hidden mask) */}
          <button
            type="button"
            onClick={() => setIsZoomed(true)}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-40 bg-nebula border border-[rgb(var(--accent-rgb)/0.4)] px-6 py-2.5 rounded-full text-[rgb(var(--accent-rgb))] hover:text-bright hover:bg-[rgb(var(--accent-rgb)/0.1)] transition-all shadow-[0_0_20px_rgb(var(--accent-rgb)/0.2)] flex items-center gap-2 backdrop-blur-md"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span className="font-mono text-[10px] tracking-widest uppercase font-medium">Genişlet</span>
          </button>
        </div>
      </div>


      <div
        className="mt-10 flex max-w-md flex-col items-center gap-6"
      >
        <p className="font-mono text-[11px] uppercase tracking-widest text-subtle">{coordsLabel}</p>
        {message && (
          <p className="font-display text-lg italic leading-relaxed text-text sm:text-xl">&ldquo;{message}&rdquo;</p>
        )}
        {skyLog && (
          <>
            <LedgerRule className="mx-auto max-w-[8rem]" />
            <div className="flex flex-col items-center gap-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[rgb(var(--accent-rgb))]">Gökyüzü Kaydı</p>
              <p className="font-display text-sm italic leading-relaxed text-subtle">{skyLog}</p>
            </div>
          </>
        )}
      </div>

      {/* Fullscreen Zoom Lightbox Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-nebula backdrop-blur-md">
          <button
            type="button"
            onClick={() => setIsZoomed(false)}
            className="absolute top-[max(1.5rem,env(safe-area-inset-top))] right-4 md:right-6 z-[110] bg-white/10 rounded-full p-3 text-white hover:bg-white/25 transition-colors"
            aria-label="Kapat"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="w-full h-full relative">
            <CelestialGlobe3D sky={sky} palette={palette} className="w-full h-full" />
          </div>
        </div>
      )}
    </div>
  );
}
