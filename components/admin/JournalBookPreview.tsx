import type { ReactNode } from "react";
import { JournalThemeProvider } from "@/components/journal/JournalThemeContext";
import { BackCoverPage } from "@/components/journal/night/BackCoverPage";
import { BlankPage } from "@/components/journal/night/BlankPage";
import { DedicationPage } from "@/components/journal/night/DedicationPage";
import { EssayPage } from "@/components/journal/night/EssayPage";
import { LetterNoticePage } from "@/components/journal/night/LetterNoticePage";
import { MemoryPage } from "@/components/journal/night/MemoryPage";
import { NightCoverPage } from "@/components/journal/night/NightCoverPage";
import { StarKeyPage } from "@/components/journal/night/StarKeyPage";
import { StarMapSpreadPage } from "@/components/journal/night/StarMapSpreadPage";
import { buildJournalPreviewData, MEMORY_CAPTION_FALLBACK } from "@/lib/journalPreviewData";
import type { StarMapRecord } from "@/lib/starmaps";

function PageCard({
  label,
  badge,
  wide,
  children,
}: {
  label: string;
  badge?: string;
  /** StarKeyPage/EssayPage set fixed, print-scale font sizes with real prose/legend text — at the grid's normal single-column width that text overflows and gets clipped, so these two get double width instead of being shrunk to fit. */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`space-y-2 ${wide ? "col-span-2" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-dim">{label}</p>
        {badge && (
          <span className="shrink-0 rounded-full border border-amber/30 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-amber">
            {badge}
          </span>
        )}
      </div>
      <div className="overflow-hidden rounded-lg border border-text/10 shadow-lg shadow-black/40">{children}</div>
    </div>
  );
}

/**
 * Full, physical-book-order preview of every distinct Deri Defter page kind
 * (14 unique renders standing in for the real 27-page book — the 15 blank
 * slots are visually identical, so they're shown once with an "× 15" badge).
 * Renders the same live React components the print pipeline screenshots,
 * unsized (no widthPx/heightPx) so they lay out responsively for on-screen
 * review — no Puppeteer round trip needed just to look at the book.
 */
export function JournalBookPreview({ starMap }: { starMap: StarMapRecord }) {
  const { theme, sky, page1Stars, page2Stars, narrative, essay, memoryPhotos, qrUrl } = buildJournalPreviewData(starMap);

  return (
    <JournalThemeProvider theme={theme}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <PageCard label="Sayfa 1 — Kapak">
          <NightCoverPage names={starMap.title} />
        </PageCard>
        <PageCard label="Sayfa 2 — Yıldız Haritası">
          <StarMapSpreadPage sky={sky} numberedStars={page1Stars} azimuthFrom={0} azimuthTo={180} />
        </PageCard>
        <PageCard label="Sayfa 3 — Yıldız Haritası">
          <StarMapSpreadPage sky={sky} numberedStars={page2Stars} azimuthFrom={180} azimuthTo={360} />
        </PageCard>
        <PageCard label="Sayfa 4 — Seyir Kaydı">
          <DedicationPage
            names={starMap.title}
            eventDateUtc={starMap.eventDateUtc}
            timezone={starMap.timezone}
            locationName={starMap.locationName}
            latitude={starMap.latitude}
            longitude={starMap.longitude}
          />
        </PageCard>
        <PageCard label="Sayfa 5 — Yıldız Anahtarı" wide>
          <StarKeyPage numberedStars={[...page1Stars, ...page2Stars]} narrative={narrative} />
        </PageCard>
        {[0, 1, 2, 3].map((index) => {
          const photo = memoryPhotos[index] ?? {};
          const caption = photo.caption ?? MEMORY_CAPTION_FALLBACK[index] ?? "";
          return (
            <PageCard key={index} label={`Sayfa ${6 + index} — Birlikte Anılarımız`}>
              <MemoryPage photo={photo} caption={caption} />
            </PageCard>
          );
        })}
        <PageCard label="Sayfa 10 — Günün Anlamı" wide>
          <EssayPage essay={essay} />
        </PageCard>
        <PageCard label="Sayfa 11–25 — Boş" badge="× 15">
          <BlankPage />
        </PageCard>
        <PageCard label="Sayfa 26 — Gelecek Mektubu Notu">
          <LetterNoticePage />
        </PageCard>
        <PageCard label="Sayfa 27 — Arka Kapak + QR">
          <BackCoverPage qrUrl={qrUrl} />
        </PageCard>
      </div>
    </JournalThemeProvider>
  );
}
