import type { ComputeSkyResult, StarPoint } from "@/lib/astronomy/computeSky";

export interface NumberedStar {
  code: string;
  star: StarPoint;
}

/**
 * Splits the real sky into two halves by azimuth so the journal's two-page
 * "Büyük Yıldız Haritası" spread reads as one continuous panorama of the
 * actual sky at that moment, rather than showing the same field twice.
 */
export function splitSkyByAzimuth(sky: ComputeSkyResult, fromDeg: number, toDeg: number): StarPoint[] {
  return sky.stars.filter((star) => {
    const az = ((star.azimuth % 360) + 360) % 360;
    return az >= fromDeg && az < toDeg;
  });
}

/**
 * Picks the `count` brightest (lowest magnitude) stars from a set, assigning
 * continuous "01", "02"... codes starting at `startIndex` — these tie into
 * the Yıldız Anahtarı legend page, which maps each code back to its real
 * name.
 */
export function pickNumberedStars(stars: StarPoint[], count: number, startIndex: number): NumberedStar[] {
  return [...stars]
    .sort((a, b) => a.mag - b.mag)
    .slice(0, count)
    .map((star, index) => ({ code: String(startIndex + index).padStart(2, "0"), star }));
}
