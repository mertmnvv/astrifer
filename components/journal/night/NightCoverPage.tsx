"use client";

import { useEffect, useRef, useState } from "react";
import { drawCompassRing, drawLogoThinStar } from "@/components/astrolab/drawLogoThinStar";
import { useJournalTheme } from "@/components/journal/JournalThemeContext";
import { drawNightLeatherTexture } from "./drawNightLeatherTexture";
import { NightPageShell } from "./NightPageShell";

export interface NightCoverPageProps {
  names: string;
  widthPx?: number;
  heightPx?: number;
}

/**
 * Journal cover — dark navy-black vegan-leather texture, thin-line-star
 * logo, "Astrifer" wordmark, and the couple's names, all styled gold-foil.
 * The logo is canvas-drawn (drawLogoThinStar) directly over the leather
 * texture canvas so both share one draw pass; names/wordmark are plain
 * HTML text overlaid on top, same layering approach as the site's other
 * canvas-texture components (see CoverPanel.tsx).
 */
export function NightCoverPage({ names, widthPx, heightPx }: NightCoverPageProps) {
  const theme = useJournalTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  // Fixed-size renders are the 300 DPI print pipeline (lib/journalPrintRender.ts) —
  // its Tailwind text sizes are tuned for that exact pixel canvas and must stay
  // untouched. Only the auto-sized live previews (product page, İçindekiler grid,
  // /create thumbnail) need to shrink the wordmark to the container they're given.
  const isFixedSize = widthPx !== undefined && heightPx !== undefined;
  const [previewWidth, setPreviewWidth] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const width = widthPx ?? container.clientWidth;
      const height = heightPx ?? container.clientHeight;
      const dpr = widthPx ? 1 : window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawNightLeatherTexture(ctx, width, height, theme.leather);
      const markR = Math.min(width, height) * 0.075;
      drawCompassRing(ctx, width * 0.5, height * 0.155, markR * 1.55, theme.accentMetal);
      drawLogoThinStar(ctx, width * 0.5, height * 0.155, markR, theme.accentMetal);
      setReady(true);
      if (!isFixedSize) setPreviewWidth(width);
    };

    if (widthPx && heightPx) {
      draw();
      return;
    }
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widthPx, heightPx, theme]);

  const wordmarkFontSize = isFixedSize ? undefined : Math.max(8, Math.min(previewWidth * 0.045, 18));
  const namesFontSize = isFixedSize ? undefined : Math.max(9, Math.min(previewWidth * 0.052, 15));

  return (
    <NightPageShell
      widthPx={widthPx}
      heightPx={heightPx}
      printReady={ready}
      className="border"
      style={{ borderColor: `${theme.accentMetal}40` }}
    >
      <div ref={containerRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>
      <div className="absolute inset-x-0 top-[31%] flex flex-col items-center gap-2 px-2">
        <p
          className={`font-mono text-center font-bold uppercase ${isFixedSize ? "text-base tracking-[0.4em]" : ""}`}
          style={{
            color: theme.accentMetal,
            fontSize: wordmarkFontSize,
            letterSpacing: wordmarkFontSize ? wordmarkFontSize * 0.3 : undefined,
          }}
        >
          Astrifer
        </p>
        <p
          className={`font-mono text-center uppercase opacity-70 ${isFixedSize ? "text-[7px] tracking-[0.3em]" : ""}`}
          style={{
            color: theme.accentMetal,
            fontSize: wordmarkFontSize ? wordmarkFontSize * 0.42 : undefined,
            letterSpacing: wordmarkFontSize ? wordmarkFontSize * 0.28 : undefined,
          }}
        >
          Seyir Kaydı
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-[18%] flex flex-col items-center gap-2 px-3">
        <div className="h-px w-9" style={{ backgroundColor: `${theme.accentMetal}99` }} />
        <p
          className={`font-display text-center italic ${isFixedSize ? "text-lg" : ""}`}
          style={{ color: `${theme.accentMetal}f2`, fontSize: namesFontSize }}
        >
          {names}
        </p>
      </div>
    </NightPageShell>
  );
}
