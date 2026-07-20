"use client";

import { useJournalTheme } from "@/components/journal/JournalThemeContext";
import { cloudinaryTransform } from "@/lib/cloudinary/transformUrl";
import type { StarMapPhoto } from "@/lib/starmaps";
import { NightPageShell } from "./NightPageShell";

export interface MemoryPageProps {
  photo: StarMapPhoto;
  caption: string;
  widthPx?: number;
  heightPx?: number;
}

function CornerOrnament({ position, color }: { position: "tl" | "tr" | "bl" | "br"; color: string }) {
  const transforms: Record<typeof position, string> = {
    tl: "",
    tr: "scaleX(-1)",
    bl: "scaleY(-1)",
    br: "scale(-1,-1)",
  };
  const placement: Record<typeof position, string> = {
    tl: "left-[-4px] top-[-4px]",
    tr: "right-[-4px] top-[-4px]",
    bl: "left-[-4px] bottom-[-4px]",
    br: "right-[-4px] bottom-[-4px]",
  };
  return (
    <svg
      viewBox="0 0 26 26"
      className={`absolute h-[26px] w-[26px] opacity-90 ${placement[position]}`}
      style={{ transform: transforms[position] }}
    >
      <path d="M2 18 V6 Q2 2 6 2 H18" fill="none" stroke={color} strokeWidth="1.3" />
      <circle cx="6" cy="2" r="1.4" fill={color} />
    </svg>
  );
}

/**
 * "Birlikte Anılarımız" — one of 4 separate pages, each with exactly one
 * photo in a soft oval vignette (no hard rectangular frame) and a thin gold
 * ornament tick at each corner.
 */
export function MemoryPage({ photo, caption, widthPx, heightPx }: MemoryPageProps) {
  const theme = useJournalTheme();
  return (
    <NightPageShell widthPx={widthPx} heightPx={heightPx} printReady={true}>
      <div className="flex h-full w-full flex-col items-center justify-center px-[11%] py-[12%]">
        <div className="relative aspect-[4/5] w-[76%]">
          <div
            className="flex h-full w-full items-center justify-center overflow-hidden"
            style={{
              borderRadius: "50%/38%",
              background: photo.url
                ? undefined
                : `radial-gradient(ellipse at 50% 42%, ${theme.accentMetal}1a 0%, rgba(8,12,34,.55) 78%)`,
              boxShadow: `0 0 0 1px ${theme.accentMetal}59, 0 20px 40px -16px rgba(0,0,0,.6)`,
            }}
          >
            {photo.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cloudinaryTransform(photo.url, widthPx ?? 900)}
                alt={caption}
                className="h-full w-full object-cover"
              />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke={theme.accentMetal} strokeWidth="1.2" className="w-[22%] opacity-50">
                <path d="M4 16l4.5-6 3.5 4 2.5-3L20 16" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="8" cy="8" r="1.6" />
                <rect x="3" y="4" width="18" height="16" rx="1.4" />
              </svg>
            )}
          </div>
          <CornerOrnament position="tl" color={theme.accentMetal} />
          <CornerOrnament position="tr" color={theme.accentMetal} />
          <CornerOrnament position="bl" color={theme.accentMetal} />
          <CornerOrnament position="br" color={theme.accentMetal} />
        </div>
        <div className="mt-[8%] h-px w-9" style={{ backgroundColor: `${theme.accentMetalDim}b3` }} />
        <p className="mt-2.5 font-display text-xs italic tracking-wide" style={{ color: theme.text.caption }}>
          {caption}
        </p>
      </div>
    </NightPageShell>
  );
}
