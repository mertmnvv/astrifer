import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Astrifer — Kişiye Özel Yıldız Haritası";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRASS = "#c9a86a";
const HAZE = "#8b93b8";

// Same 100-unit orbit-ellipse + center star + lit-point motif as
// icon.tsx/apple-icon.tsx/LogoMark.tsx, scaled up for this card.
const MOTIF_SIZE = 168;
const SCALE = MOTIF_SIZE / 100;

export default async function OpengraphImage() {
  const fontData = await readFile(path.join(process.cwd(), "public/fonts/CormorantGaramond-Italic.woff"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 42%, #131a3a 0%, #05060d 70%)",
        }}
      >
        <div style={{ position: "relative", width: MOTIF_SIZE, height: MOTIF_SIZE, display: "flex" }}>
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
        <div
          style={{
            marginTop: 18,
            display: "flex",
            fontSize: 96,
            fontFamily: "Cormorant Garamond",
            fontStyle: "italic",
            fontWeight: 600,
            color: BRASS,
          }}
        >
          Astrifer
        </div>
        <div style={{ marginTop: 10, display: "flex", fontSize: 30, color: HAZE }}>
          Gökyüzü o an, sonsuza dek sizin.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Cormorant Garamond",
          data: fontData,
          style: "italic",
          weight: 600,
        },
      ],
    },
  );
}
