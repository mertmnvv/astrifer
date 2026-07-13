"use client";

import { useEffect, useRef, useState } from "react";
import { drawLogoThinStar } from "@/components/astrolab/drawLogoThinStar";
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

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
      drawNightLeatherTexture(ctx, width, height);
      drawLogoThinStar(ctx, width * 0.5, height * 0.14, Math.min(width, height) * 0.075);
      setReady(true);
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
  }, [widthPx, heightPx]);

  return (
    <NightPageShell widthPx={widthPx} heightPx={heightPx} printReady={ready} className="border border-amber/25">
      <div ref={containerRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>
      <div className="absolute inset-x-0 top-[24%] flex flex-col items-center gap-2">
        <p className="font-mono text-base font-bold uppercase tracking-[0.4em] text-amber">Astrifer</p>
      </div>
      <div className="absolute inset-x-0 bottom-[18%] flex flex-col items-center gap-2">
        <div className="h-px w-9 bg-amber/60" />
        <p className="font-display text-lg italic text-amber/95">{names}</p>
      </div>
    </NightPageShell>
  );
}
