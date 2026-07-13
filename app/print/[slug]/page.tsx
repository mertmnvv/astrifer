import { notFound } from "next/navigation";
import { PosterPrintFrame } from "@/components/astrolab/PosterPrintFrame";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { resolvePosterHeadline } from "@/components/astrolab/posterHeadline";
import type { NebulaMood } from "@/components/astrolab/nebulaMood";
import { computeSky } from "@/lib/astronomy/computeSky";
import { formatCoords } from "@/lib/geo/formatCoords";
import { getSiteUrl } from "@/lib/siteUrl";
import { getStarMapBySlug } from "@/lib/starmaps";
import { verifyPrintRenderToken } from "@/lib/printRenderToken";

export const dynamic = "force-dynamic";

const VALID_MOODS: NebulaMood[] = ["warm", "cool", "neutral"];

/**
 * Bare, chrome-less, exact-pixel-size render used only as a headless-browser
 * screenshot target (see lib/printRender.ts) — never a page a person is
 * meant to open. Gated by a short-lived signed token instead of the /admin
 * session cookie because the request coming in is our own server's
 * Puppeteer instance, not an admin's authenticated browser.
 *
 * `mood`/`message`/`headline` are optional cosmetic overrides passed by
 * renderPrintFile() from the order's own poster configuration — they're
 * plain display text, not access control, so they ride along unsigned; the
 * per-slug token is what actually gates the request.
 */
export default async function PrintPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { w?: string; h?: string; token?: string; mood?: string; message?: string; headline?: string };
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
  const mood: NebulaMood = VALID_MOODS.includes(searchParams.mood as NebulaMood)
    ? (searchParams.mood as NebulaMood)
    : "warm";
  const personalMessage = searchParams.message ?? starMap.message ?? "";
  const headline = searchParams.headline ?? resolvePosterHeadline(null);
  const photoUrl = starMap.entries.flatMap((entry) => entry.photos).find((photo) => photo.url)?.url ?? null;

  const dateTimeLabel = new Intl.DateTimeFormat("tr-TR", {
    timeZone: starMap.timezone,
    dateStyle: "long",
    timeStyle: "short",
  })
    .format(starMap.eventDateUtc)
    .toUpperCase();
  const coordsLabel = formatCoords(starMap.latitude, starMap.longitude);

  return (
    <div style={{ margin: 0 }}>
      <PosterPrintFrame
        sky={sky}
        widthPx={widthPx}
        heightPx={heightPx}
        palette={palette}
        mood={mood}
        photoUrl={photoUrl}
        qrUrl={`${getSiteUrl()}/s/${params.slug}`}
        headline={headline}
        personalMessage={personalMessage}
        names={starMap.title}
        dateTimeLabel={dateTimeLabel}
        coordsLabel={coordsLabel}
      />
    </div>
  );
}
