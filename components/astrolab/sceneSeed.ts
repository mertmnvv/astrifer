import { seedFromParts } from "@/lib/prng";

export interface SceneSeedInput {
  eventDateUtc: Date;
  latitude: number;
  longitude: number;
  /** Distinguishes independent PRNG streams derived from the same order (e.g. "nebula" vs "filler-stars"). */
  salt: string;
}

/**
 * Deterministic seed for decorative-but-unique art (nebula clouds, Milky
 * Way angle, filler star field) — keyed only off the same date+location
 * every order already provides to computeSky(), so the live preview and
 * the print render (identical inputs) always produce pixel-identical
 * output. Never a source of real astronomical data.
 */
export function sceneSeed(input: SceneSeedInput): number {
  return seedFromParts(input.eventDateUtc.toISOString(), input.latitude.toFixed(4), input.longitude.toFixed(4), input.salt);
}
