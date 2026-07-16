import type { OrderDoc, OrderStatus, PaymentMethod, ProductType } from "@/types/firestore";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Ödeme Bekleniyor",
  paid: "Ödendi",
  failed: "Başarısız",
  refunded: "İade edildi",
  fulfilled: "Hazırlandı",
  shipped: "Kargoya verildi",
  cancelled: "İptal edildi",
};

export const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as OrderStatus[];

export const PRODUCT_LABELS: Record<ProductType, string> = {
  digital: "Dijital Sayfa",
  journal: "Deri Defter",
  bundle: "Dijital + Defter",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  manual: "Manuel (Havale/EFT)",
  iyzico: "iyzico",
  paytr: "PayTR",
};

export type ProductFilter = "digital" | "journal" | "bundle";

export const PRODUCT_FILTERS: { value: ProductFilter; label: string; matches: ProductType[] }[] = [
  { value: "digital", label: "Dijital", matches: ["digital"] },
  { value: "journal", label: "Defter", matches: ["journal"] },
  { value: "bundle", label: "Paket", matches: ["bundle"] },
];

/**
 * Prefers an order item's own starMapSlug over the legacy top-level
 * `order.starMapSlug` field. A bundle order's items can in theory carry
 * different slugs (the cart has no cross-slug guard — see
 * checkout/actions.ts) even though today's /create flow always writes the
 * same slug for both, so print rendering and preview should read the
 * specific product's own item rather than assume the top-level field.
 */
export function resolveItemSlug(order: OrderDoc, productType: "digital" | "journal"): string {
  const item = order.items?.find((entry) => entry.productType === productType);
  return item?.starMapSlug ?? order.starMapSlug;
}

