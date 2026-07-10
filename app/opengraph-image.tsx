import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Astrifer — Kişiye Özel Yıldız Haritası";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const AMBER = "#e6b877";
const MUTED = "#a99e92";

// Same crosshair motif as icon.tsx/apple-icon.tsx/LogoMark.tsx, scaled up
// for this card, from its 24-unit viewBox.
const MOTIF_SIZE = 96;
const SCALE = MOTIF_SIZE / 24;
const STROKE = 7;

export default async function OpengraphImage() {
  const fontData = await readFile(path.join(process.cwd(), "public/fonts/InstrumentSerif-Italic.ttf"));

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
          background: "radial-gradient(circle at 50% 42%, #1c130c 0%, #0b0810 70%)",
        }}
      >
        <div style={{ position: "relative", width: MOTIF_SIZE, height: MOTIF_SIZE, display: "flex" }}>
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
        <div
          style={{
            marginTop: 18,
            display: "flex",
            fontSize: 96,
            fontFamily: "Instrument Serif",
            fontStyle: "italic",
            fontWeight: 400,
            color: AMBER,
          }}
        >
          Astrifer
        </div>
        <div style={{ marginTop: 10, display: "flex", fontSize: 30, color: MUTED }}>
          Gökyüzü o an, sonsuza dek sizin.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Instrument Serif",
          data: fontData,
          style: "italic",
          weight: 400,
        },
      ],
    },
  );
}
