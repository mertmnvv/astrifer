/**
 * Astrifer's thin-line, unfilled 8-point star mark with a small center dot
 * — the journal's print mark. Kept as a standalone canvas function (not
 * merged into the site-wide LogoMark SVG component) since it's used from
 * print-target canvases as well as React previews.
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

/**
 * Thin double-ring compass/sextant bezel with degree ticks — frames the
 * thin-line star mark on the journal cover so it reads as a navigation
 * instrument ("seyir kaydı") rather than a plain logo mark. Cardinal ticks
 * (every 90°) are drawn longer than the minor ticks (every 30°).
 */
export function drawCompassRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color = "#e8c974",
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = Math.max(0.7, r * 0.014);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.32;
  ctx.lineWidth = Math.max(0.6, r * 0.01);
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.9, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.6;
  for (let angle = 0; angle < 360; angle += 30) {
    const rad = (angle * Math.PI) / 180;
    const isCardinal = angle % 90 === 0;
    const inner = r * (isCardinal ? 0.78 : 0.86);
    const outer = r * 1.04;
    ctx.lineWidth = isCardinal ? Math.max(0.9, r * 0.016) : Math.max(0.6, r * 0.01);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * inner, cy + Math.sin(rad) * inner);
    ctx.lineTo(cx + Math.cos(rad) * outer, cy + Math.sin(rad) * outer);
    ctx.stroke();
  }
  ctx.restore();
}
