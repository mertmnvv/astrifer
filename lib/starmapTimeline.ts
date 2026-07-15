import type { TimelineEntry } from "./starmaps";

/** Fixed cadence, anchored at the page's own creation date — not the last entry's date, so a late add never pushes later windows out. */
const WINDOW_MONTHS = 1;

function addMonthsUtc(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

export function periodicEntryCount(entries: TimelineEntry[]): number {
  return entries.filter((entry) => !entry.isInitial).length;
}

/** The date at which the *next* not-yet-added periodic entry becomes eligible. */
export function getNextEligibleDate(createdAt: Date, entries: TimelineEntry[]): Date {
  return addMonthsUtc(createdAt, WINDOW_MONTHS * (periodicEntryCount(entries) + 1));
}

/** Whether the owner is due to add a new moment — drives the on-page badge (and, in a later prompt, the SMS nudge). */
export function isAddWindowOpen(createdAt: Date, entries: TimelineEntry[], now: Date = new Date()): boolean {
  return now.getTime() >= getNextEligibleDate(createdAt, entries).getTime();
}
