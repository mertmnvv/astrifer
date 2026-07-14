import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import { drawJewelStar } from "./drawJewelStar";
import { DEFAULT_SKY_PALETTE, type SkyPalette } from "./palettes";

export interface DrawStarChartOptions {
  /** Logical (CSS) pixel width. Caller handles devicePixelRatio scaling. */
  width: number;
  /** Logical (CSS) pixel height. */
  height: number;
  /** Animation clock in seconds. Pass a fixed value (e.g. 0) for a static/print render. */
  time: number;
  /** When true, twinkle/drift/meteor animation is replaced by a fixed still frame. */
  reducedMotion: boolean;
  /** Only objects at or above this altitude (degrees) are drawn. Defaults to -2 (true horizon, with a small buffer). */
  minAltitude?: number;
  /** Draw name labels next to bright stars/Sun/Moon/planets. Defaults to true; disable for small decorative previews where text would just be noise. */
  showLabels?: boolean;
  /** Color scheme. Defaults to "Gece Mavisi". */
  palette?: SkyPalette;
}

const DEG2RAD = Math.PI / 180;

// Slow whole-field rotation around the zenith, evoking the sky's real
// diurnal drift relative to a fixed horizon — a decorative pace (one turn
// every ~10 minutes), not the true (imperceptibly slow) sidereal rate. The
// star *positions* themselves stay astronomically exact; only this
// animation is stylized.
const DRIFT_DEG_PER_SEC = 0.6;

/** Named stars/bodies at or brighter than this magnitude get a label. */
const LABEL_MAG_THRESHOLD = 1.6;

export interface SkyLabelEntry {
  /** Sequential "1", "2", "3"... assigned brightest-first — ties a chart mark to a Yıldız Anahtarı-style key entry. */
  code: string;
  name: string;
  kind: "star" | "sun" | "moon" | "planet";
}

/**
 * Picks every object the chart would label (bright stars + visible Sun/Moon/
 * planets) and assigns each a brightest-first "1", "2", "3"... code — the
 * same numbered-key idea as the physical journal's Yıldız Anahtarı page
 * (see components/journal/starMapSpread.ts), reused here so the live/public
 * chart can mark stars with a number instead of burning their real name
 * directly onto the sky. Exported so a legend UI can render the same list
 * the canvas actually drew, with matching codes.
 */
export function buildSkyLabels(
  sky: ComputeSkyResult | null,
  minAltitude = -2,
  magThreshold = LABEL_MAG_THRESHOLD,
): SkyLabelEntry[] {
  if (!sky) return [];
  const candidates: { name: string; kind: SkyLabelEntry["kind"]; mag: number }[] = [];
  for (const star of sky.stars) {
    if (star.altitude < minAltitude || star.mag >= magThreshold) continue;
    candidates.push({ name: star.name, kind: "star", mag: star.mag });
  }
  for (const body of sky.bodies) {
    if (body.altitude < minAltitude) continue;
    candidates.push({ name: body.name, kind: body.kind, mag: body.mag });
  }
  candidates.sort((a, b) => a.mag - b.mag);
  return candidates.map((c, index) => ({ code: String(index + 1), name: c.name, kind: c.kind }));
}

const METEOR_CYCLE_SECONDS = 9;
const METEOR_DURATION_SECONDS = 1.1;

// Cheap deterministic hash (djb2) — used only to desynchronize cosmetic
// animation (twinkle phase, meteor timing/position), never to derive real
// star positions or data. Exported so other decorative drawing modules
// (nebula/deep-sky-field/jewel-star) can derive their own cosmetic seeds
// from the same star/body names without duplicating this function.
export function hash(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(h);
}

/** Maps horizontal coordinates to a point in the sky field. North is up, azimuth runs clockwise. */
export function project(
  azimuthDeg: number,
  altitudeDeg: number,
  cx: number,
  cy: number,
  fieldRadius: number,
): { x: number; y: number; rNorm: number } {
  const rNorm = Math.min(1, Math.max(0, (90 - altitudeDeg) / 90));
  const canvasAngle = (azimuthDeg - 90) * DEG2RAD;
  return {
    x: cx + rNorm * fieldRadius * Math.cos(canvasAngle),
    y: cy + rNorm * fieldRadius * Math.sin(canvasAngle),
    rNorm,
  };
}

export function starRadius(mag: number, scale: number): number {
  return Math.max(0.5, 3.4 - mag * 0.55) * scale;
}

