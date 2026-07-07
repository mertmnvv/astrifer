import { JOURNAL_THEME as THEME } from "./theme";

// Deterministic PRNG (mulberry32) — used only to desynchronize cosmetic
// texture speckle, never to derive any real data.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Draws a static leather texture (radial gradient base, fine speckle,
 * vignette, dashed brass inset border) onto a square canvas region.
 * Framework-agnostic like drawStarChart — no continuous animation needed
 * since the texture itself never changes.
 */
export function drawLeatherTexture(ctx: CanvasRenderingContext2D, size: number): void {
  const rnd = mulberry32(42);

  ctx.clearRect(0, 0, size, size);

  const base = ctx.createRadialGradient(size * 0.5, size * 0.35, 0, size * 0.5, size * 0.5, size * 0.75);
  base.addColorStop(0, THEME.leatherLt);
  base.addColorStop(0.55, THEME.leather);
  base.addColorStop(1, THEME.leatherDk);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  const speckleCount = Math.round(size * size * 0.012);
  for (let i = 0; i < speckleCount; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    ctx.globalAlpha = 0.02 + rnd() * 0.05;
    ctx.fillStyle = rnd() > 0.5 ? "#000000" : "#7a5a3c";
    ctx.beginPath();
    ctx.arc(x, y, 0.6 + rnd() * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const vignette = ctx.createRadialGradient(
    size * 0.5,
    size * 0.5,
    size * 0.35,
    size * 0.5,
    size * 0.5,
    size * 0.72,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size, size);

  const margin = Math.max(6, size * 0.035);
  ctx.strokeStyle = "rgba(201,168,106,0.28)";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);
  ctx.strokeRect(margin, margin, size - margin * 2, size - margin * 2);
  ctx.setLineDash([]);
}
