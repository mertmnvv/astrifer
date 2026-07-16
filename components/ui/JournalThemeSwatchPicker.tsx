"use client";

import { JOURNAL_THEMES, type JournalThemeId } from "@/components/journal/night/journalTheme";

export interface JournalThemeSwatchPickerProps {
  value: JournalThemeId;
  onChange: (id: JournalThemeId) => void;
  name: string;
}

export function JournalThemeSwatchPicker({ value, onChange, name }: JournalThemeSwatchPickerProps) {
  const themes = Object.values(JOURNAL_THEMES);

  return (
    <div role="radiogroup" aria-label="Defter kapağı teması" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {themes.map((theme) => {
        const checked = value === theme.id;
        const [c0, c1, c2, c3] = theme.leather.gradientStops;

        return (
          <label
            key={theme.id}
            className={`cursor-pointer rounded-lg border p-2 text-center transition-all focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-amber ${
              checked ? "border-amber/60 bg-amber/10 scale-[1.02]" : "border-text/10 bg-text/[0.03] hover:border-text/25"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={theme.id}
              checked={checked}
              onChange={() => onChange(theme.id)}
              className="sr-only"
            />
            <span
              aria-hidden
              className="relative block aspect-square w-full overflow-hidden rounded-md border"
              style={{
                borderColor: checked ? theme.accentMetal : `${theme.accentMetal}33`,
                background: `radial-gradient(circle at 35% 30%, ${c0}, ${c1}, ${c2}, ${c3})`,
                boxShadow: checked ? `0 0 12px ${theme.accentMetal}40` : "none",
              }}
            >
              {/* Inner ring overlay representing stitching or metal edge */}
              <span
                className="absolute inset-1 rounded-sm border border-dashed"
                style={{
                  borderColor: `${theme.accentMetal}26`,
                }}
              />
              {/* Embossed metal effect in the center */}
              <span
                className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.accentMetalDim}, ${theme.accentMetal}, ${theme.accentMetalDim})`,
                  borderColor: `${theme.accentMetal}66`,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
                }}
              >
                <span className="text-[10px] font-bold text-ink">A</span>
              </span>
            </span>
            <span className="mt-1.5 block font-mono text-[9px] uppercase tracking-widest text-text leading-tight">
              {theme.label.split(" + ")[0]}
            </span>
            <span className="block text-[8px] uppercase tracking-wider text-muted mt-0.5">
              + {theme.label.split(" + ")[1] || ""}
            </span>
          </label>
        );
      })}
    </div>
  );
}
