import { notFound } from "next/navigation";
import { BackCoverPage } from "@/components/journal/night/BackCoverPage";
import { BlankPage } from "@/components/journal/night/BlankPage";
import { DedicationPage } from "@/components/journal/night/DedicationPage";
import { EssayPage } from "@/components/journal/night/EssayPage";
import { LetterNoticePage } from "@/components/journal/night/LetterNoticePage";
import { MemoryPage } from "@/components/journal/night/MemoryPage";
import { NightCoverPage } from "@/components/journal/night/NightCoverPage";
import { StarKeyPage } from "@/components/journal/night/StarKeyPage";
import { StarMapSpreadPage } from "@/components/journal/night/StarMapSpreadPage";
import { JournalThemeProvider } from "@/components/journal/JournalThemeContext";
import { buildJournalPreviewData, MEMORY_CAPTION_FALLBACK } from "@/lib/journalPreviewData";
import { getStarMapBySlug } from "@/lib/starmaps";
import { verifyPrintRenderToken } from "@/lib/printRenderToken";
import { JOURNAL_PAGE_KINDS, type JournalPageKind } from "@/lib/journalPrintRender";

export const dynamic = "force-dynamic";

/**
 * Bare, chrome-less, exact-pixel-size render for ONE distinct journal page
 * kind — a headless-browser screenshot target only (see
 * lib/journalPrintRender.ts), gated by a short-lived signed per-slug token
 * (lib/printRenderToken.ts).
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

  const { theme, sky, page1Stars, page2Stars, narrative, essay, memoryPhotos, qrUrl } = buildJournalPreviewData(starMap);
  const shared = { widthPx, heightPx };

  let content: React.ReactNode;
  switch (kind) {
    case "cover":
      content = <NightCoverPage names={starMap.title} {...shared} />;
      break;
    case "dedication":
      content = (
        <DedicationPage
          names={starMap.title}
          eventDateUtc={starMap.eventDateUtc}
          timezone={starMap.timezone}
          locationName={starMap.locationName}
          latitude={starMap.latitude}
          longitude={starMap.longitude}
          {...shared}
        />
      );
      break;
    case "starmap-1":
      content = <StarMapSpreadPage sky={sky} numberedStars={page1Stars} azimuthFrom={0} azimuthTo={180} {...shared} />;
      break;
    case "starmap-2":
      content = <StarMapSpreadPage sky={sky} numberedStars={page2Stars} azimuthFrom={180} azimuthTo={360} {...shared} />;
      break;
    case "star-key":
      content = <StarKeyPage numberedStars={[...page1Stars, ...page2Stars]} narrative={narrative} {...shared} />;
      break;
    case "memory-1":
    case "memory-2":
    case "memory-3":
    case "memory-4": {
      const index = Number(kind.split("-")[1]) - 1;
      const photo = memoryPhotos[index] ?? {};
      const caption = photo.caption ?? MEMORY_CAPTION_FALLBACK[index] ?? "";
      content = <MemoryPage photo={photo} caption={caption} {...shared} />;
      break;
    }
    case "essay":
      content = <EssayPage essay={essay} {...shared} />;
      break;
    case "letter-notice":
      content = <LetterNoticePage {...shared} />;
      break;
    case "blank":
      content = <BlankPage {...shared} />;
      break;
    case "back-cover":
      content = <BackCoverPage qrUrl={qrUrl} {...shared} />;
      break;
    default:
      notFound();
  }

  return <JournalThemeProvider theme={theme}>{content}</JournalThemeProvider>;
}
