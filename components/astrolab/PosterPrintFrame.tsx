"use client";

import { useState } from "react";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import type { NebulaMood } from "./nebulaMood";
import type { SkyPalette } from "./palettes";
import { PosterArt } from "./PosterArt";
import { PosterTextBand } from "./PosterTextBand";

export interface PosterPrintFrameProps {
  sky: ComputeSkyResult;
  widthPx: number;
  heightPx: number;
  palette: SkyPalette;
  mood: NebulaMood;
  photoUrl?: string | null;
  qrUrl: string;
  headline: string;
  personalMessage: string;
  names: string;
  dateTimeLabel: string;
  coordsLabel: string;
}

/**
 * Print-only wrapper: stacks the art canvas and the HTML text band into one
 * element, and only flags itself `data-print-ready` once the art canvas has
 * actually finished drawing (photo load included) — this is the element
 * Puppeteer screenshots (see lib/printRender.ts), so a single print run
 * captures art + band composited into one image.
 */
/** Fraction of the total square print height reserved for the text band — the rest is the clean art area. */
const BAND_HEIGHT_RATIO = 0.16;

export function PosterPrintFrame({
  sky,
  widthPx,
  heightPx,
  palette,
  mood,
  photoUrl,
  qrUrl,
  headline,
  personalMessage,
  names,
  dateTimeLabel,
  coordsLabel,
}: PosterPrintFrameProps) {
  const [artReady, setArtReady] = useState(false);
  const bandHeightPx = Math.round(heightPx * BAND_HEIGHT_RATIO);
  const artHeightPx = heightPx - bandHeightPx;

  return (
    <div
      data-print-ready={artReady ? "true" : "false"}
      style={{ width: widthPx, height: heightPx, display: "flex", flexDirection: "column" }}
    >
      <PosterArt
        sky={sky}
        palette={palette}
        mood={mood}
        photoUrl={photoUrl}
        qrUrl={qrUrl}
        widthPx={widthPx}
        heightPx={artHeightPx}
        onReady={() => setArtReady(true)}
      />
      <PosterTextBand
        headline={headline}
        personalMessage={personalMessage}
        names={names}
        dateTimeLabel={dateTimeLabel}
        coordsLabel={coordsLabel}
        heightPx={bandHeightPx}
      />
    </div>
  );
}
