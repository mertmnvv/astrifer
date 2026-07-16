import "server-only";
import { assembleJournalPdf } from "@/lib/journalPrintPdf";
import { cmToPrintPixelSize, type PrintPixelSize } from "@/lib/printSizing";
import { launchPrintBrowser } from "@/lib/printBrowser";
import { createPrintRenderToken } from "@/lib/printRenderToken";
import { getSiteUrl } from "@/lib/siteUrl";

/** A5 portrait trim — placeholder pending real physical-book size sign-off. */
export const JOURNAL_TRIM_CM = { width: 14.8, height: 21 };

export const JOURNAL_PAGE_KINDS = [
  "cover",
  "starmap-1",
  "starmap-2",
  "star-key",
  "memory-1",
  "memory-2",
  "memory-3",
  "memory-4",
  "essay",
  "qr",
  "blank",
  "back-cover",
] as const;

export type JournalPageKind = (typeof JOURNAL_PAGE_KINDS)[number];

/** The physical 26-page order — "blank" appears 15 times but is rendered/uploaded only once (see renderJournalPrintFiles). */
export const JOURNAL_PAGE_ORDER: JournalPageKind[] = [
  "cover",
  "starmap-1",
  "starmap-2",
  "star-key",
  "memory-1",
  "memory-2",
  "memory-3",
  "memory-4",
  "essay",
  ...(Array(15).fill("blank") as JournalPageKind[]),
  "qr",
  "back-cover",
];

export function computeJournalPagePixelSize(): PrintPixelSize {
  return cmToPrintPixelSize(JOURNAL_TRIM_CM.width, JOURNAL_TRIM_CM.height);
}

export interface JournalManifestEntry {
  page: number;
  kind: JournalPageKind;
  storagePath: string;
}

export interface RenderJournalPrintFilesResult {
  manifest: JournalManifestEntry[];
  /** Storage path of the single, full-bleed 26-page PDF assembled from the manifest — the file handed to the print shop. */
  pdfStoragePath: string;
}

/**
 * Renders every distinct journal page kind exactly once (not all 26 physical
 * slots — the 15 "blank" pages are identical, so rendering/uploading 15
 * copies would be pure waste) and uploads each to the locked-down
 * `starmaps-print/` Storage prefix (see storage.rules). The 26-entry
 * manifest then just repeats the "blank" storage path for every blank slot.
 * The same in-memory buffers are also assembled into a single print-ready
 * PDF (lib/journalPrintPdf.ts) covering all 26 physical pages in order.
 */
export async function renderJournalPrintFiles(slug: string): Promise<RenderJournalPrintFilesResult> {
  const { widthPx, heightPx } = computeJournalPagePixelSize();
  const browser = await launchPrintBrowser();
  const pathByKind = new Map<JournalPageKind, string>();
  const bufferByKind = new Map<JournalPageKind, Buffer>();

  try {
    const { getBucket } = await import("@/lib/firebase/admin");
    const bucket = getBucket();
    const timestamp = Date.now();

    for (const kind of JOURNAL_PAGE_KINDS) {
      const token = await createPrintRenderToken(slug);
      const url = `${getSiteUrl()}/print/journal/${encodeURIComponent(slug)}/${kind}?w=${widthPx}&h=${heightPx}&token=${token}`;

      const page = await browser.newPage();
      try {
        await page.setViewport({ width: widthPx, height: heightPx, deviceScaleFactor: 1 });
        await page.goto(url, { waitUntil: "networkidle0" });
        const targetHandle = await page.waitForSelector('[data-print-ready="true"]', { timeout: 30_000 });
        if (!targetHandle) throw new Error(`Defter sayfası zamanında hazır olmadı: ${kind}`);
        const buffer = (await targetHandle.screenshot({ type: "png" })) as Buffer;

        const storagePath = `starmaps-print/${slug}/journal-${kind}-${timestamp}.png`;
        await bucket.file(storagePath).save(buffer, { metadata: { contentType: "image/png" } });
        pathByKind.set(kind, storagePath);
        bufferByKind.set(kind, buffer);
      } finally {
        await page.close();
      }
    }

    const manifest: JournalManifestEntry[] = JOURNAL_PAGE_ORDER.map((kind, index) => ({
      page: index + 1,
      kind,
      storagePath: pathByKind.get(kind) as string,
    }));

    const orderedBuffers = JOURNAL_PAGE_ORDER.map((kind) => bufferByKind.get(kind) as Buffer);
    const pdfBuffer = await assembleJournalPdf(orderedBuffers, JOURNAL_TRIM_CM);
    const pdfStoragePath = `starmaps-print/${slug}/journal-book-${timestamp}.pdf`;
    await bucket.file(pdfStoragePath).save(pdfBuffer, { metadata: { contentType: "application/pdf" } });

    return { manifest, pdfStoragePath };
  } finally {
    await browser.close();
  }
}

export interface RenderLetterInsertResult {
  storagePath: string;
}

/**
 * Renders the sealed letter insert as its OWN, separate print file — never
 * part of the 26-page manifest above. Takes the letter's text/opening date
 * directly (they live on the order, not the shared star map record) rather
 * than reading them back out of Firestore. Uploaded as a single-page PDF
 * (not a raw PNG) so the print shop always receives the same file format
 * as the main book.
 */
export async function renderLetterInsert(
  slug: string,
  letterText: string,
  openingDateIso: string,
): Promise<RenderLetterInsertResult> {
  const { widthPx, heightPx } = computeJournalPagePixelSize();
  const token = await createPrintRenderToken(slug);
  const params = new URLSearchParams({
    w: String(widthPx),
    h: String(heightPx),
    token,
    letterText,
    openingDate: openingDateIso,
  });
  const url = `${getSiteUrl()}/print/journal/${encodeURIComponent(slug)}/letter-insert?${params.toString()}`;

  const browser = await launchPrintBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: widthPx, height: heightPx, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "networkidle0" });
    const targetHandle = await page.waitForSelector('[data-print-ready="true"]', { timeout: 30_000 });
    if (!targetHandle) throw new Error("Mektup eki zamanında hazır olmadı.");
    const buffer = (await targetHandle.screenshot({ type: "png" })) as Buffer;
    const pdfBuffer = await assembleJournalPdf([buffer], JOURNAL_TRIM_CM);

    const { getBucket } = await import("@/lib/firebase/admin");
    const storagePath = `starmaps-print/${slug}/journal-letter-insert-${Date.now()}.pdf`;
    await getBucket().file(storagePath).save(pdfBuffer, { metadata: { contentType: "application/pdf" } });

    return { storagePath };
  } finally {
    await browser.close();
  }
}
