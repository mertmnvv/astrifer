import { NightPageShell } from "./NightPageShell";

export interface BackCoverPageProps {
  widthPx?: number;
  heightPx?: number;
}

/**
 * Page 26: the back cover's sealed pocket graphic only — the letter's own
 * text never appears here. It's printed on a separate, more sensitive
 * sealed insert (see LetterInsertPage.tsx / lib/journalPrintRender.ts)
 * that gets physically placed into this pocket, not baked into the book.
 */
export function BackCoverPage({ widthPx, heightPx }: BackCoverPageProps) {
  return (
    <NightPageShell widthPx={widthPx} heightPx={heightPx} printReady={true}>
      <div className="flex h-full w-full flex-col items-center justify-center gap-[9%] px-[9%] py-[9%]">
        <div className="relative flex aspect-[4/3] w-[82%] items-end justify-center pb-[6%]">
          <svg viewBox="0 0 64 48" className="w-full" fill="none" aria-hidden>
            <rect x="1" y="1" width="62" height="46" rx="2" stroke="#e6b877" strokeWidth="1.2" strokeDasharray="3 4" />
            <path
              d="M4 40 L32 20 L60 40 Z"
              fill="none"
              stroke="#a9832f"
              strokeWidth="1.2"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <circle cx="32" cy="30" r="7" fill="#e0a35c" stroke="#c98a45" strokeWidth="0.8" />
            <line x1="32" y1="25.5" x2="32" y2="34.5" stroke="#2a2318" strokeWidth="1" />
            <line x1="27.5" y1="30" x2="36.5" y2="30" stroke="#2a2318" strokeWidth="1" />
          </svg>
        </div>
        <p className="text-center font-mono text-[8.5px] uppercase tracking-[0.18em] text-[#aab2d6]">
          Gelecek Mektubu — mühürlü cep
        </p>
      </div>
    </NightPageShell>
  );
}
