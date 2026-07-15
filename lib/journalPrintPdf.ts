import "server-only";
import { PDFDocument, type PDFImage } from "pdf-lib";

const PT_PER_CM = 72 / 2.54;

/**
 * Assembles pre-rendered 300dpi PNG page buffers into a single, full-bleed
 * print-ready PDF sized exactly to `trimCm` — no page.pdf()/print-CSS
 * involved, so the DPI stays exactly what the caller's screenshot pipeline
 * (lib/journalPrintRender.ts) already targeted. Buffers repeated by
 * reference (e.g. the same blank-page PNG reused for all 15 blank slots)
 * are embedded once and reused, keeping file size down.
 */
export async function assembleJournalPdf(
  orderedBuffers: Buffer[],
  trimCm: { width: number; height: number },
): Promise<Buffer> {
  const widthPt = trimCm.width * PT_PER_CM;
  const heightPt = trimCm.height * PT_PER_CM;

  const pdfDoc = await PDFDocument.create();
  const embedCache = new Map<Buffer, PDFImage>();

  for (const buffer of orderedBuffers) {
    let image = embedCache.get(buffer);
    if (!image) {
      image = await pdfDoc.embedPng(buffer);
      embedCache.set(buffer, image);
    }
    const page = pdfDoc.addPage([widthPt, heightPt]);
    page.drawImage(image, { x: 0, y: 0, width: widthPt, height: heightPt });
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
