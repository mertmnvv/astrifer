"use client";

import { motion } from "framer-motion";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { buildSkyLabels } from "./drawStarChart";
import type { SkyPalette } from "./palettes";

export interface StarKeyLegendProps {
  sky: ComputeSkyResult | null;
  palette: SkyPalette;
  minAltitude?: number;
  title?: string;
  className?: string;
}

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const row = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

/**
 * Maps each numbered jewel/chip drawn on a StarChart back to its real name —
 * the digital counterpart to the journal's Yıldız Anahtarı page. Uses the
 * exact same buildSkyLabels() call the canvas draws from, so codes always
 * match what's on screen. Entries reveal one-by-one as the legend scrolls
 * into view, echoing the numbered marks lighting up on the chart above it.
 */
export function StarKeyLegend({ sky, palette, minAltitude, title = "Yıldız Anahtarı", className }: StarKeyLegendProps) {
  const labels = buildSkyLabels(sky, minAltitude);
  const reducedMotion = usePrefersReducedMotion();
  if (labels.length === 0) return null;

  return (
    <div className={className}>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">{title}</p>
      <motion.div
        variants={list}
        initial={reducedMotion ? "show" : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-left sm:grid-cols-3"
      >
        {labels.map((entry) => (
          <motion.div
            key={entry.code}
            variants={row}
            className="flex items-baseline gap-1.5 font-mono text-[11px] text-subtle"
          >
            <span className="font-semibold" style={{ color: palette.sun }}>
              {entry.code}
            </span>
            <span className="truncate">{entry.name}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
