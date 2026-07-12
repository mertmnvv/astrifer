export type PosterSize = "30x30" | "40x40" | "50x50" | "70x70";
export type FrameOption = "none" | "black" | "oak";

/**
 * Fallback defaults, used when Firestore has no `config/pricing` doc yet
 * (or Firebase isn't configured) — see lib/pricingConfig.ts, which is the
 * live, admin-editable source of truth at runtime.
 */
export const POSTER_SIZES: { value: PosterSize; label: string; basePrice: number }[] = [
  { value: "30x30", label: "30 × 30 cm", basePrice: 549 },
  { value: "40x40", label: "40 × 40 cm", basePrice: 706 },
  { value: "50x50", label: "50 × 50 cm", basePrice: 942 },
  { value: "70x70", label: "70 × 70 cm", basePrice: 1414 },
];

export const FRAME_OPTIONS: { value: FrameOption; label: string; description: string; surcharge: number }[] = [
  { value: "none", label: "Çerçevesiz", description: "180g mat, sadece poster.", surcharge: 0 },
  { value: "black", label: "Siyah Ahşap", description: "Mat siyah ahşap çerçeve.", surcharge: 393 },
  { value: "oak", label: "Doğal Ahşap", description: "Ham meşe dokulu çerçeve.", surcharge: 551 },
];

export function priceFor(size: PosterSize, frame: FrameOption): number {
  const sizePrice = POSTER_SIZES.find((option) => option.value === size)?.basePrice ?? 0;
  const frameSurcharge = FRAME_OPTIONS.find((option) => option.value === frame)?.surcharge ?? 0;
  return sizePrice + frameSurcharge;
}

/** Deri defter: tek sabit ürün, boyut/çerçeve varyantı yok. Altın renkli kalem dahildir. Fallback default. */
export const JOURNAL_PRICE = 2400;

/** Dijital paylaşım sayfasının (/s/[slug]) taban ücreti. Fallback default. */
export const DIGITAL_PRICE = 299;

export function formatTRY(amount: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(
    amount,
  );
}
