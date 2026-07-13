import { NightPageShell } from "./NightPageShell";

export interface EssayPageProps {
  essay: string;
  widthPx?: number;
  heightPx?: number;
}

/** Page 9: "Günün Anlamı ve Önemi" — longer, prose-format, standalone. */
export function EssayPage({ essay, widthPx, heightPx }: EssayPageProps) {
  return (
    <NightPageShell widthPx={widthPx} heightPx={heightPx} printReady={true}>
      <div className="flex h-full w-full flex-col justify-center px-[10%] py-[11%] text-[#e9ecf6]">
        <p className="mb-3.5 text-center font-mono text-[8.5px] uppercase tracking-[0.24em] text-amber">
          Günün Anlamı ve Önemi
        </p>
        <p className="text-left font-display text-[13px] italic leading-[1.75] text-[#aab2d6] first-letter:float-left first-letter:mr-1.5 first-letter:text-3xl first-letter:font-semibold first-letter:not-italic first-letter:leading-[0.8] first-letter:text-amber">
          {essay}
        </p>
      </div>
    </NightPageShell>
  );
}
