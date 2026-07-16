"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { StarChart } from "@/components/astrolab/StarChart";
import type { SkyPalette } from "@/components/astrolab/palettes";
import { LedgerRule } from "@/components/atlas/LedgerRule";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

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
 * The page's cinematic centerpiece: the blurred ambient background sharpens
 * and scales up into this circular medallion as the section scrolls into
 * view — the sky going from wallpaper to the one crisp "object" on the page
 * — then the moment's message/coordinates settle in underneath it. Skips
 * the scroll-linked transform entirely under reduced motion, showing the
 * resolved end state right away.
 */
export function SkyFocusSection({
  sky,
  previewLabel,
  palette,
  coordsLabel,
  message,
  skyLog,
  interactive = false,
  isPreviewMode = false,
  title = "",
  dateLabel = "",
}: SkyFocusSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "0.5 0.5"] });

  const [isSpinning, setIsSpinning] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const blurPx = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const filter = useTransform(blurPx, (v) => `blur(${v}px)`);
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const ringOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const contentOpacity = useTransform(scrollYProgress, [0.55, 1], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.55, 1], [22, 0]);

  const isGravur = palette.id === "gravur-atlas";

  if (isGravur) {
    return (
      <div ref={ref} className="flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-4 text-center">
        <motion.div
          style={{ opacity: reducedMotion ? 1 : ringOpacity, scale: reducedMotion ? 1 : scale }}
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

            {/* Starmap Box */}
            <motion.div
              style={{ filter: reducedMotion ? "none" : filter }}
              className="w-full aspect-[4/3] overflow-hidden border border-[#241F19] my-4 shadow-sm bg-[#E4DFCD] relative group cursor-zoom-in"
              onClick={() => setIsZoomed(true)}
            >
              <StarChart
                sky={sky}
                label={previewLabel}
                className="h-full w-full"
                palette={palette}
                interactive={interactive}
                isPreviewMode={isPreviewMode}
                isSpinningExternal={isSpinning}
                onSpinChange={setIsSpinning}
                resetTrigger={resetTrigger}
                showControls={false}
              />
              <div className="absolute inset-0 bg-[#241F19]/[0.01] group-hover:bg-[#241F19]/[0.04] transition-colors pointer-events-none" />
              {/* Zoom badge at top right */}
              <div className="absolute top-2 right-2 bg-[#E4DFCD] border border-[#241F19]/15 p-1 rounded-md opacity-60 group-hover:opacity-100 transition-opacity">
                <svg className="w-3.5 h-3.5 text-[#8A5A3B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </div>
            </motion.div>

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
        </motion.div>

        {interactive && (
          <div className="mt-6 flex items-center gap-3 z-20">
            <button
              type="button"
              onClick={() => setIsSpinning(!isSpinning)}
              className="flex items-center gap-2 rounded-full border border-[#8A5A3B]/40 bg-[#E4DFCD] px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-[#8A5A3B] transition-all hover:bg-[#8A5A3B]/10 active:scale-95"
            >
              {isSpinning ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                  </svg>
                  Durdur
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Gökyüzünü Döndür
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setResetTrigger((prev) => prev + 1);
                setIsSpinning(false);
              }}
              className="rounded-full bg-[#8A5A3B]/10 px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-[#241F19] transition-all hover:bg-[#8A5A3B]/20 active:scale-95"
            >
              Sıfırla
            </button>
          </div>
        )}

        {skyLog && (
          <motion.div
            style={{ opacity: reducedMotion ? 1 : contentOpacity, y: reducedMotion ? 0 : contentY }}
            className="mt-10 flex max-w-md flex-col items-center gap-6"
          >
            <div className="w-[100px] h-[1px] bg-[#241F19]/25 mx-auto"></div>
            <div className="flex flex-col items-center gap-2">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#8A5A3B]">Gökyüzü Kaydı</p>
              <p className="font-display text-sm italic leading-relaxed text-[#5C5646] font-gravur-serif">{skyLog}</p>
            </div>
          </motion.div>
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
                <StarChart
                  sky={sky}
                  label={previewLabel}
                  className="h-full w-full bg-[#E4DFCD]"
                  palette={palette}
                  interactive={true}
                  isPreviewMode={isPreviewMode}
                  isSpinningExternal={isSpinning}
                  onSpinChange={setIsSpinning}
                  resetTrigger={resetTrigger}
                  showControls={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-4 text-center">
      <motion.div
        style={{ opacity: reducedMotion ? 1 : ringOpacity, scale: reducedMotion ? 1 : scale }}
        className="relative w-[88%] max-w-[420px] md:max-w-[460px]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-10 -z-10 rounded-full"
          style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(230,184,119,0.18), transparent 70%)" }}
        />
        <div className="rounded-full border border-amber/[0.2] p-[7px] cursor-zoom-in group" onClick={() => setIsZoomed(true)}>
          <motion.div
            style={{ filter: reducedMotion ? "none" : filter }}
            className="aspect-square overflow-hidden rounded-full border border-amber/40 shadow-[0_25px_70px_-24px_rgba(0,0,0,0.65)] relative"
          >
            <StarChart
              sky={sky}
              label={previewLabel}
              className="h-full w-full"
              palette={palette}
              interactive={interactive}
              isPreviewMode={isPreviewMode}
              isSpinningExternal={isSpinning}
              onSpinChange={setIsSpinning}
              resetTrigger={resetTrigger}
              showControls={false}
            />
            {/* Hover magnifying glass badge */}
            <div className="absolute inset-0 bg-void/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <div className="bg-void/85 border border-amber/30 p-3 rounded-full text-amber shadow-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {interactive && (
        <div className="mt-6 flex items-center gap-3 z-20">
          <button
            type="button"
            onClick={() => setIsSpinning(!isSpinning)}
            className="flex items-center gap-2 rounded-full border border-amber/30 bg-void/60 px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-amber transition-all hover:border-amber hover:bg-amber/10 active:scale-95"
          >
            {isSpinning ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                Durdur
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Gökyüzünü Döndür
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setResetTrigger((prev) => prev + 1);
              setIsSpinning(false);
            }}
            className="rounded-full bg-amber/[0.06] px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-muted transition-all hover:bg-amber/15 hover:text-bright active:scale-95"
          >
            Sıfırla
          </button>
        </div>
      )}

      <motion.div
        style={{ opacity: reducedMotion ? 1 : contentOpacity, y: reducedMotion ? 0 : contentY }}
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
      </motion.div>

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
              <StarChart
                sky={sky}
                label={previewLabel}
                className="h-full w-full bg-[#15101a]"
                palette={palette}
                interactive={true}
                isPreviewMode={isPreviewMode}
                isSpinningExternal={isSpinning}
                onSpinChange={setIsSpinning}
                resetTrigger={resetTrigger}
                showControls={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
