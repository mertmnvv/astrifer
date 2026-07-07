import type { ComputeSkyResult } from "./computeSky";

interface MoonPhaseName {
  maxAge: number;
  name: string;
}

// Ordered thresholds on moonAge (0..1, 0/1 = new moon, 0.5 = full moon).
const MOON_PHASES: MoonPhaseName[] = [
  { maxAge: 0.03, name: "yeni ay" },
  { maxAge: 0.22, name: "büyüyen hilal" },
  { maxAge: 0.28, name: "ilk dördün" },
  { maxAge: 0.47, name: "büyüyen şişkin ay" },
  { maxAge: 0.53, name: "dolunay" },
  { maxAge: 0.72, name: "küçülen şişkin ay" },
  { maxAge: 0.78, name: "son dördün" },
  { maxAge: 0.97, name: "küçülen hilal" },
  { maxAge: 1, name: "yeni ay" },
];

function moonPhaseName(moonAge: number): string {
  const phase = MOON_PHASES.find((entry) => moonAge <= entry.maxAge);
  return phase?.name ?? "yeni ay";
}

/** Naked-eye brightness cutoff; Uranus/Neptune (mag > 5) never qualify. */
const VISIBLE_PLANET_MAG = 1.8;

/**
 * Builds a short, real-data Turkish description of the sky at the computed
 * instant: the Moon's actual phase/illumination, and which bright planets
 * (if any) were above the horizon. Deliberately omits anything we can't
 * derive from ephemeris data (weather, Milky Way visibility, etc.) — no
 * poetic embellishment that isn't astronomically true.
 */
export function buildSkyNarrative(sky: ComputeSkyResult): string {
  const moon = sky.bodies.find((body) => body.kind === "moon");
  const sentences: string[] = [];

  if (moon) {
    const percent = Math.round(moon.illumination * 100);
    const phase = moonPhaseName(sky.moonAge);
    sentences.push(`Ay %${percent} aydınlıktı ve ${phase} evresindeydi.`);
  }

  const visiblePlanets = sky.bodies
    .filter((body) => body.kind === "planet" && body.altitude > 0 && body.mag < VISIBLE_PLANET_MAG)
    .sort((a, b) => a.mag - b.mag)
    .slice(0, 2);

  if (visiblePlanets.length === 1) {
    sentences.push(`Gökyüzünde ${visiblePlanets[0].name} parlıyordu.`);
  } else if (visiblePlanets.length === 2) {
    sentences.push(`${visiblePlanets[0].name} ve ${visiblePlanets[1].name} gökyüzünde parlıyordu.`);
  }

  return sentences.join(" ");
}
