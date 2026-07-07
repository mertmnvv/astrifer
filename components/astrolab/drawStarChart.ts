import type { ComputeSkyResult, SkyObjectPoint } from "@/lib/astronomy/computeSky";
import { ASTROLAB_THEME as THEME } from "./theme";

export interface DrawStarChartOptions {
  /** Logical (CSS) pixel size of the square canvas. Caller handles devicePixelRatio scaling. */
  size: number;
  /** Animation clock in seconds. Pass a fixed value (e.g. 0) for a static/print render. */
  time: number;
  /** When true, sparkle animation is replaced by a fixed baseline glow (no motion). */
  reducedMotion: boolean;
  /** Only objects at or above this altitude (degrees) are drawn. Defaults to -2 (true horizon, with a small buffer). */
  minAltitude?: number;
  /** Draw name labels next to bright stars/Sun/Moon/planets. Defaults to true; disable for small decorative previews where text would just be noise. */
  showLabels?: boolean;
}

const DEG2RAD = Math.PI / 180;

// Slow whole-field rotation around the zenith, evoking the sky's real
// diurnal drift relative to a fixed horizon — a decorative pace (one turn
// every ~10 minutes), not the true (imperceptibly slow) sidereal rate. The
// positions themselves stay exact; only this animation is stylized.
const DRIFT_DEG_PER_SEC = 0.6;

/** Named stars/bodies at or brighter than this magnitude get a label. */
const LABEL_MAG_THRESHOLD = 1.6;

// Cheap deterministic string hash (djb2) — used only to desynchronize the
// cosmetic twinkle animation per star, never to derive star positions.
function hash(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(h);
}

/** Maps horizontal coordinates to a point on the disk. North is up, azimuth runs clockwise. */
function project(
  azimuthDeg: number,
  altitudeDeg: number,
  cx: number,
  cy: number,
  diskRadius: number,
): { x: number; y: number; rNorm: number } {
  const rNorm = Math.min(1, Math.max(0, (90 - altitudeDeg) / 90));
  const canvasAngle = (azimuthDeg - 90) * DEG2RAD;
  return {
    x: cx + rNorm * diskRadius * Math.cos(canvasAngle),
    y: cy + rNorm * diskRadius * Math.sin(canvasAngle),
    rNorm,
  };
}

function starRadius(mag: number, scale: number): number {
  return Math.max(0.5, 3.4 - mag * 0.55) * scale;
}

function drawBezel(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, scale: number) {
  const innerR = outerR * 0.88;

  ctx.save();
  ctx.strokeStyle = THEME.brass;
  ctx.lineWidth = 2.5 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = THEME.brassDim;
  ctx.lineWidth = 1.25 * scale;
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.stroke();

  // Degree ticks between the two bezel rings: minor every 5°, major every 30°.
  for (let deg = 0; deg < 360; deg += 5) {
    const isMajor = deg % 30 === 0;
    const angle = (deg - 90) * DEG2RAD;
    const from = isMajor ? innerR + (outerR - innerR) * 0.15 : innerR + (outerR - innerR) * 0.35;
    const to = outerR - (outerR - innerR) * 0.12;
    const x1 = cx + from * Math.cos(angle);
    const y1 = cy + from * Math.sin(angle);
    const x2 = cx + to * Math.cos(angle);
    const y2 = cy + to * Math.sin(angle);
    ctx.strokeStyle = isMajor ? THEME.brass : THEME.brassDim;
    ctx.lineWidth = (isMajor ? 1.4 : 0.7) * scale;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();

  return innerR;
}

const CARDINALS: { label: string; deg: number; weight: "major" | "minor" }[] = [
  { label: "K", deg: 0, weight: "major" },
  { label: "D", deg: 90, weight: "major" },
  { label: "G", deg: 180, weight: "major" },
  { label: "B", deg: 270, weight: "major" },
  { label: "KD", deg: 45, weight: "minor" },
  { label: "GD", deg: 135, weight: "minor" },
  { label: "GB", deg: 225, weight: "minor" },
  { label: "KB", deg: 315, weight: "minor" },
];

function drawDirectionLetters(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number, scale: number) {
  const midR = (outerR + innerR) / 2;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const { label, deg, weight } of CARDINALS) {
    const angle = (deg - 90) * DEG2RAD;
    const x = cx + midR * Math.cos(angle);
    const y = cy + midR * Math.sin(angle);
    ctx.fillStyle = weight === "major" ? THEME.brass : THEME.brassDim;
    ctx.font = `${weight === "major" ? 700 : 500} ${(weight === "major" ? 15 : 10) * scale}px var(--font-mono, monospace)`;
    ctx.fillText(label, x, y);
  }
  ctx.restore();
}

