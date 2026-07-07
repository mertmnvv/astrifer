export type PosterSize = "30x30" | "40x40" | "50x50" | "70x70";
export type FrameOption = "none" | "black" | "oak" | "brass";

export const POSTER_SIZES: { value: PosterSize; label: string; basePrice: number }[] = [
  { value: "30x30", label: "30 × 30 cm", basePrice: 349 },
  { value: "40x40", label: "40 × 40 cm", basePrice: 449 },
  { value: "50x50", label: "50 × 50 cm", basePrice: 599 },
  { value: "70x70", label: "70 × 70 cm", basePrice: 899 },
];

export const FRAME_OPTIONS: { value: FrameOption; label: string; description: string; surcharge: number }[] = [
  { value: "none", label: "Çerçevesiz", description: "180g mat, sadece poster.", surcharge: 0 },
  { value: "black", label: "Siyah Ahşap", description: "Mat siyah ahşap çerçeve.", surcharge: 250 },
  { value: "oak", label: "Doğal Ahşap", description: "Ham meşe dokulu çerçeve.", surcharge: 350 },
  { value: "brass", label: "Pirinç Kaplama", description: "Astrolabın bezeliyle aynı pirinç tonu.", surcharge: 450 },
];

export function priceFor(size: PosterSize, frame: FrameOption): number {
  const sizePrice = POSTER_SIZES.find((option) => option.value === size)?.basePrice ?? 0;
  const frameSurcharge = FRAME_OPTIONS.find((option) => option.value === frame)?.surcharge ?? 0;
  return sizePrice + frameSurcharge;
}

/** Deri defter: tek sabit ürün, boyut/çerçeve varyantı yok. Altın renkli kalem dahildir. */
export const JOURNAL_PRICE = 1450;

/** Dijital paylaşım sayfasının (/s/[slug]) taban ücreti. */
export const DIGITAL_PRICE = 149;

export function formatTRY(amount: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(
    amount,
  );
}
