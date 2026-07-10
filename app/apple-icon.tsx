import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const AMBER = "#e6b877";
const VOID = "#0b0810";

// Same crosshair motif as icon.tsx/LogoMark.tsx, scaled to a larger canvas.
const SCALE = size.width / 24;
const STROKE = 14;

export default function AppleIcon() {
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
