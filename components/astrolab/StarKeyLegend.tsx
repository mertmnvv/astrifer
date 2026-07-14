import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import { buildSkyLabels } from "./drawStarChart";
import type { SkyPalette } from "./palettes";

export interface StarKeyLegendProps {
  sky: ComputeSkyResult | null;
  palette: SkyPalette;
  minAltitude?: number;
  title?: string;
  className?: string;
}

/**
 * Maps each numbered jewel/chip drawn on a StarChart back to its real name —
 * the digital counterpart to the journal's Yıldız Anahtarı page. Uses the
 * exact same buildSkyLabels() call the canvas draws from, so codes always
 * match what's on screen.
 */
export function StarKeyLegend({ sky, palette, minAltitude, title = "Yıldız Anahtarı", className }: StarKeyLegendProps) {
  const labels = buildSkyLabels(sky, minAltitude);
  if (labels.length === 0) return null;

  return (
    <div className={className}>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">{title}</p>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-left sm:grid-cols-3">
        {labels.map((entry) => (
          <div key={entry.code} className="flex items-baseline gap-1.5 font-mono text-[11px] text-subtle">
            <span className="font-semibold" style={{ color: palette.sun }}>
              {entry.code}
            </span>
            <span className="truncate">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
