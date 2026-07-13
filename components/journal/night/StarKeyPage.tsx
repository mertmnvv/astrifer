import type { NumberedStar } from "../starMapSpread";
import { NightPageShell } from "./NightPageShell";

export interface StarKeyPageProps {
  numberedStars: NumberedStar[];
  narrative: string;
  widthPx?: number;
  heightPx?: number;
}

/** Page 4: maps each numbered code back to its real star name, plus a short real-data "Günün Anlamı" note. */
export function StarKeyPage({ numberedStars, narrative, widthPx, heightPx }: StarKeyPageProps) {
  return (
    <NightPageShell widthPx={widthPx} heightPx={heightPx} printReady={true}>
      <div className="flex h-full w-full flex-col items-center justify-center px-[9%] py-[9%] text-ink">
        <p className="mb-2.5 text-center font-mono text-[8.5px] uppercase tracking-[0.24em] text-amber">Yıldız Anahtarı</p>
        <div className="grid w-full grid-cols-2 gap-x-3.5 gap-y-0.5 font-mono text-[9px] leading-[1.9] text-[#e9ecf6]">
          {numberedStars.map(({ code, star }) => (
            <div key={code}>
              <span className="mr-1.5 font-bold text-amber">{code}</span>
              {star.name}
            </div>
          ))}
        </div>
        <div className="my-3 h-px w-full bg-[#a9832f]/50" />
        <p className="text-center font-display text-[11px] italic leading-relaxed text-[#aab2d6]">
          &ldquo;{narrative}&rdquo;
        </p>
      </div>
    </NightPageShell>
  );
}
