"use client";

import { useState } from "react";
import { QrCode } from "@/components/QrCode";
import { useJournalTheme } from "@/components/journal/JournalThemeContext";
import { NightPageShell } from "./NightPageShell";

export interface QrPageProps {
  qrUrl: string;
  widthPx?: number;
  heightPx?: number;
}

/** Page 10: a real, scannable QR code linking to the living digital page. */
export function QrPage({ qrUrl, widthPx, heightPx }: QrPageProps) {
  const theme = useJournalTheme();
  const [ready, setReady] = useState(false);
  const qrSizePx = widthPx ? Math.round(widthPx * 0.32) : 140;
  return (
    <NightPageShell widthPx={widthPx} heightPx={heightPx} printReady={ready}>
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-[10%] py-[10%]">
        <div className="rounded-[6px] p-[6%]" style={{ backgroundColor: theme.qrBacking }}>
          <QrCode
            url={qrUrl}
            sizePx={qrSizePx}
            darkColor="#0a0a12"
            lightColor="#00000000"
            onReady={() => setReady(true)}
          />
        </div>
        <p className="font-mono text-[8.5px] uppercase tracking-[0.2em]" style={{ color: theme.accentMetal }}>
          Dijital sayfana git →
        </p>
      </div>
    </NightPageShell>
  );
}