function drawDisk(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number) {
  const gradient = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
  gradient.addColorStop(0, THEME.parchment);
  gradient.addColorStop(1, "#e4dabf");
  ctx.save();
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  point: { x: number; y: number },
  mag: number,
  scale: number,
  time: number,
  reducedMotion: boolean,
  seed: number,
) {
  const r = starRadius(mag, scale);

  // Bright stars (mag < 2.5) get a soft pulsing brass halo — the "sparkle."
  // Positions and core dots never move or resize from this; only the glow's
  // opacity animates, and only when the viewer allows motion.
  if (mag < 2.5) {
    const phase = (seed % 1000) / 1000;
    const speed = 1.4 + ((seed >> 3) % 500) / 500;
    const glowAlpha = reducedMotion
      ? 0.35
      : 0.2 + 0.28 * (0.5 + 0.5 * Math.sin(time * speed + phase * Math.PI * 2));
    const glowR = r * 3.4;
    const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, glowR);
    glow.addColorStop(0, `rgba(201, 168, 106, ${glowAlpha})`);
    glow.addColorStop(1, "rgba(201, 168, 106, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(point.x, point.y, glowR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = THEME.ink;
  ctx.beginPath();
  ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** Skips labels too close to the bezel edge, where text would get clipped by the disk. */
function drawLabel(
  ctx: CanvasRenderingContext2D,
  point: { x: number; y: number; rNorm: number },
  text: string,
  scale: number,
) {
  if (point.rNorm > 0.92) return;
  ctx.save();
  ctx.globalAlpha = 0.72;
  ctx.fillStyle = THEME.ink;
  ctx.font = `400 ${9 * scale}px var(--font-mono, monospace)`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, point.x + 5 * scale, point.y);
  ctx.restore();
}

function drawPlanet(ctx: CanvasRenderingContext2D, point: { x: number; y: number }, mag: number, scale: number) {
  const r = Math.max(2.2, 3.8 - mag * 0.3) * scale;
  ctx.save();
  ctx.fillStyle = THEME.ink;
  ctx.beginPath();
  ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = THEME.brass;
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.arc(point.x, point.y, r + 1.6 * scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawSun(ctx: CanvasRenderingContext2D, point: { x: number; y: number }, scale: number) {
  const r = 6 * scale;
  ctx.save();
  ctx.strokeStyle = THEME.brass;
  ctx.lineWidth = 1.4 * scale;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(point.x + Math.cos(angle) * (r + 2 * scale), point.y + Math.sin(angle) * (r + 2 * scale));
    ctx.lineTo(point.x + Math.cos(angle) * (r + 6 * scale), point.y + Math.sin(angle) * (r + 6 * scale));
    ctx.stroke();
  }
  ctx.fillStyle = THEME.brass;
  ctx.beginPath();
  ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawMoon(
  ctx: CanvasRenderingContext2D,
  point: { x: number; y: number },
  illumination: number,
  moonAge: number,
  scale: number,
) {
  const r = 6.5 * scale;
  // Waxing moon shows its bright limb on the right, as seen from mid-northern
  // latitudes; waning shows it on the left. Good enough for a keepsake glyph.
  const brightOnRight = moonAge < 0.5;
  const k = Math.max(0, Math.min(1, illumination));

  ctx.save();
  ctx.beginPath();
  ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = THEME.ink;
  ctx.fillRect(point.x - r, point.y - r, r * 2, r * 2);

  // Bright half-disk on the correct limb (bounded by the vertical diameter).
  ctx.fillStyle = THEME.parchment;
  ctx.beginPath();
  ctx.moveTo(point.x, point.y - r);
  ctx.arc(point.x, point.y, r, -Math.PI / 2, Math.PI / 2, !brightOnRight);
  ctx.closePath();
  ctx.fill();

  // Terminator ellipse narrows the crescent (k<0.5, painted dark) or widens
  // the gibbous (k>0.5, painted bright) over that half-disk.
  const termRx = r * Math.abs(1 - 2 * k);
  ctx.fillStyle = k <= 0.5 ? THEME.ink : THEME.parchment;
  ctx.beginPath();
  ctx.ellipse(point.x, point.y, termRx, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = THEME.brassDim;
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
  ctx.stroke();
}

/**
 * Draws one frame of the astrolab star chart onto a 2D canvas context.
 * Framework-agnostic on purpose: the live preview calls this every animation
 * frame, and the 300dpi print worker (headless Chromium via Puppeteer) can
 * call the exact same function with `reducedMotion: true` for a crisp still.
 */
export function drawStarChart(
  ctx: CanvasRenderingContext2D,
  sky: ComputeSkyResult | null,
  options: DrawStarChartOptions,
): void {
  const { size, time, reducedMotion } = options;
  const minAltitude = options.minAltitude ?? -2;
  const showLabels = options.showLabels ?? true;
  const driftDeg = reducedMotion ? 0 : (time * DRIFT_DEG_PER_SEC) % 360;
  const scale = size / 640;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.47;

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = THEME.void;
  ctx.fillRect(0, 0, size, size);

  const innerR = drawBezel(ctx, cx, cy, outerR, scale);
  const diskR = innerR * 0.965;
  drawDisk(ctx, cx, cy, diskR);

  if (!sky) {
    drawDirectionLetters(ctx, cx, cy, outerR, innerR, scale);
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, diskR, 0, Math.PI * 2);
  ctx.clip();

  for (const star of sky.stars) {
    if (star.altitude < minAltitude) continue;
    const point = project(star.azimuth + driftDeg, star.altitude, cx, cy, diskR);
    drawStar(ctx, point, star.mag, scale, time, reducedMotion, hash(star.name));
    if (showLabels && star.mag < LABEL_MAG_THRESHOLD) {
      drawLabel(ctx, point, star.name, scale);
    }
  }

  for (const body of sky.bodies) {
    if (body.altitude < minAltitude) continue;
    const point = project(body.azimuth + driftDeg, body.altitude, cx, cy, diskR);
    if (body.kind === "sun") {
      drawSun(ctx, point, scale);
    } else if (body.kind === "moon") {
      drawMoon(ctx, point, body.illumination, sky.moonAge, scale);
    } else {
      drawPlanet(ctx, point, body.mag, scale);
    }
    if (showLabels) {
      drawLabel(ctx, point, body.name, scale);
    }
  }

  // Zenith mark.
  ctx.fillStyle = THEME.brassDim;
  ctx.beginPath();
  ctx.arc(cx, cy, 1.6 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  drawDirectionLetters(ctx, cx, cy, outerR, innerR, scale);
}

export function objectLabel(point: SkyObjectPoint): string {
  return point.kind === "star" ? point.name : point.name;
}
