"use client";

import { useJournalTheme } from "@/components/journal/JournalThemeContext";
import { NightPageShell } from "./NightPageShell";

export interface DedicationPageProps {
  names: string;
  eventDateUtc: Date;
  timezone: string;
  locationName: string;
  latitude: number;
  longitude: number;
  widthPx?: number;
  heightPx?: number;
}

function formatCoords(latitude: number, longitude: number): string {
  const lat = `${Math.abs(latitude).toFixed(2)}°${latitude >= 0 ? "K" : "G"}`;
  const lon = `${Math.abs(longitude).toFixed(2)}°${longitude >= 0 ? "D" : "B"}`;
  return `${lat} ${lon}`;
}

function LogLine({ label, value, isFixedSize }: { label: string; value: string; isFixedSize: boolean }) {
  const theme = useJournalTheme();
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-dashed py-2" style={{ borderColor: `${theme.accentMetalDim}55` }}>
      <span
        className={`font-mono uppercase tracking-[0.2em] ${isFixedSize ? "text-[8px]" : "text-[7px] sm:text-[8px]"}`}
        style={{ color: theme.accentMetalDim }}
      >
        {label}
      </span>
      <span
        className={`text-right font-display italic ${isFixedSize ? "text-[13px]" : "text-[10px] sm:text-xs"}`}
        style={{ color: theme.text.body }}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Page 4 — "Seyir Kaydı" dedication page, right after the two-page sky
 * panorama (see JOURNAL_PAGE_ORDER). Frames the couple's moment as a
 * logbook entry confirming the date/time/place/coordinates of the sky the
 * reader just saw, echoing the cover's compass-ring motif instead of
 * repeating the photo-album language used by the memory pages later in the
 * book.
 */
export function DedicationPage({
  names,
  eventDateUtc,
  timezone,
  locationName,
  latitude,
  longitude,
  widthPx,
  heightPx,
}: DedicationPageProps) {
  const theme = useJournalTheme();
  const isFixedSize = widthPx !== undefined && heightPx !== undefined;

  const dateLabel = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long", timeZone: timezone }).format(eventDateUtc);
  const timeLabel = new Intl.DateTimeFormat("tr-TR", { timeStyle: "short", timeZone: timezone }).format(eventDateUtc);

  return (
    <NightPageShell widthPx={widthPx} heightPx={heightPx} printReady={true}>
      <div className="flex h-full w-full flex-col items-center justify-center px-[13%] py-[13%]">
        <p
          className={`text-center font-mono uppercase tracking-[0.3em] ${isFixedSize ? "text-[9px]" : "text-[8px]"}`}
          style={{ color: theme.accentMetal }}
        >
          Seyir Kaydı
        </p>
        <div className="mt-2.5 h-px w-10" style={{ backgroundColor: `${theme.accentMetal}99` }} />

        <p
          className={`mt-6 text-center font-display italic leading-relaxed ${isFixedSize ? "text-[17px]" : "text-sm sm:text-base"}`}
          style={{ color: theme.text.caption }}
        >
          {names}
        </p>

        <div className="mt-8 w-full max-w-[86%] space-y-0.5">
          <LogLine label="Tarih" value={dateLabel} isFixedSize={isFixedSize} />
          <LogLine label="Saat" value={timeLabel} isFixedSize={isFixedSize} />
          <LogLine label="Konum" value={locationName} isFixedSize={isFixedSize} />
          <LogLine label="Koordinat" value={formatCoords(latitude, longitude)} isFixedSize={isFixedSize} />
        </div>

        <p
          className={`mt-8 max-w-[80%] text-center leading-relaxed ${isFixedSize ? "text-[10px]" : "text-[9px] sm:text-[10px]"}`}
          style={{ color: theme.text.bodyMuted }}
        >
          Az önce gördüğünüz gökyüzü, işte tam olarak bu an ve bu konumun gerçek gözlemiydi — kayıt altına alınmış,
          gerçek bir andır.
        </p>
      </div>
    </NightPageShell>
  );
}
