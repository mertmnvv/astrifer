"use client";

import { useJournalTheme } from "@/components/journal/JournalThemeContext";
import { NightPageShell } from "./NightPageShell";

export interface LetterNoticePageProps {
  openingDateLabel?: string;
  widthPx?: number;
  heightPx?: number;
}

/**
 * Page 26 — the last content page before the back cover. Doesn't show the
 * letter itself (that's a separate sealed insert, see BackCoverPage.tsx /
 * lib/journalPrintRender.ts's renderLetterInsert) — just a logbook-style
 * notice that it exists and where to find it, so the book itself leaves a
 * trace of the sealed letter rather than jumping straight from writing
 * pages to the pocket.
 */
export function LetterNoticePage({ openingDateLabel, widthPx, heightPx }: LetterNoticePageProps) {
  const theme = useJournalTheme();
  const isFixedSize = widthPx !== undefined && heightPx !== undefined;
  return (
    <NightPageShell widthPx={widthPx} heightPx={heightPx} printReady={true}>
      <div className="flex h-full w-full flex-col items-center justify-center px-[14%] py-[14%] text-center">
        <svg viewBox="0 0 48 36" className={`${isFixedSize ? "w-16" : "w-10"} opacity-90`} fill="none" aria-hidden>
          <rect x="1" y="1" width="46" height="34" rx="1.5" stroke={theme.accentMetalDim} strokeWidth="1" strokeDasharray="2.5 3" />
          <path d="M3 5 L24 20 L45 5" stroke={theme.accentMetal} strokeWidth="1" strokeLinejoin="round" opacity="0.85" />
        </svg>

        <p className={`mt-5 font-mono uppercase tracking-[0.28em] ${isFixedSize ? "text-[9px]" : "text-[8px]"}`} style={{ color: theme.accentMetal }}>
          Gelecek Mektubu
        </p>
        <div className="mt-2.5 h-px w-10" style={{ backgroundColor: `${theme.accentMetal}99` }} />

        <p className={`mt-5 max-w-[85%] font-display italic leading-relaxed ${isFixedSize ? "text-[13px]" : "text-[10px]"}`} style={{ color: theme.text.body }}>
          Bugün yazdığınız mektup, bu sayfaların arasında değil — arka kapaktaki mühürlü cepte bekliyor.
        </p>
        {openingDateLabel && (
          <p className={`mt-4 font-mono uppercase tracking-[0.2em] ${isFixedSize ? "text-[9px]" : "text-[7.5px]"}`} style={{ color: theme.text.bodyMuted }}>
            Açılış · {openingDateLabel}
          </p>
        )}
      </div>
    </NightPageShell>
  );
}
