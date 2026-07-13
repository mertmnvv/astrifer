"use client";

import { useEffect, useRef, useState } from "react";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import { drawJewelStar } from "@/components/astrolab/drawJewelStar";
import { hash, project, starRadius } from "@/components/astrolab/drawStarChart";
import type { NumberedStar } from "../starMapSpread";
import { NightPageShell } from "./NightPageShell";

export interface StarMapSpreadPageProps {
  sky: ComputeSkyResult;
  /** Only these stars are drawn as jewel-cut + numbered; every other real star in view is a small plain dot for context. */
  numberedStars: NumberedStar[];
  minAltitude?: number;
  widthPx?: number;
  heightPx?: number;
}

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const bg = ctx.createRadialGradient(width * 0.5, height * 0.4, 0, width * 0.5, height * 0.5, Math.max(width, height) * 0.75);
  bg.addColorStop(0, "#152049");
  bg.addColorStop(0.6, "#0d1533");
  bg.addColorStop(1, "#080b20");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
}

/** Page 2-3 of the journal: real jewel-cut, numbered stars from one azimuth half of the actual sky. */
export function StarMapSpreadPage({ sky, numberedStars, minAltitude = -2, widthPx, heightPx }: StarMapSpreadPageProps) {
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

      const scale = Math.min(width, height) / 640;
      const cx = width / 2;
      const cy = height / 2;
      const fieldRadius = Math.hypot(width, height) * 0.46;

      drawBackground(ctx, width, height);

      const numberedNames = new Set(numberedStars.map((n) => n.star.name));
      for (const star of sky.stars) {
        if (star.altitude < minAltitude || numberedNames.has(star.name)) continue;
        const point = project(star.azimuth, star.altitude, cx, cy, fieldRadius);
        const r = starRadius(star.mag, scale) * 0.6;
        ctx.globalAlpha = 0.35 + (hash(star.name) % 100) / 200;
        ctx.fillStyle = "#cfd6ee";
        ctx.beginPath();
        ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const points = numberedStars.map(({ code, star }) => ({
        code,
        point: project(star.azimuth, star.altitude, cx, cy, fieldRadius),
      }));

      ctx.strokeStyle = "rgba(244,236,216,.18)";
      ctx.lineWidth = 0.6;
      for (let i = 0; i < points.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(points[i].point.x, points[i].point.y);
        ctx.lineTo(points[i + 1].point.x, points[i + 1].point.y);
        ctx.stroke();
      }

      for (const { code, point } of points) {
        drawJewelStar(ctx, point, Math.max(3.2, 5 * scale), { numberLabel: code });
      }

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
  }, [sky, numberedStars, minAltitude, widthPx, heightPx]);

  return (
    <NightPageShell widthPx={widthPx} heightPx={heightPx} printReady={ready}>
      <div ref={containerRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>
    </NightPageShell>
  );
}
