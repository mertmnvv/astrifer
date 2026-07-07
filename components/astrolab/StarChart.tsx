"use client";

import { useEffect, useRef } from "react";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import { drawStarChart } from "./drawStarChart";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

export interface StarChartProps {
  sky: ComputeSkyResult | null;
  className?: string;
  /** Accessible label describing what the chart depicts, e.g. a place/date summary. */
  label: string;
}

export function StarChart({ sky, className, label }: StarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let cssSize = 0;

    const resize = () => {
      cssSize = container.clientWidth;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = cssSize * dpr;
      canvas.height = cssSize * dpr;
      canvas.style.width = `${cssSize}px`;
      canvas.style.height = `${cssSize}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (timestampMs: number) => {
      drawStarChart(ctx, sky, {
        size: cssSize,
        time: timestampMs / 1000,
        reducedMotion,
      });
    };

    // Resizing clears the canvas bitmap, so every resize must be followed by
    // a redraw — including the initial call, and ResizeObserver's guaranteed
    // first callback, which would otherwise wipe the one static frame drawn
    // below when motion is reduced and nothing else ever redraws it.
    const handleResize = () => {
      resize();
      draw(reducedMotion ? 0 : performance.now());
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    if (!reducedMotion) {
      const loop = (timestampMs: number) => {
        draw(timestampMs);
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [sky, reducedMotion]);

  return (
    <div ref={containerRef} className={className} role="img" aria-label={label}>
      <canvas ref={canvasRef} />
    </div>
  );
}
