"use client";

import { useState } from "react";
import { CelestialGlobe3D } from "./CelestialGlobe3D";
import type { SkyPalette } from "@/components/astrolab/palettes";
import { LedgerRule } from "@/components/atlas/LedgerRule";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";


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

  if (isGravur) {
    return (
      <div className="flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-4 text-center">
        <div
          className="relative w-full max-w-[420px] bg-[#E4DFCD] p-3.5 shadow-2xl shadow-black/50 border border-[#241F19]/10"
        >
          <div className="relative border-[1.5px] border-[#241F19] px-6 py-6 flex flex-col">
            {/* Corner Ornaments */}
            <div className="absolute top-[-1.5px] left-[-1.5px] w-5.5 h-5.5">
              <svg viewBox="0 0 22 22"><path d="M1 21 V6 Q1 1 6 1 H21" fill="none" stroke="#241F19" strokeWidth="1.2"/><circle cx="6" cy="6" r="1.5" fill="#8A5A3B"/></svg>
            </div>
            <div className="absolute top-[-1.5px] right-[-1.5px] w-5.5 h-5.5 scale-x-[-1]">
              <svg viewBox="0 0 22 22"><path d="M1 21 V6 Q1 1 6 1 H21" fill="none" stroke="#241F19" strokeWidth="1.2"/><circle cx="6" cy="6" r="1.5" fill="#8A5A3B"/></svg>
            </div>
            <div className="absolute bottom-[-1.5px] left-[-1.5px] w-5.5 h-5.5 scale-y-[-1]">
              <svg viewBox="0 0 22 22"><path d="M1 21 V6 Q1 1 6 1 H21" fill="none" stroke="#241F19" strokeWidth="1.2"/><circle cx="6" cy="6" r="1.5" fill="#8A5A3B"/></svg>
            </div>
            <div className="absolute bottom-[-1.5px] right-[-1.5px] w-5.5 h-5.5 scale-[-1]">
              <svg viewBox="0 0 22 22"><path d="M1 21 V6 Q1 1 6 1 H21" fill="none" stroke="#241F19" strokeWidth="1.2"/><circle cx="6" cy="6" r="1.5" fill="#8A5A3B"/></svg>
            </div>

            {/* Cartouche Header */}
            <div className="cartouche flex flex-col items-center mb-1">
              <div className="rule-top flex items-center justify-center gap-2.5 mb-1.5 w-full">
                <div className="w-11 h-[1px] bg-[#8A5A3B]"></div>
                <svg viewBox="0 0 14 14" className="w-3.5 h-3.5 shrink-0"><path d="M7 0 L8.5 5.5 L14 7 L8.5 8.5 L7 14 L5.5 8.5 L0 7 L5.5 5.5 Z" fill="#8A5A3B"/></svg>
                <div className="w-11 h-[1px] bg-[#8A5A3B]"></div>
              </div>
              <div className="font-mono text-[8.5px] tracking-[0.16em] text-[#8A5A3B] uppercase">
                Levha No. {coordsLabel.split(" · ")[0] || "41°01′K"}
              </div>
            </div>

            {/* Starmap Box (3D Celestial Globe Only) */}
            <div
              className="w-full aspect-[4/3] overflow-hidden border border-[#241F19] my-4 shadow-sm bg-[#E4DFCD] relative group"
            >
              <div className="w-full h-full relative">
                <CelestialGlobe3D sky={sky} palette={palette} className="w-full h-full" />
                {/* Zoom badge at top right */}
                <button
                  type="button"
                  onClick={() => setIsZoomed(true)}
                  className="absolute top-2 right-2 z-30 bg-[#E4DFCD] border border-[#241F19]/15 p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
                  title="Tam Ekran Görüntüle"
                >
                  <svg className="w-3.5 h-3.5 text-[#8A5A3B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Plate Name & Date */}
            <h2 className="font-display font-medium text-2xl text-[#241F19] tracking-normal mb-1 font-gravur-serif">
              {title}
            </h2>
            <div className="font-display text-[11.5px] tracking-[0.06em] text-[#5C5646] uppercase font-gravur-sc">
              {dateLabel}
            </div>

            {/* Separation Rule */}
            <div className="flex items-center justify-center gap-2 my-3">
              <div className="w-8 h-[1px] bg-[#241F19]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#8A5A3B]"></div>
              <div className="w-8 h-[1px] bg-[#241F19]"></div>
            </div>

            {/* Plate Message */}
            {message && (
              <p className="font-display italic text-[14.5px] leading-relaxed text-[#38332A] px-2 mb-4 font-gravur-serif">
                &ldquo;{message}&rdquo;
              </p>
            )}

            {/* Plate Foot */}
            <div className="flex justify-between items-center border-t border-[#241F19] pt-3.5 mt-2 w-full text-left">
              <div className="font-display text-[10px] leading-normal text-[#5C5646] uppercase font-gravur-sc">
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
            <div className="w-[100px] h-[1px] bg-[#241F19]/25 mx-auto"></div>
            <div className="flex flex-col items-center gap-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#8A5A3B]">Gökyüzü Kaydı</p>
              <p className="font-display text-sm italic leading-relaxed text-[#5C5646] font-gravur-serif">{skyLog}</p>
            </div>
          </div>
        )}

        {/* Fullscreen Zoom Lightbox Modal */}
        {isZoomed && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0810]/95 p-4 md:p-8 backdrop-blur-md">
            <div className="relative w-full max-w-3xl aspect-square md:aspect-[4/3] border-[1.5px] border-[#241F19] bg-[#E4DFCD] p-4 flex flex-col rounded-xl shadow-2xl">
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="absolute top-4 right-4 z-20 rounded-full p-2 text-[#241F19] hover:bg-[#241F19]/10 transition-colors"
                aria-label="Kapat"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex-1 w-full overflow-hidden relative">
                <CelestialGlobe3D sky={sky} palette={palette} className="w-full h-full" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-4 text-center">
      <div
        className="relative w-[88%] max-w-[420px] md:max-w-[460px]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-10 -z-10 rounded-full"
          style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(230,184,119,0.18), transparent 70%)" }}
        />
        <div className="rounded-full border border-amber/[0.2] p-[7px] relative group">
          <div
            className="aspect-square overflow-hidden rounded-full border border-amber/40 shadow-[0_25px_70px_-24px_rgba(0,0,0,0.65)] relative"
          >
            <CelestialGlobe3D sky={sky} palette={palette} className="w-full h-full" />
            {/* Fullscreen zoom floating button */}
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              className="absolute top-4 right-4 z-30 bg-void/85 border border-amber/30 p-2 rounded-full text-amber opacity-60 hover:opacity-100 transition-opacity shadow-lg"
              title="Tam Ekran Görüntüle"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
          </div>
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
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-dim">Gökyüzü Kaydı</p>
              <p className="font-display text-sm italic leading-relaxed text-subtle">{skyLog}</p>
            </div>
          </>
        )}
      </div>

      {/* Fullscreen Zoom Lightbox Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0810]/95 p-4 md:p-8 backdrop-blur-md">
          <div className="relative w-full max-w-3xl aspect-square md:aspect-[4/3] border-[1.5px] border-amber/35 bg-[#15101a] p-4 flex flex-col rounded-xl shadow-2xl">
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 z-20 rounded-full p-2 text-bright hover:bg-amber/15 transition-colors"
              aria-label="Kapat"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex-1 w-full overflow-hidden relative">
              <CelestialGlobe3D sky={sky} palette={palette} className="w-full h-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
