import type { OrderStatus, ProductType } from "@/types/firestore";

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
  journal: "Deri Defter",
};

export type ProductFilter = "digital" | "journal";

export const PRODUCT_FILTERS: { value: ProductFilter; label: string; matches: ProductType[] }[] = [
  { value: "digital", label: "Dijital", matches: ["digital"] },
  { value: "journal", label: "Defter", matches: ["journal"] },
];
