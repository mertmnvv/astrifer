import "server-only";
import type { PosterSize } from "@/lib/pricing";
import { cmToPrintPixelSize, type PrintPixelSize } from "@/lib/printSizing";
import { launchPrintBrowser } from "@/lib/printBrowser";
import { createPrintRenderToken } from "@/lib/printRenderToken";
import { getSiteUrl } from "@/lib/siteUrl";

export type { PrintPixelSize };

export function computePrintPixelSize(size: PosterSize): PrintPixelSize {
  const [widthCm, heightCm] = size.split("x").map(Number);
  return cmToPrintPixelSize(widthCm, heightCm);
}

export interface RenderPrintFileResult {
  storagePath: string;
  widthPx: number;
  heightPx: number;
  dpi: number;
}

export interface PosterPrintOptions {
  /** Nebula hue mood override; omit to use the print page's own default. */
  mood?: "warm" | "cool" | "neutral";
  /** Personal message override; omit to fall back to the star map's own message. */
  message?: string;
  /** Small-caps band headline override. */
  headline?: string;
}

/**
 * Headlessly renders a star map's /print/[slug] page at exact print-target
 * pixel dimensions and uploads the still frame to the locked-down
 * `starmaps-print/` Storage prefix (see storage.rules — no client policy
 * reaches it at all). The browser instance and the page it screenshots both
 * run server-side only; nothing here is ever sent to a user's browser.
 *
 * Screenshots the element carrying `data-print-ready="true"` — for the
 * poster this is PosterPrintFrame's outer wrapper (art canvas + HTML text
 * band composited into one element), not the bare canvas, so the print
 * file matches the live preview's art+band layout exactly.
 */
export async function renderPrintFile(
  slug: string,
  size: PosterSize,
  options: PosterPrintOptions = {},
): Promise<RenderPrintFileResult> {
  const { widthPx, heightPx, dpi } = computePrintPixelSize(size);
  const token = await createPrintRenderToken(slug);
  const params = new URLSearchParams({ w: String(widthPx), h: String(heightPx), token });
  if (options.mood) params.set("mood", options.mood);
  if (options.message) params.set("message", options.message);
  if (options.headline) params.set("headline", options.headline);
  const url = `${getSiteUrl()}/print/${encodeURIComponent(slug)}?${params.toString()}`;

  const browser = await launchPrintBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: widthPx, height: heightPx, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "networkidle0" });
    const targetHandle = await page.waitForSelector('[data-print-ready="true"]', { timeout: 30_000 });
    if (!targetHandle) {
      throw new Error("Baskı yüzeyi zamanında hazır olmadı.");
    }
    const buffer = (await targetHandle.screenshot({ type: "png" })) as Buffer;

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
