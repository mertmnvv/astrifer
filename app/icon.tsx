import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const BRASS = "#c9a86a";
const VOID = "#05060d";

// Same orbit-ellipse + center star + lit point motif as LogoMark.tsx,
// scaled from its 100-unit design to this icon's pixel size (satori/
// ImageResponse can't reliably render arbitrary SVG, so the shapes are
// rebuilt with plain CSS boxes instead of importing the SVG component).
const SCALE = size.width / 100;

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
        {/* Orbit ellipse: bounding box of rx=36,ry=22 centered at (50,50), rotated in place. */}
        <div
          style={{
            position: "absolute",
            left: 14 * SCALE,
            top: 28 * SCALE,
            width: 72 * SCALE,
            height: 44 * SCALE,
            border: `${4 * SCALE}px solid ${BRASS}`,
            borderRadius: "50%",
            opacity: 0.7,
            transform: "rotate(-12deg)",
          }}
        />
        {/* Center star. */}
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
        {/* Lit point on the orbit (rotated position of t=-25° pre-computed). */}
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
