import { getJournalTheme } from "@/components/journal/night/journalTheme";

export interface JournalThemeSwatchProps {
  paletteId: string;
}

/**
 * Small live indicator next to the sky-palette picker showing which of the
 * 3 fixed Deri Defter color themes the current selection maps to — reads
 * getJournalTheme() directly, no JournalThemeProvider needed (same
 * lightweight pure-CSS approach as SkyPaletteSwatchPicker's own swatches).
 */
export function JournalThemeSwatch({ paletteId }: JournalThemeSwatchProps) {
  const theme = getJournalTheme(paletteId);
  const [c0, c1] = theme.leather.gradientStops;

  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-text/[0.1] bg-text/[0.02] px-3 py-2.5">
      <div
        aria-hidden
        className="h-9 w-9 shrink-0 overflow-hidden rounded-full border"
        style={{
          borderColor: `${theme.accentMetal}66`,
          background: `radial-gradient(circle at 35% 30%, ${c0}, ${c1})`,
        }}
      >
        <div className="h-full w-full" style={{ boxShadow: `inset 0 0 0 1px ${theme.accentMetal}40` }} />
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.14em]" style={{ color: theme.accentMetal }}>
          {theme.label}
        </p>
        <p className="text-[11px] text-dim">Deri Defter de bu renkte olacak.</p>
      </div>
    </div>
  );
}
