import { mulberry32 } from "@/lib/prng";
import type { JournalTheme } from "./journalTheme";

/**
 * Vegan-leather cover texture — grain speckle, subtle crease lines, and a
 * soft light sheen, same technique as components/journal/drawLeatherTexture.ts's
 * warm-brown version, but colored per the active JournalTheme.
 */
export function drawNightLeatherTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: JournalTheme["leather"],
  seed = 42,
): void {
  const rnd = mulberry32(seed);

  ctx.clearRect(0, 0, width, height);

  const [stop0, stop1, stop2, stop3] = theme.gradientStops;
  const base = ctx.createRadialGradient(width * 0.38, height * 0.3, 0, width * 0.5, height * 0.55, Math.max(width, height) * 0.85);
  base.addColorStop(0, stop0);
  base.addColorStop(0.45, stop1);
  base.addColorStop(0.8, stop2);
  base.addColorStop(1, stop3);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  const grainCount = Math.round(width * height * 0.01);
  for (let i = 0; i < grainCount; i++) {
    const x = rnd() * width;
    const y = rnd() * height;
    ctx.globalAlpha = 0.03 + rnd() * 0.06;
    ctx.fillStyle = rnd() > 0.55 ? theme.grainDark : theme.grainLight;
    ctx.beginPath();
    ctx.arc(x, y, 0.5 + rnd() * 1.0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = theme.creaseStroke;
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 14; i++) {
    let cx = rnd() * width;
    let cy = rnd() * height;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    for (let s = 0; s < 3; s++) {
      cx += (rnd() - 0.5) * width * 0.18;
      cy += (rnd() - 0.5) * height * 0.1;
      ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }

  const sheen = ctx.createRadialGradient(width * 0.28, height * 0.2, 0, width * 0.28, height * 0.2, width * 0.5);
  sheen.addColorStop(0, `rgba(${theme.sheenRgb},.10)`);
  sheen.addColorStop(1, `rgba(${theme.sheenRgb},0)`);
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, width, height);

  const vignette = ctx.createRadialGradient(width * 0.5, height * 0.5, Math.min(width, height) * 0.32, width * 0.5, height * 0.5, Math.max(width, height) * 0.72);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,.55)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = theme.borderDashRgba;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 4]);
  ctx.strokeRect(9, 9, width - 18, height - 18);
  ctx.setLineDash([]);
}
