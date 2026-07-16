import "server-only";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import { computeSky } from "@/lib/astronomy/computeSky";
import { buildSkyEssay, buildSkyNarrative } from "@/lib/astronomy/skyNarrative";
import { getSiteUrl } from "@/lib/siteUrl";
import type { StarMapPhoto, StarMapRecord } from "@/lib/starmaps";
import { pickNumberedStars, splitSkyByAzimuth, type NumberedStar } from "@/components/journal/starMapSpread";
import { getJournalTheme, type JournalTheme } from "@/components/journal/night/journalTheme";

export const MEMORY_CAPTION_FALLBACK = ["İlk “Merhaba”", "O Gece", "Yüzük", "Ailece"];

export interface JournalPreviewData {
  theme: JournalTheme;
  sky: ComputeSkyResult;
  page1Stars: NumberedStar[];
  page2Stars: NumberedStar[];
  narrative: string;
  essay: string;
  memoryPhotos: StarMapPhoto[];
  qrUrl: string;
}

/**
 * Single source of truth for the sky/star/theme data every Deri Defter page
 * kind needs — shared by the Puppeteer print route
 * (app/print/journal/[slug]/[page]/page.tsx) and the admin production
 * preview (components/admin/JournalBookPreview.tsx) so both always render
 * from identical numbering/theme logic.
 */
export function buildJournalPreviewData(starMap: StarMapRecord): JournalPreviewData {
  const sky = computeSky({ date: starMap.eventDateUtc, latitude: starMap.latitude, longitude: starMap.longitude });
  const westHalf = splitSkyByAzimuth(sky, 0, 180);
  const eastHalf = splitSkyByAzimuth(sky, 180, 360);
  const page1Stars = pickNumberedStars(westHalf, 6, 1);
  const page2Stars = pickNumberedStars(eastHalf, 6, 7);
  const initialEntry = starMap.entries.find((entry) => entry.isInitial) ?? starMap.entries[0];

  return {
    theme: getJournalTheme(starMap.journalThemeId || starMap.palette),
    sky,
    page1Stars,
    page2Stars,
    narrative: buildSkyNarrative(sky),
    essay: buildSkyEssay(sky),
    memoryPhotos: initialEntry?.photos ?? [],
    qrUrl: `${getSiteUrl()}/s/${starMap.slug}`,
  };
}
