import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const BRASS = "#c9a86a";
const VOID = "#05060d";

// Same 100-unit orbit-ellipse + center star + lit-point motif as icon.tsx
// and LogoMark.tsx, just scaled to a larger canvas with a bolder stroke so
// the ring doesn't vanish at iOS home-screen sizes.
const SCALE = size.width / 100;

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
            left: 14 * SCALE,
            top: 28 * SCALE,
            width: 72 * SCALE,
            height: 44 * SCALE,
            border: `${6 * SCALE}px solid ${BRASS}`,
            borderRadius: "50%",
            opacity: 0.75,
            transform: "rotate(-12deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 44 * SCALE,
            top: 44 * SCALE,
            width: 12 * SCALE,
            height: 12 * SCALE,
            borderRadius: "50%",
            background: BRASS,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 76 * SCALE,
            top: 30 * SCALE,
            width: 8 * SCALE,
            height: 8 * SCALE,
            borderRadius: "50%",
            background: BRASS,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
