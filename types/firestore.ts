// Hand-written to match firestore.rules / the collections written by
// scripts/seed-firestore.mjs. There's no Firestore equivalent of
// `supabase gen types` — keep this in sync by hand when the shape changes.

import type { Timestamp } from "firebase-admin/firestore";

export type TemplateCategory = "dogum" | "yildonumu" | "teklif" | "mezuniyet" | "anma";
export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "fulfilled" | "shipped";
export type ProductType = "digital" | "poster" | "framed_poster";

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
  /** Storage paths under `starmaps-public/`, once the upload pipeline exists. */
  photoUrls: string[] | null;
  voiceNoteUrl: string | null;
  /** Sky color scheme id — see components/astrolab/palettes.ts. */
  palette: string | null;
  isPublic: boolean;
  viewCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
