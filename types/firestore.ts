// Hand-written to match firestore.rules / the collections written by
// scripts/seed-firestore.mjs. There's no Firestore equivalent of
// `supabase gen types` — keep this in sync by hand when the shape changes.

import type { Timestamp } from "firebase-admin/firestore";

export type TemplateCategory = "dogum" | "yildonumu" | "teklif" | "mezuniyet" | "anma";
export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "fulfilled" | "shipped";
export type ProductType = "digital" | "poster" | "framed_poster" | "journal";

/** Collection `templates`, doc id = slug. */
export interface TemplateDoc {
  slug: string;
  name: string;
  category: TemplateCategory;
  description: string | null;
  defaultMessage: string | null;
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

/** Collection `orders`, doc id = auto. Never read/written by client code — server-only via Admin SDK. */
export interface OrderDoc {
  starMapSlug: string;
  customerEmail: string;
  customerName: string | null;
  productType: ProductType;
  size: string | null;
  frameOption: string | null;
  priceAmount: number;
  currency: string;
  status: OrderStatus;
  iyzicoPaymentId: string | null;
  iyzicoConversationId: string | null;
  shippingAddress: Record<string, unknown> | null;
  trackingNumber: string | null;
  /** Storage path under `starmaps-print/`, set once an admin renders the print file. Never a direct URL — see lib/printRender.ts. */
  printFilePath: string | null;
  printFileRenderedAt: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Collection `config`, doc id `pricing`. Admin-editable override for the
 * defaults in lib/pricing.ts — see lib/pricingConfig.ts for the fallback
 * merge. Never read/written by client code — server-only via Admin SDK.
 */
export interface PricingConfigDoc {
  posterSizes: { value: string; label: string; basePrice: number }[];
  frameOptions: { value: string; label: string; description: string; surcharge: number }[];
  journalPrice: number;
  digitalPrice: number;
  updatedAt: Timestamp;
}
