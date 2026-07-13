import { mulberry32 } from "@/lib/prng";
import type { NebulaMood } from "./nebulaMood";

/** [hue, saturation%, lightness%] ranges the nebula-blob hue is drawn from, per mood. */
const HUE_RANGES: Record<NebulaMood, [number, number][]> = {
  warm: [
    [-20, 20], // rose/magenta
    [20, 45], // amber
  ],
  cool: [
    [190, 230], // teal/blue
    [250, 280], // violet
  ],
  neutral: [
    [210, 230], // low-saturation blue-grey
  ],
};

const SATURATION_BY_MOOD: Record<NebulaMood, [number, number]> = {
  warm: [55, 80],
  cool: [45, 70],
  neutral: [10, 25],
};

export interface NebulaOptions {
  width: number;
  height: number;
  /** Deterministic scene seed — see sceneSeed.ts. */
  seed: number;
  mood: NebulaMood;
}

function pickHue(rnd: () => number, mood: NebulaMood): number {
  const ranges = HUE_RANGES[mood];
  const [lo, hi] = ranges[Math.floor(rnd() * ranges.length) % ranges.length];
  const hue = lo + rnd() * (hi - lo);
  return ((hue % 360) + 360) % 360;
}

/**
 * Paints 5-9 soft, colorful nebula clouds seeded from the order's own
 * date+location(+mood) — every order looks unique, but the same order
 * always redraws identically (live preview vs print render).
 */
export function drawNebulaClouds(ctx: CanvasRenderingContext2D, options: NebulaOptions): void {
  const { width, height, seed, mood } = options;
  const rnd = mulberry32(seed);
  const [satLo, satHi] = SATURATION_BY_MOOD[mood];
  const blobCount = 5 + Math.floor(rnd() * 5); // 5-9

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < blobCount; i++) {
    const cx = width * (0.1 + rnd() * 0.8);
    const cy = height * (0.05 + rnd() * 0.75);
    const radius = Math.max(width, height) * (0.28 + rnd() * 0.42);
    const hue = pickHue(rnd, mood);
    const sat = satLo + rnd() * (satHi - satLo);
    const light = 42 + rnd() * 14;
    const alpha = 0.1 + rnd() * 0.16;

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`);
    gradient.addColorStop(1, `hsla(${hue}, ${sat}%, ${light}%, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}

export interface MilkyWayOptions extends NebulaOptions {
  /** Fixed band angle in degrees; omit to derive it from the seed (0-180). */
  angleDeg?: number;
}

/** Paints one dense, softly-mottled diagonal Milky Way band across the field. */
export function drawMilkyWayBand(ctx: CanvasRenderingContext2D, options: MilkyWayOptions): void {
  const { width, height, seed, mood } = options;
  const rnd = mulberry32(seed + 1);
  const angleDeg = options.angleDeg ?? 20 + rnd() * 45;
  const [satLo] = SATURATION_BY_MOOD[mood];

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate((angleDeg * Math.PI) / 180);

  const bandHeight = Math.max(width, height) * 0.5;
  const bandGradient = ctx.createLinearGradient(0, -bandHeight / 2, 0, bandHeight / 2);
  bandGradient.addColorStop(0, "rgba(220,224,255,0)");
  bandGradient.addColorStop(0.5, `rgba(220,224,255,${0.16 + Math.min(0.1, satLo / 300)})`);
  bandGradient.addColorStop(1, "rgba(220,224,255,0)");
  ctx.fillStyle = bandGradient;
  const span = Math.max(width, height) * 2;
  ctx.fillRect(-span / 2, -bandHeight / 2, span, bandHeight);

  // Soft mottling patches for texture, same PRNG stream so it's stable per-seed.
  const patchCount = 40;
  for (let i = 0; i < patchCount; i++) {
    const x = (rnd() - 0.5) * span;
    const y = (rnd() - 0.5) * bandHeight * 0.7;
    const r = bandHeight * (0.08 + rnd() * 0.16);
    const alpha = 0.05 + rnd() * 0.08;
    const patch = ctx.createRadialGradient(x, y, 0, x, y, r);
    patch.addColorStop(0, `rgba(230,232,255,${alpha})`);
    patch.addColorStop(1, "rgba(230,232,255,0)");
    ctx.fillStyle = patch;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
}
