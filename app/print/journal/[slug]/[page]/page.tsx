import { notFound } from "next/navigation";
import { BackCoverPage } from "@/components/journal/night/BackCoverPage";
import { BlankPage } from "@/components/journal/night/BlankPage";
import { EssayPage } from "@/components/journal/night/EssayPage";
import { MemoryPage } from "@/components/journal/night/MemoryPage";
import { NightCoverPage } from "@/components/journal/night/NightCoverPage";
import { QrPage } from "@/components/journal/night/QrPage";
import { StarKeyPage } from "@/components/journal/night/StarKeyPage";
import { StarMapSpreadPage } from "@/components/journal/night/StarMapSpreadPage";
import { pickNumberedStars, splitSkyByAzimuth } from "@/components/journal/starMapSpread";
import { computeSky } from "@/lib/astronomy/computeSky";
import { buildSkyEssay, buildSkyNarrative } from "@/lib/astronomy/skyNarrative";
import { getSiteUrl } from "@/lib/siteUrl";
import { getStarMapBySlug } from "@/lib/starmaps";
import { verifyPrintRenderToken } from "@/lib/printRenderToken";
import { JOURNAL_PAGE_KINDS, type JournalPageKind } from "@/lib/journalPrintRender";

export const dynamic = "force-dynamic";

const MEMORY_CAPTION_FALLBACK = ["İlk “Merhaba”", "O Gece", "Yüzük", "Ailece"];

/**
 * Bare, chrome-less, exact-pixel-size render for ONE distinct journal page
 * kind — a headless-browser screenshot target only (see
 * lib/journalPrintRender.ts), gated by the same per-slug token as the
 * poster's /print/[slug] route.
 */
export default async function JournalPrintPage({
  params,
  searchParams,
}: {
  params: { slug: string; page: string };
  searchParams: { w?: string; h?: string; token?: string };
}) {
  const widthPx = Number(searchParams.w);
  const heightPx = Number(searchParams.h);
  const isValidSize =
    Number.isFinite(widthPx) && Number.isFinite(heightPx) && widthPx > 0 && heightPx > 0 && widthPx <= 6000 && heightPx <= 6000;
  if (!isValidSize) notFound();

  if (!JOURNAL_PAGE_KINDS.includes(params.page as JournalPageKind)) notFound();
  const kind = params.page as JournalPageKind;

  const tokenIsValid = await verifyPrintRenderToken(params.slug, searchParams.token);
  if (!tokenIsValid) notFound();

  const starMap = await getStarMapBySlug(params.slug);
  if (!starMap) notFound();

  const sky = computeSky({ date: starMap.eventDateUtc, latitude: starMap.latitude, longitude: starMap.longitude });
  const westHalf = splitSkyByAzimuth(sky, 0, 180);
  const eastHalf = splitSkyByAzimuth(sky, 180, 360);
  const page1Stars = pickNumberedStars(westHalf, 6, 1);
  const page2Stars = pickNumberedStars(eastHalf, 6, 7);
  const initialEntry = starMap.entries.find((entry) => entry.isInitial) ?? starMap.entries[0];
  const memoryPhotos = initialEntry?.photos ?? [];

  const shared = { widthPx, heightPx };

  switch (kind) {
    case "cover":
      return <NightCoverPage names={starMap.title} {...shared} />;
    case "starmap-1":
      return <StarMapSpreadPage sky={sky} numberedStars={page1Stars} {...shared} />;
    case "starmap-2":
      return <StarMapSpreadPage sky={sky} numberedStars={page2Stars} {...shared} />;
    case "star-key":
      return <StarKeyPage numberedStars={[...page1Stars, ...page2Stars]} narrative={buildSkyNarrative(sky)} {...shared} />;
    case "memory-1":
    case "memory-2":
    case "memory-3":
    case "memory-4": {
      const index = Number(kind.split("-")[1]) - 1;
      const photo = memoryPhotos[index] ?? {};
      const caption = photo.caption ?? MEMORY_CAPTION_FALLBACK[index] ?? "";
      return <MemoryPage photo={photo} caption={caption} {...shared} />;
    }
    case "essay":
      return <EssayPage essay={buildSkyEssay(sky)} {...shared} />;
    case "qr":
      return <QrPage qrUrl={`${getSiteUrl()}/s/${params.slug}`} {...shared} />;
    case "blank":
      return <BlankPage {...shared} />;
    case "back-cover":
      return <BackCoverPage {...shared} />;
    default:
      notFound();
  }
}
