"use client";

import { useEffect, useRef, useState } from "react";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import { drawStarChart } from "./drawStarChart";
import type { SkyPalette } from "./palettes";

export interface PrintStarChartProps {
  sky: ComputeSkyResult;
  /** Exact target pixel dimensions — the canvas bitmap is drawn 1:1 at this size, no devicePixelRatio scaling. */
  widthPx: number;
  heightPx: number;
  palette?: SkyPalette;
}

/**
 * One-shot, non-animated counterpart to StarChart: draws a single still
 * frame at an exact pixel size and marks itself ready via a data attribute
 * so a headless-browser screenshot (see lib/printRender.ts) knows when to
 * capture, instead of racing a render that hasn't painted yet.
 */
export function PrintStarChart({ sky, widthPx, heightPx, palette }: PrintStarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = widthPx;
    canvas.height = heightPx;
    drawStarChart(ctx, sky, {
      width: widthPx,
      height: heightPx,
      time: 0,
      reducedMotion: true,
      palette,
    });
    setReady(true);
  }, [sky, widthPx, heightPx, palette]);

  return <canvas ref={canvasRef} data-print-ready={ready ? "true" : "false"} />;
}
