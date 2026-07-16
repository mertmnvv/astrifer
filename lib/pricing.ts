/** Deri defter: tek sabit ürün, boyut/çerçeve varyantı yok. Altın renkli kalem dahildir. Fallback default. */
export const JOURNAL_PRICE = 2400;
export const JOURNAL_ORIGINAL_PRICE = 2900;

/** Dijital paylaşım sayfasının (/s/[slug]) taban ücreti. Fallback default. */
export const DIGITAL_PRICE = 299;
export const DIGITAL_ORIGINAL_PRICE = 399;

export function formatTRY(amount: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(
    amount,
  );
}
