import type { OrderStatus, ProductType } from "@/types/firestore";

/** Product types the 300 DPI render pipeline (lib/printRender.ts) currently supports. */
export const PRINTABLE_PRODUCTS: ProductType[] = ["poster", "framed_poster"];

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
