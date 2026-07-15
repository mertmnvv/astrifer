// Hand-written to match firestore.rules / the collections written by
// scripts/seed-firestore.mjs. There's no Firestore equivalent of
// `supabase gen types` — keep this in sync by hand when the shape changes.

import type { Timestamp } from "firebase-admin/firestore";

export type TemplateCategory = "dogum" | "yildonumu" | "teklif" | "mezuniyet" | "anma";
export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "fulfilled" | "shipped";
export type ProductType = "digital" | "journal" | "bundle";
export type PaymentMethod = "manual" | "iyzico";

/** Collection `templates`, doc id = slug. */
export interface TemplateDoc {
  slug: string;
  name: string;
  category: TemplateCategory;
  description: string | null;
  /** Up to 3 example personal messages offered when this template is selected — see CreateForm.tsx. */
  exampleMessages: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: Timestamp;
}

/** Collection `starMaps`, doc id = slug. */
export interface StarMapDoc {
  slug: string;
  templateSlug: string | null;
  title: string;
  message: string | null;
  eventDate: Timestamp;
  timezone: string;
  latitude: number;
  longitude: number;
  locationName: string;
  musicUrl: string | null;
  voiceNoteUrl: string | null;
  /** Sky color scheme id — see components/astrolab/palettes.ts. */
  palette: string | null;
  isPublic: boolean;
  viewCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Collection `starMaps/{slug}/entries`, doc id = auto. The growing photo
 * timeline — the entry written alongside the page itself (`isInitial: true`)
 * and every later addition share this same shape. `date` is the moment the
 * entry depicts (event date for the initial entry, owner-picked for later
 * ones) — distinct from `createdAt`, the server write time.
 */
export interface TimelineEntryDoc {
  date: Timestamp;
  photoUrls: string[];
  note: string | null;
  isInitial: boolean;
  createdAt: Timestamp;
}

/** Individual line item within an order — one per product (digital page, journal). */
export interface OrderItemDoc {
  productType: "digital" | "journal";
  label: string;
  price: number;
  starMapSlug: string;
  journalLetterText?: string | null;
  journalLetterOpeningDate?: string | null;
}

/** Collection `orders`, doc id = auto. Never read/written by client code — server-only via Admin SDK. */
export interface OrderDoc {
  /** Human-readable order number, e.g. AST-20260715-A3K8. */
  orderNumber: string;
  starMapSlug: string;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  /**
   * Legacy single-product type kept for backward compat — new orders with
   * both digital + journal use `"bundle"`. The canonical source is `items`.
   */
  productType: ProductType;
  /** Legacy single price — the canonical source is now `totalAmount`. */
  priceAmount: number;
  /** Total order amount (sum of all items). */
  totalAmount: number;
  currency: string;
  /** Itemised product list — each entry is a product in the order. */
  items: OrderItemDoc[];
  status: OrderStatus;
  /** `"manual"` for the temporary bank-transfer flow; `"iyzico"` once integrated. */
  paymentMethod: PaymentMethod;
  iyzicoPaymentId: string | null;
  iyzicoConversationId: string | null;
  shippingAddress: Record<string, unknown> | null;
  trackingNumber: string | null;
  /** Journal-only: user-authored letter for the sealed back-cover insert. */
  journalLetterText: string | null;
  /** Journal-only: the date the sealed letter insert is meant to be opened. */
  journalLetterOpeningDate: Timestamp | null;
  /**
   * Journal-only: ordered manifest of all 26 rendered page Storage paths
   * (see lib/journalPrintRender.ts) — the 15 blank-page slots repeat the
   * same path rather than storing 15 redundant renders. Never a direct URL.
   */
  printFilePaths: string[] | null;
  /**
   * Journal-only: the single, full-bleed 26-page PDF assembled from
   * printFilePaths (see lib/journalPrintPdf.ts) — the one file handed to
   * the print shop. Same locked-down Storage prefix as printFilePaths.
   */
  printPdfPath: string | null;
  /** Journal-only: when printFilePaths/printPdfPath were last (re-)rendered — shown in the admin production panel so a stale render is obvious. */
  printFileRenderedAt: Timestamp | null;
  /** Journal-only: the sealed letter insert's own print file (a single-page PDF, not a PNG) — same locked-down security rule as printFilePaths, kept separate since it's more sensitive than the rest of the book. */
  letterInsertPrintPath: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Collection `config`, doc id `pricing`. Admin-editable override for the
 * defaults in lib/pricing.ts — see lib/pricingConfig.ts for the fallback
 * merge. Never read/written by client code — server-only via Admin SDK.
 */
export interface PricingConfigDoc {
  journalPrice: number;
  digitalPrice: number;
  updatedAt: Timestamp;
}

