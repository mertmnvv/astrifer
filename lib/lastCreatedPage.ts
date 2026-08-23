// Client-side convenience pointer to the visitor's most recently created
// digital page — lets /urun/defter offer a "continue with your page"
// shortcut. NOT an ownership proof: the product page
// re-verify the slug's real owner cookie server-side before using any real
// data, same as lib/cart.ts is not a real order record. See lib/cart.ts for
// the pattern this mirrors.

export interface LastCreatedPage {
  slug: string;
  title: string;
  locationName: string;
  savedAt: string;
}

const STORAGE_KEY = "astrifer:last-page";

export function getLastCreatedPage(): LastCreatedPage | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.slug === "string" ? (parsed as LastCreatedPage) : null;
  } catch {
    return null;
  }
}

export function setLastCreatedPage(page: Omit<LastCreatedPage, "savedAt">): void {
  if (typeof window === "undefined") return;
  const full: LastCreatedPage = { ...page, savedAt: new Date().toISOString() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
}
