import { hash } from "./drawStarChart";

/**
 * Astronomically-real colors for the handful of named bright stars a
 * viewer might recognize — approximate sRGB for their true spectral type
 * (e.g. Betelgeuse's red-orange, Rigel's blue-white). Everything not
 * listed here falls back to a deterministic hash-bucketed color in
 * starColor() below, never a claim about that specific star's real color.
 */
export const NAMED_STAR_COLORS: Record<string, string> = {
  Betelgeuse: "#ffb37a",
  Antares: "#ff9c73",
  Aldebaran: "#ffc98c",
  Arcturus: "#ffcf8f",
  Pollux: "#ffd9a0",
  Rigel: "#cfe0ff",
  Sirius: "#eaf2ff",
  Vega: "#e7ecff",
  Spica: "#cddcff",
  Regulus: "#dbe6ff",
  Altair: "#fff6e8",
  Capella: "#fff1d6",
};

/** Fallback hue buckets for stars with no catalogued color — biased warm-white, matching a real night sky's mix. */
const FALLBACK_COLORS = ["#f6f3ff", "#f6f3ff", "#f6f3ff", "#dbe6ff", "#cfe0ff", "#ffe9c2", "#ffd9a0"];

/** Deterministic, stable-per-star color: real color for named bright stars, hash-bucketed otherwise. */
export function starColor(name: string, seed?: number): string {
  const known = NAMED_STAR_COLORS[name];
  if (known) return known;
  const h = seed ?? hash(name);
  return FALLBACK_COLORS[h % FALLBACK_COLORS.length];
}
