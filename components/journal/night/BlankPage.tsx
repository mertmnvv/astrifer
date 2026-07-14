"use client";

import { useJournalTheme } from "@/components/journal/JournalThemeContext";
import { NightPageShell } from "./NightPageShell";

export interface BlankPageProps {
  widthPx?: number;
  heightPx?: number;
}

/** Pages 11-25: 15 blank/lined pages for the owner's own words — rendered/printed once and reused for all 15 slots. */
export function BlankPage({ widthPx, heightPx }: BlankPageProps) {
  const theme = useJournalTheme();
  const lineCount = 22;
  return (
    <NightPageShell widthPx={widthPx} heightPx={heightPx} printReady={true}>
      <div className="flex h-full w-full flex-col justify-center gap-[4.2%] px-[13%] py-[13%]">
        {Array.from({ length: lineCount }).map((_, index) => (
          <div key={index} className="h-px w-full" style={{ backgroundColor: theme.ruledLine }} />
        ))}
      </div>
    </NightPageShell>
  );
}