/** Soft radial gradient, never flat/pure black — easy on the eyes at any hour. */
function drawSkyBackground(ctx: CanvasRenderingContext2D, width: number, height: number, palette: SkyPalette) {
  const gradient = ctx.createRadialGradient(
    width * 0.5,
    height * 0.42,
    0,
    width * 0.5,
    height * 0.5,
    Math.hypot(width, height) * 0.62,
  );
  gradient.addColorStop(0, palette.skyCenter);
  gradient.addColorStop(1, palette.skyEdge);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  point: { x: number; y: number },
  mag: number,
  scale: number,
  time: number,
  reducedMotion: boolean,
  seed: number,
  palette: SkyPalette,
) {
  const r = starRadius(mag, scale);

  // Bright stars (mag < 2.5) get a soft pulsing glow halo — the "sparkle."
  // Positions and core dots never move or resize from this; only the glow's
  // opacity animates, and only when the viewer allows motion.
  if (mag < 2.5) {
    const phase = (seed % 1000) / 1000;
    const speed = 1.4 + ((seed >> 3) % 500) / 500;
    const glowAlpha = reducedMotion
      ? 0.4
      : 0.28 + 0.32 * (0.5 + 0.5 * Math.sin(time * speed + phase * Math.PI * 2));
    const glowR = r * 4.2;
    const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, glowR);
    glow.addColorStop(0, `rgba(${palette.starGlowRgb}, ${glowAlpha})`);
    glow.addColorStop(1, `rgba(${palette.starGlowRgb}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(point.x, point.y, glowR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = palette.star;
  ctx.beginPath();
  ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Small pill badge carrying a Yıldız Anahtarı-style number — used next to
 * Sun/Moon/planet icons, which already read as themselves and just need a
 * key reference rather than the full jewel-mark treatment given to stars.
 * Skips marks too close to the edge, where the badge would run off-canvas.
 */
function drawNumberChip(
  ctx: CanvasRenderingContext2D,
  point: { x: number; y: number; rNorm: number },
  code: string,
  scale: number,
  palette: SkyPalette,
) {
  if (point.rNorm > 0.94) return;
  ctx.save();
  const fontPx = Math.max(8, 8 * scale);
  ctx.font = `600 ${fontPx}px var(--font-mono, monospace)`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  const textWidth = ctx.measureText(code).width;
  const bx = point.x + 6 * scale;
  const padX = 4 * scale;
  const padY = 3 * scale;
  ctx.fillStyle = "rgba(6,4,10,0.55)";
  ctx.fillRect(bx - padX / 2, point.y - fontPx / 2 - padY / 2, textWidth + padX, fontPx + padY);
  ctx.fillStyle = palette.sun;
  ctx.fillText(code, bx, point.y);
  ctx.restore();
}

export function drawPlanet(
  ctx: CanvasRenderingContext2D,
  point: { x: number; y: number },
  mag: number,
  scale: number,
  palette: SkyPalette,
) {
  const r = Math.max(2.2, 3.8 - mag * 0.3) * scale;
  ctx.save();
  ctx.fillStyle = palette.star;
  ctx.beginPath();
  ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = palette.sun;
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.arc(point.x, point.y, r + 1.6 * scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function drawSun(ctx: CanvasRenderingContext2D, point: { x: number; y: number }, scale: number, palette: SkyPalette) {
  const r = 6 * scale;
  ctx.save();
  ctx.strokeStyle = palette.sun;
  ctx.lineWidth = 1.4 * scale;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(point.x + Math.cos(angle) * (r + 2 * scale), point.y + Math.sin(angle) * (r + 2 * scale));
    ctx.lineTo(point.x + Math.cos(angle) * (r + 6 * scale), point.y + Math.sin(angle) * (r + 6 * scale));
    ctx.stroke();
  }
  ctx.fillStyle = palette.sun;
  ctx.beginPath();
  ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawMoon(
  ctx: CanvasRenderingContext2D,
  point: { x: number; y: number },
  illumination: number,
  moonAge: number,
  scale: number,
  palette: SkyPalette,
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

  ctx.fillStyle = palette.moonDark;
  ctx.fillRect(point.x - r, point.y - r, r * 2, r * 2);

  // Bright half-disk on the correct limb (bounded by the vertical diameter).
  ctx.fillStyle = palette.moonLit;
  ctx.beginPath();
  ctx.moveTo(point.x, point.y - r);
  ctx.arc(point.x, point.y, r, -Math.PI / 2, Math.PI / 2, !brightOnRight);
  ctx.closePath();
  ctx.fill();

  // Terminator ellipse narrows the crescent (k<0.5, painted dark) or widens
  // the gibbous (k>0.5, painted bright) over that half-disk.
  const termRx = r * Math.abs(1 - 2 * k);
  ctx.fillStyle = k <= 0.5 ? palette.moonDark : palette.moonLit;
  ctx.beginPath();
  ctx.ellipse(point.x, point.y, termRx, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Faint rim so the disk still reads as "a moon" even near new-moon phase,
  // when its lit area would otherwise almost vanish into the sky.
  ctx.strokeStyle = palette.label;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** A real shooting star: a brief bright streak that fires once per cycle, deterministically timed off the clock. */
function drawMeteor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  palette: SkyPalette,
) {
  const cycleIndex = Math.floor(time / METEOR_CYCLE_SECONDS);
  const cycleTime = time - cycleIndex * METEOR_CYCLE_SECONDS;
  if (cycleTime > METEOR_DURATION_SECONDS) return;

  const seed = hash(`meteor-${cycleIndex}`);
  const startX = width * (0.15 + ((seed % 1000) / 1000) * 0.6);
  const startY = height * (0.08 + (((seed >> 4) % 1000) / 1000) * 0.35);
  const angle = (35 + ((seed >> 8) % 30)) * DEG2RAD;
  const length = Math.max(width, height) * 0.22;
  const dx = Math.cos(angle) * length;
  const dy = Math.sin(angle) * length;

  const progress = cycleTime / METEOR_DURATION_SECONDS;
  const headProgress = Math.min(1, progress * 1.4);
  const tailProgress = Math.max(0, headProgress - 0.4);
  const alpha = Math.sin(Math.PI * Math.min(1, progress));

  const headX = startX + dx * headProgress;
  const headY = startY + dy * headProgress;
  const tailX = startX + dx * tailProgress;
  const tailY = startY + dy * tailProgress;

  ctx.save();
  const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY);
  gradient.addColorStop(0, `rgba(255,255,255,0)`);
  gradient.addColorStop(1, palette.meteor);
  ctx.strokeStyle = gradient;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(tailX, tailY);
  ctx.lineTo(headX, headY);
  ctx.stroke();

  ctx.fillStyle = palette.meteor;
  ctx.beginPath();
  ctx.arc(headX, headY, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Draws one frame of the star chart onto a 2D canvas context: a full-bleed
 * night sky, no decorative frame. Framework-agnostic on purpose: the live
 * preview calls this every animation frame, and the 300dpi print worker
 * (headless Chromium via Puppeteer) can call the exact same function with
 * `reducedMotion: true` for a crisp still.
 */
export function drawStarChart(
  ctx: CanvasRenderingContext2D,
  sky: ComputeSkyResult | null,
  options: DrawStarChartOptions,
): void {
  const { width, height, time, reducedMotion } = options;
  const minAltitude = options.minAltitude ?? -2;
  const showLabels = options.showLabels ?? true;
  const palette = options.palette ?? DEFAULT_SKY_PALETTE;
  const driftDeg = reducedMotion ? 0 : (time * DRIFT_DEG_PER_SEC) % 360;
  const scale = Math.min(width, height) / 640;
  const cx = width / 2;
  const cy = height / 2;
  const fieldRadius = Math.hypot(width, height) * 0.46;

  ctx.clearRect(0, 0, width, height);
  drawSkyBackground(ctx, width, height, palette);

  if (!sky) return;

  const codeByName = showLabels
    ? new Map(buildSkyLabels(sky, minAltitude, LABEL_MAG_THRESHOLD).map((entry) => [entry.name, entry.code]))
    : null;

  for (const star of sky.stars) {
    if (star.altitude < minAltitude) continue;
    const point = project(star.azimuth + driftDeg, star.altitude, cx, cy, fieldRadius);
    const code = codeByName?.get(star.name);
    if (code) {
      const size = Math.max(2.2 * scale, starRadius(star.mag, scale) * 1.9);
      drawJewelStar(ctx, point, size, {
        numberLabel: code,
        color: palette.sun,
        fontFamily: "var(--font-mono, monospace)",
        numberFontPx: Math.max(8, 8 * scale),
      });
    } else {
      drawStar(ctx, point, star.mag, scale, time, reducedMotion, hash(star.name), palette);
    }
  }

  for (const body of sky.bodies) {
    if (body.altitude < minAltitude) continue;
    const point = project(body.azimuth + driftDeg, body.altitude, cx, cy, fieldRadius);
    if (body.kind === "sun") {
      drawSun(ctx, point, scale, palette);
    } else if (body.kind === "moon") {
      drawMoon(ctx, point, body.illumination, sky.moonAge, scale, palette);
    } else {
      drawPlanet(ctx, point, body.mag, scale, palette);
    }
    const code = codeByName?.get(body.name);
    if (code) {
      drawNumberChip(ctx, point, code, scale, palette);
    }
  }

  if (!reducedMotion) {
    drawMeteor(ctx, width, height, time, palette);
  }
}
