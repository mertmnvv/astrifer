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
 * vignette, dashed brass inset border) onto a canvas region of arbitrary
 * (not necessarily square) width/height. Framework-agnostic like
 * drawStarChart — no continuous animation needed since the texture itself
 * never changes.
 */
export function drawLeatherTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const rnd = mulberry32(42);
  const diag = Math.sqrt(width * width + height * height);

  ctx.clearRect(0, 0, width, height);

  const base = ctx.createRadialGradient(width * 0.5, height * 0.35, 0, width * 0.5, height * 0.5, diag * 0.55);
  base.addColorStop(0, THEME.leatherLt);
  base.addColorStop(0.55, THEME.leather);
  base.addColorStop(1, THEME.leatherDk);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  const speckleCount = Math.round(width * height * 0.012);
  for (let i = 0; i < speckleCount; i++) {
    const x = rnd() * width;
    const y = rnd() * height;
    ctx.globalAlpha = 0.02 + rnd() * 0.05;
    ctx.fillStyle = rnd() > 0.5 ? "#000000" : "#7a5a3c";
    ctx.beginPath();
    ctx.arc(x, y, 0.6 + rnd() * 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    diag * 0.25,
    width * 0.5,
    height * 0.5,
    diag * 0.53,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  const margin = Math.max(6, Math.min(width, height) * 0.035);
  ctx.strokeStyle = "rgba(230,184,119,0.28)";
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
  ctx.setLineDash([]);
}
