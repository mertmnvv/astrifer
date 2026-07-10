"use client";

import type { SkyPalette } from "@/components/astrolab/palettes";

const SWATCH_DOTS = [
  { top: 25, left: 30, size: 3 },
  { top: 60, left: 65, size: 2 },
  { top: 40, left: 78, size: 2.5 },
  { top: 72, left: 22, size: 2 },
  { top: 18, left: 58, size: 2 },
];

export interface SkyPaletteSwatchPickerProps {
  palettes: SkyPalette[];
  value: string;
  onChange: (id: string) => void;
  name: string;
  /** Visual register: "dark" (default, night/void panels) or "light" (parchment panels). */
  tone?: "dark" | "light";
}

/** CSS-gradient swatches (no canvas render needed) so users can preview all sky themes at a glance. */
export function SkyPaletteSwatchPicker({ palettes, value, onChange, name, tone = "dark" }: SkyPaletteSwatchPickerProps) {
  const isLight = tone === "light";
  const unchecked = isLight
    ? "border-ink/20 bg-parchment-dim hover:border-ink/40"
    : "border-brass-dim/40 bg-panel-navy hover:border-brass-dim";

  return (
    <div role="radiogroup" aria-label="Gökyüzü teması" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {palettes.map((palette) => {
        const checked = value === palette.id;
        return (
          <label
            key={palette.id}
            className={`cursor-pointer rounded-lg border p-2 text-center transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brass ${
              checked ? "border-brass bg-brass-dim/20" : unchecked
            }`}
          >
            <input
              type="radio"
              name={name}
              value={palette.id}
              checked={checked}
              onChange={() => onChange(palette.id)}
              className="sr-only"
            />
            <span
              aria-hidden
              className="relative block aspect-square w-full overflow-hidden rounded-md"
              style={{ background: `radial-gradient(circle at 50% 40%, ${palette.skyCenter}, ${palette.skyEdge})` }}
            >
              {SWATCH_DOTS.map((dot, index) => (
                <span
                  key={index}
                  className="absolute rounded-full"
                  style={{
                    top: `${dot.top}%`,
                    left: `${dot.left}%`,
                    width: dot.size,
                    height: dot.size,
                    background: palette.star,
                    boxShadow: `0 0 ${dot.size * 2}px rgba(${palette.starGlowRgb}, 0.85)`,
                  }}
                />
              ))}
            </span>
            <span className={`mt-1.5 block font-mono text-[9px] uppercase tracking-widest ${isLight ? "text-ink" : "text-text"}`}>
              {palette.name}
            </span>
          </label>
        );
      })}
    </div>
  );
}
