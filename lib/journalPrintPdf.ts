import "server-only";
import { PDFDocument, rgb, type PDFImage } from "pdf-lib";

const PT_PER_CM = 72 / 2.54;

/** Standard print-shop bleed allowance — content has no bleed-aware margin yet, so we overscan the trim image into it. */
export const DEFAULT_BLEED_CM = 0.3;

/**
 * Assembles pre-rendered 300dpi PNG page buffers into a single print-ready
 * PDF — no page.pdf()/print-CSS involved, so the DPI stays exactly what the
 * caller's screenshot pipeline (lib/journalPrintRender.ts) already targeted.
 * Buffers repeated by reference (e.g. the same blank-page PNG reused for all
 * 15 blank slots) are embedded once and reused, keeping file size down.
 *
 * Each page is created at `trimCm + 2*bleedCm` and the trim-size image is
 * scaled up to overscan the whole page — the page components aren't
 * bleed-aware (their edge content is drawn flush to the trim box), so this
 * stretches the outer few millimetres rather than requiring every page's
 * layout math to leave a safe margin. A thin trim-mark rectangle is drawn
 * at the true trim box so a print shop knows exactly where to cut. Good
 * enough for a proof/sample run — once a binder confirms the real trim
 * size, revisit with proper bleed-aware artwork instead of the overscan.
 */
export async function assembleJournalPdf(
  orderedBuffers: Buffer[],
  trimCm: { width: number; height: number },
  bleedCm: number = DEFAULT_BLEED_CM,
): Promise<Buffer> {
  const trimWidthPt = trimCm.width * PT_PER_CM;
  const trimHeightPt = trimCm.height * PT_PER_CM;
  const bleedPt = bleedCm * PT_PER_CM;
  const pageWidthPt = trimWidthPt + bleedPt * 2;
  const pageHeightPt = trimHeightPt + bleedPt * 2;

  const pdfDoc = await PDFDocument.create();
  const embedCache = new Map<Buffer, PDFImage>();

  for (const buffer of orderedBuffers) {
    let image = embedCache.get(buffer);
    if (!image) {
      image = await pdfDoc.embedPng(buffer);
      embedCache.set(buffer, image);
    }
    const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);
    page.drawImage(image, { x: 0, y: 0, width: pageWidthPt, height: pageHeightPt });

    // Trim-mark guide: the true trim box, inset by the bleed allowance.
    page.drawRectangle({
      x: bleedPt,
      y: bleedPt,
      width: trimWidthPt,
      height: trimHeightPt,
      borderColor: rgb(1, 0, 1),
      borderWidth: 0.5,
    });
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
