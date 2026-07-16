// Client-side autosave for an in-progress /create form — lets a visitor
// leave mid-form (e.g. to read the /urun/defter showcase page) and come
// back without losing their fields. Purely a convenience
// cache, same spirit as lib/cart.ts: nothing here is a real record until
// CreateForm actually submits and creates the digital page.

export interface CreateDraftPlace {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface CreateDraftPhoto {
  id: string;
  url: string;
  caption: string;
}

export interface CreateDraft {
  date: string;
  time: string;
  place: CreateDraftPlace | null;
  title: string;
  message: string;
  templateSlug: string;
  paletteId: string;
  journalThemeId?: string;
  isJournalThemeManuallySelected?: boolean;
  photos: CreateDraftPhoto[];
  voiceNoteUrl: string | null;
  videoUrl?: string | null;
  mediaOption?: "voice" | "video";
  journalEnabled: boolean;
  journalLetterText: string;
  journalOpeningDate: string;
  musicUrl: string | null;
  currentStep?: number;
  furthestStep?: number;
  savedAt: string;
}

const STORAGE_KEY = "astrifer:create-draft";

export function getCreateDraft(): CreateDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.title === "string" ? (parsed as CreateDraft) : null;
  } catch {
    return null;
  }
}

export function setCreateDraft(draft: Omit<CreateDraft, "savedAt">): void {
  if (typeof window === "undefined") return;
  const full: CreateDraft = { ...draft, savedAt: new Date().toISOString() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
}

export function clearCreateDraft(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
