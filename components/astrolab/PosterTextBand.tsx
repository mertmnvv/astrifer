export interface PosterTextBandProps {
  headline: string;
  personalMessage: string;
  names: string;
  dateTimeLabel: string;
  coordsLabel: string;
  className?: string;
  /** Fixed pixel height, used only by the print composite so art+band sum to exactly one square print. Omit for the live preview, which sizes itself with CSS percentages instead. */
  heightPx?: number;
}

/**
 * Plain HTML/CSS text band — deliberately NOT drawn on canvas, so the live
 * configurator can update it on every keystroke with no redraw cost. Only
 * composited with the art canvas into one image server-side, at print time
 * (see PosterPrintFrame.tsx / lib/printRender.ts). Art + band together make
 * up ONE square print — the band is a slice of that square, not an addition
 * to it.
 */
export function PosterTextBand({
  headline,
  personalMessage,
  names,
  dateTimeLabel,
  coordsLabel,
  className,
  heightPx,
}: PosterTextBandProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2.5 border-t border-amber/40 bg-[#080a14] px-[6%] text-center ${
        heightPx ? "" : "py-[7%]"
      } ${className ?? ""}`}
      style={heightPx ? { height: heightPx, overflow: "hidden" } : undefined}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber">{headline}</p>
      {personalMessage && (
        <p className="max-w-[34ch] font-display text-base italic leading-relaxed text-text/90">
          &ldquo;{personalMessage}&rdquo;
        </p>
      )}
      <p className="font-display text-xl italic text-bright">{names}</p>
      <div className="my-0.5 h-px w-6 bg-amber/50" />
      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-dim">
        {dateTimeLabel} · {coordsLabel}
      </p>
    </div>
  );
}
