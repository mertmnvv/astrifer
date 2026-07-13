/**
 * Astrifer's thin-line, unfilled 8-point star mark with a small center dot
 * — the poster/journal print mark. Kept as a standalone canvas function
 * (not merged into the site-wide LogoMark SVG component) since it's used
 * from print-target canvases as well as React previews.
 */
export function drawLogoThinStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color = "#e8c974",
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(0.9, r * 0.045);
  ctx.lineCap = "round";
  for (let angle = 0; angle < 360; angle += 45) {
    const rad = (angle * Math.PI) / 180;
    const len = angle % 90 === 0 ? r * 0.85 : r * 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(rad) * len, cy + Math.sin(rad) * len);
    ctx.stroke();
  }
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
