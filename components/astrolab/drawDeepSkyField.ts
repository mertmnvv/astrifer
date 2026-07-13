import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import { mulberry32 } from "@/lib/prng";
import { hash, project, starRadius } from "./drawStarChart";
import { starColor } from "./starColors";

export interface DeepSkyFieldOptions {
  width: number;
  height: number;
  /** Only objects at or above this altitude (degrees) are drawn. */
  minAltitude?: number;
  /** Deterministic scene seed — see sceneSeed.ts. */
  seed: number;
  /** Decorative background star count, for wall-poster density. Default ~900. */
  fillerDensity?: number;
}

function drawGlowingDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  glow: boolean,
) {
  if (glow) {
    const glowR = r * 4;
    const halo = ctx.createRadialGradient(x, y, 0, x, y, glowR);
    halo.addColorStop(0, color);
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Dense, color-varied star field for the poster's "Derin Gökyüzü" art —
 * every real star from `sky.stars` (positioned exactly, colored from
 * starColor()) plus seed-derived decorative filler stars purely for wall
 * density (previous feedback: too sparse looks empty). Filler stars are
 * always dimmer/smaller than the dimmest real cataloged star and never
 * labeled or numbered, so real vs decorative is never conflated — same
 * convention drawStarChart.ts's meteor already uses.
 */
export function drawDeepSkyField(
  ctx: CanvasRenderingContext2D,
  sky: ComputeSkyResult,
  options: DeepSkyFieldOptions,
): void {
  const { width, height, seed } = options;
  const minAltitude = options.minAltitude ?? -2;
  const fillerDensity = options.fillerDensity ?? 900;
  const scale = Math.min(width, height) / 640;
  const cx = width / 2;
  const cy = height / 2;
  const fieldRadius = Math.hypot(width, height) * 0.46;

  const rnd = mulberry32(seed + 7);
  for (let i = 0; i < fillerDensity; i++) {
    const x = rnd() * width;
    const y = rnd() * height;
    const m = rnd();
    const r = (m > 0.985 ? 0.9 + rnd() * 0.5 : 0.3 + rnd() * 0.45) * scale;
    const color = starColor("filler", Math.floor(rnd() * 1000));
    ctx.globalAlpha = 0.35 + rnd() * 0.45;
    drawGlowingDot(ctx, x, y, r, color, false);
  }
  ctx.globalAlpha = 1;

  for (const star of sky.stars) {
    if (star.altitude < minAltitude) continue;
    const point = project(star.azimuth, star.altitude, cx, cy, fieldRadius);
    const r = starRadius(star.mag, scale);
    const color = starColor(star.name, hash(star.name));
    drawGlowingDot(ctx, point.x, point.y, r, color, star.mag < 2.5);
  }
}
