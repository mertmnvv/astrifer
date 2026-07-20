"use client";

import { useState } from "react";
import { QrCode } from "@/components/QrCode";
import { useJournalTheme } from "@/components/journal/JournalThemeContext";
import { NightPageShell } from "./NightPageShell";

export interface BackCoverPageProps {
  /** Omit to render the seal-only mockup (e.g. the product page's material showcase, which shows the QR separately). */
  qrUrl?: string;
  widthPx?: number;
  heightPx?: number;
}

/**
 * Page 27: the back cover carries both the sealed-letter pocket graphic AND
 * the scannable QR to the living digital page — the letter's own text never
 * appears here, it's printed on a separate sealed insert (see
 * LetterInsertPage.tsx / lib/journalPrintRender.ts) that gets physically
 * placed into this pocket.
 */
export function BackCoverPage({ qrUrl, widthPx, heightPx }: BackCoverPageProps) {
  const theme = useJournalTheme();
  const isFixedSize = widthPx !== undefined && heightPx !== undefined;
  const [qrReady, setQrReady] = useState(false);
  return (
    <NightPageShell widthPx={widthPx} heightPx={heightPx} printReady={!qrUrl || qrReady}>
      <div className="flex h-full w-full flex-col items-center justify-center gap-[6%] px-[10%] py-[8%]">
        <div className="relative flex aspect-[4/3] w-[62%] items-end justify-center pb-[6%]">
          <svg viewBox="0 0 64 48" className="w-full" fill="none" aria-hidden>
            <rect
              x="1"
              y="1"
              width="62"
              height="46"
              rx="2"
              stroke={theme.backCover.borderDash}
              strokeWidth="1.2"
              strokeDasharray="3 4"
            />
            <path
              d="M4 40 L32 20 L60 40 Z"
              fill="none"
              stroke={theme.backCover.flapStroke}
              strokeWidth="1.2"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <circle cx="32" cy="30" r="7" fill={theme.backCover.sealFill} stroke={theme.backCover.sealStroke} strokeWidth="0.8" />
            <line x1="32" y1="25.5" x2="32" y2="34.5" stroke={theme.backCover.sealCross} strokeWidth="1" />
            <line x1="27.5" y1="30" x2="36.5" y2="30" stroke={theme.backCover.sealCross} strokeWidth="1" />
          </svg>
        </div>
        <p className={`text-center font-mono uppercase tracking-[0.18em] ${isFixedSize ? "text-[8.5px]" : "text-[7px]"}`} style={{ color: theme.backCover.captionText }}>
          Gelecek Mektubu — mühürlü cep
        </p>

        {qrUrl && (
          <>
            <div className="h-px w-10" style={{ backgroundColor: `${theme.accentMetalDim}80` }} />
            <div className="rounded-[6px] p-[5%]" style={{ backgroundColor: theme.qrBacking }}>
              <QrCode url={qrUrl} sizePx={isFixedSize ? 92 : 64} darkColor="#0a0a12" lightColor="#00000000" onReady={() => setQrReady(true)} />
            </div>
            <p className={`text-center font-mono uppercase tracking-[0.2em] ${isFixedSize ? "text-[8.5px]" : "text-[7px]"}`} style={{ color: theme.accentMetal }}>
              Kayda devam et →
            </p>
          </>
        )}
      </div>
    </NightPageShell>
  );
}
