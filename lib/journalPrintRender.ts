import "server-only";
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
  "qr",
  ...(Array(15).fill("blank") as JournalPageKind[]),
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
}

/**
 * Renders every distinct journal page kind exactly once (not all 26 physical
 * slots — the 15 "blank" pages are identical, so rendering/uploading 15
 * copies would be pure waste) and uploads each to the locked-down
 * `starmaps-print/` Storage prefix (see storage.rules). The 26-entry
 * manifest then just repeats the "blank" storage path for every blank slot.
 */
export async function renderJournalPrintFiles(slug: string): Promise<RenderJournalPrintFilesResult> {
  const { widthPx, heightPx } = computeJournalPagePixelSize();
  const browser = await launchPrintBrowser();
  const pathByKind = new Map<JournalPageKind, string>();

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
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  const manifest: JournalManifestEntry[] = JOURNAL_PAGE_ORDER.map((kind, index) => ({
    page: index + 1,
    kind,
    storagePath: pathByKind.get(kind) as string,
  }));

  return { manifest };
}

export interface RenderLetterInsertResult {
  storagePath: string;
}

/**
 * Renders the sealed letter insert as its OWN, separate print file — never
 * part of the 26-page manifest above. Takes the letter's text/opening date
 * directly (they live on the order, not the shared star map record) rather
 * than reading them back out of Firestore.
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

    const { getBucket } = await import("@/lib/firebase/admin");
    const storagePath = `starmaps-print/${slug}/journal-letter-insert-${Date.now()}.png`;
    await getBucket().file(storagePath).save(buffer, { metadata: { contentType: "image/png" } });

    return { storagePath };
  } finally {
    await browser.close();
  }
}
