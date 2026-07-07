import * as Astronomy from "astronomy-engine";
import { STAR_CATALOG } from "./starCatalog";

export interface HorizontalPosition {
  /** Degrees, clockwise from true north: east = 90, south = 180, west = 270. */
  azimuth: number;
  /** Degrees above (positive) or below (negative) the horizon. */
  altitude: number;
}

export interface StarPoint extends HorizontalPosition {
  kind: "star";
  name: string;
  constellation: string;
  /** Equatorial coordinates of date, hours. */
  ra: number;
  /** Equatorial coordinates of date, degrees. */
  dec: number;
  mag: number;
}

export type BodyKind = "sun" | "moon" | "planet";

export interface BodyPoint extends HorizontalPosition {
  kind: BodyKind;
  name: string;
  constellation: string;
  ra: number;
  dec: number;
  mag: number;
  /** Illuminated fraction 0..1. Present for sun/moon/planets alike. */
  illumination: number;
}

export type SkyObjectPoint = StarPoint | BodyPoint;

export interface ComputeSkyInput {
  /** Instant in time (any timezone info is normalized to UTC internally). */
  date: Date;
  /** Degrees, -90..90, north positive. */
  latitude: number;
  /** Degrees, -180..180, east positive. */
  longitude: number;
  /** Meters above sea level. Defaults to 0. */
  elevationMeters?: number;
}

export interface ComputeSkyResult {
  time: Date;
  observer: { latitude: number; longitude: number; elevationMeters: number };
  siderealTimeHours: number;
  stars: StarPoint[];
  bodies: BodyPoint[];
  /** 0 = new moon, 0.5 = full moon, 1 = next new moon. */
  moonAge: number;
}

const PLANET_BODIES: { body: Astronomy.Body; name: string }[] = [
  { body: Astronomy.Body.Mercury, name: "Merkür" },
  { body: Astronomy.Body.Venus, name: "Venüs" },
  { body: Astronomy.Body.Mars, name: "Mars" },
  { body: Astronomy.Body.Jupiter, name: "Jüpiter" },
  { body: Astronomy.Body.Saturn, name: "Satürn" },
  { body: Astronomy.Body.Uranus, name: "Uranüs" },
  { body: Astronomy.Body.Neptune, name: "Neptün" },
];

function starHorizontal(
  raJ2000Hours: number,
  decJ2000Deg: number,
  time: Astronomy.AstroTime,
  observer: Astronomy.Observer,
): HorizontalPosition & { ra: number; dec: number } {
  // Fixed stars have no built-in "of date" helper, so precess J2000 -> equator
  // of date by hand before handing off to Horizon().
  const j2000Vector = Astronomy.VectorFromSphere(
    new Astronomy.Spherical(decJ2000Deg, raJ2000Hours * 15, 1),
    time,
  );
  const ofDateVector = Astronomy.RotateVector(Astronomy.Rotation_EQJ_EQD(time), j2000Vector);
  const ofDate = Astronomy.EquatorFromVector(ofDateVector);
  const horizontal = Astronomy.Horizon(time, observer, ofDate.ra, ofDate.dec, "normal");
  return { azimuth: horizontal.azimuth, altitude: horizontal.altitude, ra: ofDate.ra, dec: ofDate.dec };
}

function bodyPoint(
  body: Astronomy.Body,
  name: string,
  kind: BodyKind,
  time: Astronomy.AstroTime,
  observer: Astronomy.Observer,
): BodyPoint {
  const ofDate = Astronomy.Equator(body, time, observer, true, true);
  const j2000 = Astronomy.Equator(body, time, observer, false, true);
  const horizontal = Astronomy.Horizon(time, observer, ofDate.ra, ofDate.dec, "normal");
  const illum = Astronomy.Illumination(body, time);
  const constellation = Astronomy.Constellation(j2000.ra, j2000.dec);
  return {
    kind,
    name,
    constellation: constellation.name,
    ra: ofDate.ra,
    dec: ofDate.dec,
    mag: illum.mag,
    azimuth: horizontal.azimuth,
    altitude: horizontal.altitude,
    illumination: illum.phase_fraction,
  };
}

/**
 * Computes real (ephemeris-based) positions of the naked-eye sky — bright
 * stars, Sun, Moon, and the classical planets — for a given instant and
 * geographic location. Pure astronomy: no chart projection or pixel math
 * lives here, so it can be reused by the live preview, the print renderer,
 * and any future export format.
 */
export function computeSky(input: ComputeSkyInput): ComputeSkyResult {
  const time = Astronomy.MakeTime(input.date);
  const observer = new Astronomy.Observer(
    input.latitude,
    input.longitude,
    input.elevationMeters ?? 0,
  );

  const stars: StarPoint[] = STAR_CATALOG.map((star) => {
    const { azimuth, altitude, ra, dec } = starHorizontal(star.ra, star.dec, time, observer);
    return {
      kind: "star",
      name: star.name,
      constellation: star.con,
      ra,
      dec,
      mag: star.mag,
      azimuth,
      altitude,
    };
  });

  const bodies: BodyPoint[] = [
    bodyPoint(Astronomy.Body.Sun, "Güneş", "sun", time, observer),
    bodyPoint(Astronomy.Body.Moon, "Ay", "moon", time, observer),
    ...PLANET_BODIES.map(({ body, name }) => bodyPoint(body, name, "planet", time, observer)),
  ];

  return {
    time: input.date,
    observer: {
      latitude: input.latitude,
      longitude: input.longitude,
      elevationMeters: input.elevationMeters ?? 0,
    },
    siderealTimeHours: Astronomy.SiderealTime(time),
    stars,
    bodies,
    moonAge: Astronomy.MoonPhase(time) / 360,
  };
}
