import type { OrderStatus, ProductType } from "@/types/firestore";

/**
 * Product types with a 300 DPI print pipeline: poster/framed_poster use
 * lib/printRender.ts, journal uses lib/journalPrintRender.ts (a full
 * 26-page manifest + a separate sealed letter insert).
 */
export const PRINTABLE_PRODUCTS: ProductType[] = ["poster", "framed_poster", "journal"];

/** Subset of PRINTABLE_PRODUCTS that use the single-image poster pipeline (lib/printRender.ts). */
export const POSTER_PRINTABLE_PRODUCTS: ProductType[] = ["poster", "framed_poster"];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Bekliyor",
  paid: "Ödendi",
  failed: "Başarısız",
  refunded: "İade edildi",
  fulfilled: "Hazırlandı",
  shipped: "Kargoya verildi",
};

export const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as OrderStatus[];

export const PRODUCT_LABELS: Record<ProductType, string> = {
  digital: "Dijital Sayfa",
  poster: "Poster",
  framed_poster: "Çerçeveli Poster",
  journal: "Deri Defter",
};

/** Order-list filter buckets — groups poster + framed_poster under one "Poster" filter. */
export type ProductFilter = "digital" | "poster" | "journal";

export const PRODUCT_FILTERS: { value: ProductFilter; label: string; matches: ProductType[] }[] = [
  { value: "digital", label: "Dijital", matches: ["digital"] },
  { value: "poster", label: "Poster", matches: ["poster", "framed_poster"] },
  { value: "journal", label: "Defter", matches: ["journal"] },
];
