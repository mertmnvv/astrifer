// Client-side shopping cart — no backend order/session exists yet (checkout
// is a pre-payment stub, see CLAUDE.md), so the cart itself lives entirely
// in localStorage. Deliberately framework-agnostic (no React import) so it
// can be called from any client component; see lib/useCart.ts for the React
// hook that watches it.

export type CartProductType = "digital" | "journal";

/** Structured journal config — mirrors OrderDoc.journalLetterText/journalLetterOpeningDate. */
export interface CartJournalConfig {
  letterText: string;
  openingDate: string | null;
}

export interface CartItem {
  id: string;
  productType: CartProductType;
  productLabel: string;
  /** Heading shown on the cart line — usually the couple/owner names or page title. */
  title: string;
  price: number;
  /** Free-form detail lines (size, frame, mood, dates...) rendered under the title. */
  summary: string[];
  /** The digital page slug this item is tied to, if any — lets the cart line deep-link to /s/[slug]. */
  slug?: string;
  journalConfig?: CartJournalConfig;
  addedAt: string;
}

const STORAGE_KEY = "astrifer:cart";
export const CART_EVENT = "astrifer:cart-changed";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function getCart(): CartItem[] {
  return readCart();
}

export function addToCart(item: Omit<CartItem, "id" | "addedAt">): CartItem {
  const full: CartItem = {
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    addedAt: new Date().toISOString(),
  };
  writeCart([...readCart(), full]);
  return full;
}

export function removeFromCart(id: string): void {
  writeCart(readCart().filter((item) => item.id !== id));
}

export function clearCart(): void {
  writeCart([]);
}

export function cartTotal(items: CartItem[]): number {
  const journalSlugs = new Set(
    items.filter((i) => i.productType === "journal" && i.slug).map((i) => i.slug)
  );

  return items.reduce((sum, item) => {
    if (item.productType === "digital" && item.slug && journalSlugs.has(item.slug)) {
      return sum;
    }
    return sum + item.price;
  }, 0);
}
