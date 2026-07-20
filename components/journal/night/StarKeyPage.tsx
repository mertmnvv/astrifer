"use client";

import { useEffect, useRef } from "react";
import { drawCompassRing } from "@/components/astrolab/drawLogoThinStar";
import { useJournalTheme } from "@/components/journal/JournalThemeContext";
import type { NumberedStar } from "../starMapSpread";
import { NightPageShell } from "./NightPageShell";

export interface StarKeyPageProps {
  numberedStars: NumberedStar[];
  narrative: string;
  widthPx?: number;
  heightPx?: number;
}

/**
 * Page — "Yıldız Anahtarı" as an observation-log dial: a compass-ring canvas
 * plots each numbered star at its true azimuth (matching the compass motif
 * on the cover and Seyir Kaydı page), the legend reads as log rows rather
 * than a plain list, and the sky's meaning closes the page as a logbook
 * remark.
 */
export function StarKeyPage({ numberedStars, narrative, widthPx, heightPx }: StarKeyPageProps) {
  const theme = useJournalTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isFixedSize = widthPx !== undefined && heightPx !== undefined;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const size = container.clientWidth;
      if (size <= 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.4;
      drawCompassRing(ctx, cx, cy, r, theme.accentMetalDim);

      numberedStars.forEach(({ code, star }) => {
        const rad = ((star.azimuth - 90) * Math.PI) / 180;
        const tickR = r * 0.98;
        const dotR = r * (1.14 + Math.max(0, (2.5 - star.mag)) * 0.035);
        const x = cx + Math.cos(rad) * tickR;
        const y = cy + Math.sin(rad) * tickR;
        const lx = cx + Math.cos(rad) * dotR;
        const ly = cy + Math.sin(rad) * dotR;

        ctx.strokeStyle = theme.accentMetal;
        ctx.globalAlpha = 0.7;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(rad) * (r * 0.9), cy + Math.sin(rad) * (r * 0.9));
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.globalAlpha = 1;
        ctx.fillStyle = theme.accentMetal;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1.4, size * 0.006), 0, Math.PI * 2);
        ctx.fill();

        ctx.font = `${Math.max(8, size * 0.028)}px var(--font-mono, monospace)`;
        ctx.fillStyle = theme.accentMetal;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(code, lx, ly);
      });
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberedStars, theme]);

  return (
    <NightPageShell widthPx={widthPx} heightPx={heightPx} printReady={true}>
      <div className="flex h-full w-full flex-col items-center px-[8%] py-[7%]">
        <p className={`text-center font-mono uppercase tracking-[0.24em] ${isFixedSize ? "text-[9px]" : "text-[8px]"}`} style={{ color: theme.accentMetal }}>
          Yıldız Anahtarı
        </p>
        <p className={`mt-0.5 text-center font-mono uppercase tracking-[0.18em] opacity-60 ${isFixedSize ? "text-[7px]" : "text-[6px]"}`} style={{ color: theme.accentMetalDim }}>
          Gerçek Azimut Kaydı
        </p>

        <div ref={containerRef} className="mt-3 w-[62%]">
          <div className="aspect-square w-full">
            <canvas ref={canvasRef} className="h-full w-full" />
          </div>
        </div>

        <div className="mt-2 grid w-full grid-cols-2 gap-x-3 font-mono" style={{ color: theme.text.body }}>
          {numberedStars.map(({ code, star }) => (
            <div
              key={code}
              className={`flex items-baseline justify-between gap-1.5 border-b border-dashed py-[3px] ${isFixedSize ? "text-[8.5px]" : "text-[7px]"}`}
              style={{ borderColor: `${theme.accentMetalDim}55` }}
            >
              <span className="shrink-0 font-bold" style={{ color: theme.accentMetal }}>
                {code}
              </span>
              <span className="truncate text-right">{star.name}</span>
            </div>
          ))}
        </div>

        <p className={`mt-3 max-w-[92%] text-center font-display italic leading-relaxed ${isFixedSize ? "text-[11px]" : "text-[9px]"}`} style={{ color: theme.text.bodyMuted }}>
          &ldquo;{narrative}&rdquo;
        </p>
      </div>
    </NightPageShell>
  );
}
