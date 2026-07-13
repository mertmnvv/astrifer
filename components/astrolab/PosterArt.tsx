"use client";

import { useEffect, useRef, useState } from "react";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import { drawDeepSkyField } from "./drawDeepSkyField";
import { drawMoon, drawPlanet, drawSun, project } from "./drawStarChart";
import { drawMilkyWayBand, drawNebulaClouds } from "./drawNebulaSky";
import type { NebulaMood } from "./nebulaMood";
import type { SkyPalette } from "./palettes";
import { sceneSeed } from "./sceneSeed";
import { QrCode } from "@/components/QrCode";

export interface PosterArtProps {
  sky: ComputeSkyResult;
  palette: SkyPalette;
  mood: NebulaMood;
  /** Exactly one of the user's uploaded photos — soft oval vignette, fixed lower-left third. */
  photoUrl?: string | null;
  qrUrl: string;
  className?: string;
  /** Fixed pixel size for the print render; omit for a responsive, container-filling live preview. */
  widthPx?: number;
  heightPx?: number;
  onReady?: () => void;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#0c0e1c");
  gradient.addColorStop(0.55, "#080a16");
  gradient.addColorStop(1, "#050409");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const horizon = ctx.createRadialGradient(width * 0.5, height * 1.02, 0, width * 0.5, height * 1.02, width * 0.9);
  horizon.addColorStop(0, "rgba(150,86,54,0.18)");
  horizon.addColorStop(1, "rgba(150,86,54,0)");
  ctx.fillStyle = horizon;
  ctx.fillRect(0, 0, width, height);
}

async function drawPhotoVignette(ctx: CanvasRenderingContext2D, width: number, height: number, photoUrl: string) {
  const img = await loadImage(photoUrl);
  const cx = width * 0.26;
  const cy = height * 0.72;
  const rx = width * 0.17;
  const ry = rx * 1.25;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.clip();

  const imgRatio = img.width / img.height;
  const boxRatio = rx / ry;
  let drawWidth: number;
  let drawHeight: number;
  if (imgRatio > boxRatio) {
    drawHeight = ry * 2.1;
    drawWidth = drawHeight * imgRatio;
  } else {
    drawWidth = rx * 2.1;
    drawHeight = drawWidth / imgRatio;
  }
  ctx.drawImage(img, cx - drawWidth / 2, cy - drawHeight / 2, drawWidth, drawHeight);

  const shade = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
  shade.addColorStop(0, "rgba(5,6,12,0)");
  shade.addColorStop(1, "rgba(5,6,12,0.4)");
  ctx.fillStyle = shade;
  ctx.fillRect(cx - rx * 1.2, cy - ry * 1.2, rx * 2.4, ry * 2.4);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = Math.max(1, width * 0.0012);
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawEdgeLine(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.strokeStyle = "rgba(232,201,116,0.55)";
  ctx.lineWidth = Math.max(1, width * 0.0022);
  const inset = ctx.lineWidth / 2;
  ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);
  ctx.restore();
}

async function drawScene(
  ctx: CanvasRenderingContext2D,
  sky: ComputeSkyResult,
  width: number,
  height: number,
  palette: SkyPalette,
  mood: NebulaMood,
  photoUrl?: string | null,
) {
  const scale = Math.min(width, height) / 640;
  const cx = width / 2;
  const cy = height / 2;
  const fieldRadius = Math.hypot(width, height) * 0.46;
  const seed = sceneSeed({
    eventDateUtc: sky.time,
    latitude: sky.observer.latitude,
    longitude: sky.observer.longitude,
    salt: "poster-art",
  });

  ctx.clearRect(0, 0, width, height);
  drawBackground(ctx, width, height);
  drawMilkyWayBand(ctx, { width, height, seed, mood });
  drawNebulaClouds(ctx, { width, height, seed, mood });
  drawDeepSkyField(ctx, sky, { width, height, seed });

  for (const body of sky.bodies) {
    if (body.altitude < -2) continue;
    const point = project(body.azimuth, body.altitude, cx, cy, fieldRadius);
    if (body.kind === "sun") drawSun(ctx, point, scale, palette);
    else if (body.kind === "moon") drawMoon(ctx, point, body.illumination, sky.moonAge, scale, palette);
    else drawPlanet(ctx, point, body.mag, scale, palette);
  }

  if (photoUrl) {
    try {
      await drawPhotoVignette(ctx, width, height, photoUrl);
    } catch {
      // Photo failed to load (e.g. blocked in a headless print context) — the
      // art still stands on its own without the vignette rather than failing.
    }
  }

  drawEdgeLine(ctx, width, height);
}

export function PosterArt({
  sky,
  palette,
  mood,
  photoUrl,
  qrUrl,
  className,
  widthPx,
  heightPx,
  onReady,
}: PosterArtProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [qrSizePx, setQrSizePx] = useState(48);
  const isFixedSize = widthPx !== undefined && heightPx !== undefined;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false;

    const render = async (cssWidth: number, cssHeight: number, dpr: number) => {
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      await drawScene(ctx, sky, cssWidth, cssHeight, palette, mood, photoUrl);
      if (cancelled) return;
      setQrSizePx(Math.max(28, Math.min(420, cssWidth * 0.09)));
      onReady?.();
    };

    if (isFixedSize) {
      render(widthPx as number, heightPx as number, 1);
      return () => {
        cancelled = true;
      };
    }

    const container = containerRef.current;
    if (!container) return;
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      render(container.clientWidth, container.clientHeight, dpr);
    };
    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sky, palette, mood, photoUrl, widthPx, heightPx, isFixedSize]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className ?? ""}`}
      style={isFixedSize ? { width: widthPx, height: heightPx } : undefined}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div
        className="absolute rounded-[4px] p-[6%]"
        style={{ right: "3%", bottom: "3%", width: qrSizePx, height: qrSizePx, background: "rgba(237,233,220,0.92)" }}
      >
        <QrCode url={qrUrl} sizePx={qrSizePx * 0.88} darkColor="#14120e" lightColor="#00000000" />
      </div>
    </div>
  );
}
