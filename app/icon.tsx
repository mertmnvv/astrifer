import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const AMBER = "#e6b877";
const VOID = "#0b0810";

// Same crosshair motif as LogoMark.tsx (variant="crosshair"), rebuilt from
// its 24-unit viewBox as plain CSS boxes — satori/ImageResponse can't
// reliably render arbitrary SVG, and a static favicon has no use for the
// rotation anyway.
const SCALE = size.width / 24;
const STROKE = 3;

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: VOID,
          display: "flex",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 12 * SCALE - STROKE / 2,
            top: 2 * SCALE,
            width: STROKE,
            height: 20 * SCALE,
            borderRadius: STROKE / 2,
            background: AMBER,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 2 * SCALE,
            top: 12 * SCALE - STROKE / 2,
            width: 20 * SCALE,
            height: STROKE,
            borderRadius: STROKE / 2,
            background: AMBER,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
