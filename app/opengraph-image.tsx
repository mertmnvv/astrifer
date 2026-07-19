import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const AMBER = "#e6b877";
const VOID = "#0b0810";

export default function OgImage() {
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
          background: `radial-gradient(circle at 50% 40%, #15101a 0%, ${VOID} 70%)`,
        }}
      >
        <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="1.2" strokeLinecap="round">
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="5" y1="5" x2="19" y2="19" opacity="0.45" />
          <line x1="19" y1="5" x2="5" y2="19" opacity="0.45" />
        </svg>
        <div
          style={{
            marginTop: 36,
            fontSize: 76,
            fontStyle: "italic",
            color: "#fbf6ee",
            letterSpacing: "-0.02em",
          }}
        >
          Astrifer
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 28,
            color: AMBER,
            textTransform: "uppercase",
            letterSpacing: "0.3em",
          }}
        >
          Kişiye Özel Yıldız Haritası
        </div>
      </div>
    ),
    { ...size },
  );
}
