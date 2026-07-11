import { notFound } from "next/navigation";
import { PrintStarChart } from "@/components/astrolab/PrintStarChart";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { computeSky } from "@/lib/astronomy/computeSky";
import { getStarMapBySlug } from "@/lib/starmaps";
import { verifyPrintRenderToken } from "@/lib/printRenderToken";

export const dynamic = "force-dynamic";

/**
 * Bare, chrome-less, exact-pixel-size render used only as a headless-browser
 * screenshot target (see lib/printRender.ts) — never a page a person is
 * meant to open. Gated by a short-lived signed token instead of the /admin
 * session cookie because the request coming in is our own server's
 * Puppeteer instance, not an admin's authenticated browser.
 */
export default async function PrintPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { w?: string; h?: string; token?: string };
}) {
  const widthPx = Number(searchParams.w);
  const heightPx = Number(searchParams.h);
  const isValidSize =
    Number.isFinite(widthPx) && Number.isFinite(heightPx) && widthPx > 0 && heightPx > 0 && widthPx <= 6000 && heightPx <= 6000;

  if (!isValidSize) notFound();

  const tokenIsValid = await verifyPrintRenderToken(params.slug, searchParams.token);
  if (!tokenIsValid) notFound();

  const starMap = await getStarMapBySlug(params.slug);
  if (!starMap) notFound();

  const sky = computeSky({
    date: starMap.eventDateUtc,
    latitude: starMap.latitude,
    longitude: starMap.longitude,
  });
  const palette = getSkyPalette(starMap.palette);

  return (
    <div style={{ width: widthPx, height: heightPx, margin: 0 }}>
      <PrintStarChart sky={sky} widthPx={widthPx} heightPx={heightPx} palette={palette} />
    </div>
  );
}
