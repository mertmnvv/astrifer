"use client";

import { useEffect, useRef, useState } from "react";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import { drawJewelStar } from "@/components/astrolab/drawJewelStar";
import { starRadius } from "@/components/astrolab/drawStarChart";
import { useJournalTheme } from "@/components/journal/JournalThemeContext";
import type { JournalTheme } from "./journalTheme";
import type { NumberedStar } from "../starMapSpread";
import { NightPageShell } from "./NightPageShell";

export interface StarMapSpreadPageProps {
  sky: ComputeSkyResult;
  /** Only these stars are drawn as jewel-cut + numbered; every other real star in this half is a small plain dot for context. */
  numberedStars: NumberedStar[];
  /** This page's azimuth slice, e.g. 0-180 for the left page, 180-360 for the right — must match the same range passed to splitSkyByAzimuth when picking numberedStars, so the two pages tile into one continuous panorama at the spine. */
  azimuthFrom: number;
  azimuthTo: number;
  minAltitude?: number;
  maxAltitude?: number;
  widthPx?: number;
  heightPx?: number;
}

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, theme: JournalTheme["starMap"]) {
  const [stop0, stop1, stop2] = theme.bgGradientStops;
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, stop0);
  bg.addColorStop(0.55, stop1);
  bg.addColorStop(1, stop2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Cylindrical (azimuth → x, altitude → y) panorama projection — unlike a
 * dome/polar chart, this maps linearly so azimuth 180° lands at the exact
 * same y-height and continues at the same slope on both the "starmap-1"
 * (0-180°) and "starmap-2" (180-360°) pages, letting the two-page spread
 * read as one uninterrupted strip of sky rather than two separate charts.
 */
function project(
  azimuthDeg: number,
  altitudeDeg: number,
  azimuthFrom: number,
  azimuthTo: number,
  minAltitude: number,
  maxAltitude: number,
  width: number,
  height: number,
): { x: number; y: number } {
  const x = ((azimuthDeg - azimuthFrom) / (azimuthTo - azimuthFrom)) * width;
  const altNorm = Math.min(1, Math.max(0, (altitudeDeg - minAltitude) / (maxAltitude - minAltitude)));
  const y = height * (1 - altNorm);
  return { x, y };
}

/** Pages 3-4 of the journal: one continuous panoramic strip of the real sky, split across two facing pages. */
export function StarMapSpreadPage({
  sky,
  numberedStars,
  azimuthFrom,
  azimuthTo,
  minAltitude = -2,
  maxAltitude = 78,
  widthPx,
  heightPx,
}: StarMapSpreadPageProps) {
  const theme = useJournalTheme();
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

      const scale = Math.min(width, height) / 500;
      const proj = (az: number, alt: number) => project(az, alt, azimuthFrom, azimuthTo, minAltitude, maxAltitude, width, height);

      drawBackground(ctx, width, height, theme.starMap);

      // Horizon line + azimuth degree ruler — accurate here since the
      // projection is linear, unlike a dome chart.
      const horizonY = proj(azimuthFrom, 0).y;
      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = theme.accentMetal;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      ctx.globalAlpha = 0.4;
      ctx.font = `${Math.max(7, 9 * scale)}px var(--font-mono, monospace)`;
      ctx.fillStyle = theme.accentMetal;
      ctx.textBaseline = "top";
      for (let az = azimuthFrom; az <= azimuthTo; az += 30) {
        const { x } = proj(az, 0);
        ctx.beginPath();
        ctx.moveTo(x, height - height * 0.03);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.textAlign = az === azimuthFrom ? "left" : az === azimuthTo ? "right" : "center";
        ctx.fillText(`${az % 360}°`, x, height - height * 0.052);
      }
      ctx.restore();

      const numberedNames = new Set(numberedStars.map((n) => n.star.name));
      for (const star of sky.stars) {
        const az = ((star.azimuth % 360) + 360) % 360;
        if (az < azimuthFrom || az >= azimuthTo) continue;
        if (star.altitude < minAltitude || numberedNames.has(star.name)) continue;
        const point = proj(az, star.altitude);
        const r = starRadius(star.mag, scale) * 0.6;
        const hash = Math.abs(star.name.split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7));
        ctx.globalAlpha = 0.35 + (hash % 100) / 200;
        ctx.fillStyle = theme.starMap.dimStarColor;
        ctx.beginPath();
        ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const points = numberedStars.map(({ code, star }) => ({
        code,
        point: proj(((star.azimuth % 360) + 360) % 360, star.altitude),
      }));

      ctx.strokeStyle = theme.starMap.connectorLineRgba;
      ctx.lineWidth = 0.6;
      for (let i = 0; i < points.length - 1; i++) {
        ctx.beginPath();
        ctx.moveTo(points[i].point.x, points[i].point.y);
        ctx.lineTo(points[i + 1].point.x, points[i + 1].point.y);
        ctx.stroke();
      }

      for (const { code, point } of points) {
        drawJewelStar(ctx, point, Math.max(3.2, 5 * scale), { numberLabel: code, color: theme.accentMetal });
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
  }, [sky, numberedStars, azimuthFrom, azimuthTo, minAltitude, maxAltitude, widthPx, heightPx, theme]);

  return (
    <NightPageShell widthPx={widthPx} heightPx={heightPx} printReady={ready}>
      <div ref={containerRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      </div>
    </NightPageShell>
  );
}
