import "server-only";
import type { PosterSize } from "@/lib/pricing";
import { createPrintRenderToken } from "@/lib/printRenderToken";

const PRINT_DPI = 300;
const CM_PER_INCH = 2.54;

// Headless Chromium screenshots at, say, 70cm/300dpi (8268×8268px) risk
// blowing the memory/duration budget of a serverless function. Past this
// side length we scale the target down and report the DPI we actually hit,
// rather than silently producing an oversized or truncated render.
const MAX_PRINT_SIDE_PX = 4500;

export interface PrintPixelSize {
  widthPx: number;
  heightPx: number;
  /** May be lower than PRINT_DPI if MAX_PRINT_SIDE_PX capped the render. */
  dpi: number;
}

export function computePrintPixelSize(size: PosterSize): PrintPixelSize {
  const [widthCm, heightCm] = size.split("x").map(Number);
  const nominalWidthPx = Math.round((widthCm / CM_PER_INCH) * PRINT_DPI);
  const nominalHeightPx = Math.round((heightCm / CM_PER_INCH) * PRINT_DPI);
  const longestSide = Math.max(nominalWidthPx, nominalHeightPx);

  if (longestSide <= MAX_PRINT_SIDE_PX) {
    return { widthPx: nominalWidthPx, heightPx: nominalHeightPx, dpi: PRINT_DPI };
  }

  const scale = MAX_PRINT_SIDE_PX / longestSide;
  return {
    widthPx: Math.round(nominalWidthPx * scale),
    heightPx: Math.round(nominalHeightPx * scale),
    dpi: Math.round(PRINT_DPI * scale),
  };
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

async function launchBrowser() {
  const puppeteer = await import("puppeteer-core");

  if (process.env.NODE_ENV === "production") {
    const chromium = (await import("@sparticuz/chromium")).default;
    return puppeteer.launch({
      executablePath: await chromium.executablePath(),
      args: chromium.args,
      headless: true,
    });
  }

  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (!executablePath) {
    throw new Error(
      "PUPPETEER_EXECUTABLE_PATH tanımlı değil — geliştirme ortamında baskı render'ı için yerel bir Chrome/Chromium yolu gerekiyor.",
    );
  }
  return puppeteer.launch({ executablePath, headless: true });
}

export interface RenderPrintFileResult {
  storagePath: string;
  widthPx: number;
  heightPx: number;
  dpi: number;
}

/**
 * Headlessly renders a star map's /print/[slug] page at exact print-target
 * pixel dimensions and uploads the still frame to the locked-down
 * `starmaps-print/` Storage prefix (see storage.rules — no client policy
 * reaches it at all). The browser instance and the page it screenshots both
 * run server-side only; nothing here is ever sent to a user's browser.
 */
export async function renderPrintFile(slug: string, size: PosterSize): Promise<RenderPrintFileResult> {
  const { widthPx, heightPx, dpi } = computePrintPixelSize(size);
  const token = await createPrintRenderToken(slug);
  const url = `${getSiteUrl()}/print/${encodeURIComponent(slug)}?w=${widthPx}&h=${heightPx}&token=${token}`;

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: widthPx, height: heightPx, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "networkidle0" });
    const canvasHandle = await page.waitForSelector('canvas[data-print-ready="true"]', { timeout: 30_000 });
    if (!canvasHandle) {
      throw new Error("Baskı canvas'ı zamanında hazır olmadı.");
    }
    const buffer = (await canvasHandle.screenshot({ type: "png" })) as Buffer;

    const { getBucket } = await import("@/lib/firebase/admin");
    const storagePath = `starmaps-print/${slug}/${size}-${Date.now()}.png`;
    await getBucket().file(storagePath).save(buffer, {
      metadata: { contentType: "image/png" },
    });

    return { storagePath, widthPx, heightPx, dpi };
  } finally {
    await browser.close();
  }
}
