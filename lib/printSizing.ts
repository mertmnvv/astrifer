const PRINT_DPI = 300;
const CM_PER_INCH = 2.54;

export interface PrintPixelSize {
  widthPx: number;
  heightPx: number;
  /** May be lower than the nominal DPI if maxSidePx capped the render. */
  dpi: number;
}

/**
 * Converts a physical cm size to print-target pixels at (up to) 300 DPI.
 * Headless Chromium screenshots at, say, 70cm/300dpi (8268×8268px) risk
 * blowing the memory/duration budget of a serverless function, so past
 * `maxSidePx` we scale the target down and report the DPI we actually hit,
 * rather than silently producing an oversized or truncated render.
 */
export function cmToPrintPixelSize(widthCm: number, heightCm: number, maxSidePx = 4500): PrintPixelSize {
  const nominalWidthPx = Math.round((widthCm / CM_PER_INCH) * PRINT_DPI);
  const nominalHeightPx = Math.round((heightCm / CM_PER_INCH) * PRINT_DPI);
  const longestSide = Math.max(nominalWidthPx, nominalHeightPx);

  if (longestSide <= maxSidePx) {
    return { widthPx: nominalWidthPx, heightPx: nominalHeightPx, dpi: PRINT_DPI };
  }

  const scale = maxSidePx / longestSide;
  return {
    widthPx: Math.round(nominalWidthPx * scale),
    heightPx: Math.round(nominalHeightPx * scale),
    dpi: Math.round(PRINT_DPI * scale),
  };
}
