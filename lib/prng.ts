/**
 * Deterministic pseudo-random helpers shared by every canvas-drawing module
 * that needs "random but stable" output — the same seed must always
 * produce the same pixels so a live preview and a headless print render
 * (which both start from the same order data) draw identically.
 */

/** mulberry32 PRNG — fast, tiny, good-enough statistical quality for decorative drawing. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** djb2 string hash — turns arbitrary text into a 32-bit unsigned int seed. */
export function hashString(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(h);
}

/** Combines several values (never real astronomical data, only order metadata) into one stable seed. */
export function seedFromParts(...parts: (string | number)[]): number {
  return hashString(parts.join("|"));
}
