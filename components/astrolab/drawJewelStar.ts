export interface JewelStarOptions {
  numberLabel?: string;
  color?: string;
}

/**
 * Four-pointed "jewel cut" star mark for the journal's star-map spread —
 * bright core, soft outer glow, thin ray lines, with an optional small
 * numbered badge (the "01", "02"... codes tying into the Yıldız Anahtarı
 * legend page).
 */
export function drawJewelStar(
  ctx: CanvasRenderingContext2D,
  point: { x: number; y: number },
  size: number,
  options: JewelStarOptions = {},
): void {
  const { x, y } = point;
  const color = options.color ?? "#e8c974";

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4);
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  grad.addColorStop(0, "#fff7de");
  grad.addColorStop(0.55, color);
  grad.addColorStop(1, "rgba(169,131,47,0)");
  ctx.shadowColor = `${color}e6`;
  ctx.shadowBlur = size * 1.4;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size * 0.28, -size * 0.28, size, 0);
  ctx.quadraticCurveTo(size * 0.28, size * 0.28, 0, size);
  ctx.quadraticCurveTo(-size * 0.28, size * 0.28, -size, 0);
  ctx.quadraticCurveTo(-size * 0.28, -size * 0.28, 0, -size);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();

  ctx.strokeStyle = "rgba(255,247,222,.55)";
  ctx.lineWidth = Math.max(0.4, size * 0.08);
  ctx.beginPath();
  ctx.moveTo(x - size * 1.7, y);
  ctx.lineTo(x + size * 1.7, y);
  ctx.moveTo(x, y - size * 1.7);
  ctx.lineTo(x, y + size * 1.7);
  ctx.stroke();

  if (options.numberLabel) {
    const lx = x + size + 6;
    const ly = y - size - 6;
    ctx.font = `600 ${Math.max(9, size * 3.2)}px "Space Mono", monospace`;
    ctx.textBaseline = "middle";
    const tw = ctx.measureText(options.numberLabel).width;
    ctx.fillStyle = "rgba(8,11,32,.6)";
    ctx.fillRect(lx - 2, ly - 7, tw + 4, 14);
    ctx.fillStyle = color;
    ctx.fillText(options.numberLabel, lx, ly);
  }
}
