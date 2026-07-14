"use client";

import { useRef } from "react";
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
}

/**
 * The page's cinematic centerpiece: the blurred ambient background sharpens
 * and scales up into this circular medallion as the section scrolls into
 * view — the sky going from wallpaper to the one crisp "object" on the page
 * — then the moment's message/coordinates settle in underneath it. Skips
 * the scroll-linked transform entirely under reduced motion, showing the
 * resolved end state right away.
 */
export function SkyFocusSection({ sky, previewLabel, palette, coordsLabel, message, skyLog }: SkyFocusSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "0.5 0.5"] });

  const blurPx = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const filter = useTransform(blurPx, (v) => `blur(${v}px)`);
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const ringOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  const contentOpacity = useTransform(scrollYProgress, [0.55, 1], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.55, 1], [22, 0]);

  return (
    <div ref={ref} className="flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-4 text-center">
      <motion.div
        style={{ opacity: reducedMotion ? 1 : ringOpacity, scale: reducedMotion ? 1 : scale }}
        className="relative w-[74%] max-w-[320px]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-10 -z-10 rounded-full"
          style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(230,184,119,0.18), transparent 70%)" }}
        />
        <div className="rounded-full border border-amber/[0.2] p-[7px]">
          <motion.div
            style={{ filter: reducedMotion ? "none" : filter }}
            className="aspect-square overflow-hidden rounded-full border border-amber/40 shadow-[0_25px_70px_-24px_rgba(0,0,0,0.65)]"
          >
            <StarChart sky={sky} label={previewLabel} className="h-full w-full" palette={palette} />
          </motion.div>
        </div>
      </motion.div>

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
    </div>
  );
}
