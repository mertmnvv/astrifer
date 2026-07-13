import { notFound } from "next/navigation";
import { LetterInsertPage } from "@/components/journal/night/LetterInsertPage";
import { verifyPrintRenderToken } from "@/lib/printRenderToken";

export const dynamic = "force-dynamic";

/**
 * Bare, chrome-less print target for the sealed "Gelecek Mektubu" insert —
 * kept as its own route (not one of the 26 book-page kinds in
 * /print/journal/[slug]/[page]) since this is the most sensitive content in
 * the whole pipeline: the owner's own private letter text. Still gated by
 * the same per-slug signed token as every other print render.
 */
export default async function LetterInsertPrintPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { w?: string; h?: string; token?: string; letterText?: string; openingDate?: string };
}) {
  const widthPx = Number(searchParams.w);
  const heightPx = Number(searchParams.h);
  const isValidSize =
    Number.isFinite(widthPx) && Number.isFinite(heightPx) && widthPx > 0 && heightPx > 0 && widthPx <= 6000 && heightPx <= 6000;
  if (!isValidSize) notFound();

  const tokenIsValid = await verifyPrintRenderToken(params.slug, searchParams.token);
  if (!tokenIsValid) notFound();

  const letterText = searchParams.letterText ?? "";
  const openingDateLabel = searchParams.openingDate
    ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date(searchParams.openingDate))
    : "—";

  return (
    <div data-print-ready="true">
      <LetterInsertPage letterText={letterText} openingDateLabel={openingDateLabel} widthPx={widthPx} heightPx={heightPx} />
    </div>
  );
}
