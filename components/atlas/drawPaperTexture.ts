import { ATLAS_THEME as THEME } from "./theme";

// Deterministic PRNG (mulberry32) — used only to desynchronize cosmetic
// texture speckle, never to derive any real data. Same technique as
// components/journal/drawLeatherTexture.ts.
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
 * Draws a static warm-parchment texture (radial gradient base, very light
 * speckle, a couple of faint ruled lines, soft vignette) onto a canvas
 * region of arbitrary width/height. No continuous animation — the texture
 * never changes, so a single draw per resize is enough.
 */
export function drawPaperTexture(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const rnd = mulberry32(7);
  const diag = Math.sqrt(width * width + height * height);

  ctx.clearRect(0, 0, width, height);

  const base = ctx.createRadialGradient(width * 0.5, height * 0.32, 0, width * 0.5, height * 0.5, diag * 0.6);
  base.addColorStop(0, THEME.parchment);
  base.addColorStop(0.6, THEME.parchmentDim);
  base.addColorStop(1, THEME.parchmentDim);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  const speckleCount = Math.round(width * height * 0.006);
  for (let i = 0; i < speckleCount; i++) {
    const x = rnd() * width;
    const y = rnd() * height;
    ctx.globalAlpha = 0.015 + rnd() * 0.03;
    ctx.fillStyle = rnd() > 0.5 ? THEME.leather : THEME.ink;
    ctx.beginPath();
    ctx.arc(x, y, 0.5 + rnd() * 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Faint ruled ledger lines.
  const ruleCount = Math.max(3, Math.round(height / 42));
  ctx.strokeStyle = "rgba(42,35,24,0.05)";
  ctx.lineWidth = 1;
  for (let i = 1; i < ruleCount; i++) {
    const y = (height / ruleCount) * i;
    ctx.beginPath();
    ctx.moveTo(width * 0.06, y);
    ctx.lineTo(width * 0.94, y);
    ctx.stroke();
  }

  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    diag * 0.3,
    width * 0.5,
    height * 0.5,
    diag * 0.58,
  );
  vignette.addColorStop(0, "rgba(42,35,24,0)");
  vignette.addColorStop(1, "rgba(42,35,24,0.12)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}
