import "server-only";
import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import { DIGITAL_PRICE, DIGITAL_ORIGINAL_PRICE, JOURNAL_PRICE, JOURNAL_ORIGINAL_PRICE } from "@/lib/pricing";
import type { PricingConfigDoc } from "@/types/firestore";

export interface PricingConfig {
  journalPrice: number;
  journalOriginalPrice: number;
  digitalPrice: number;
  digitalOriginalPrice: number;
}

function defaultPricingConfig(): PricingConfig {
  return {
    journalPrice: JOURNAL_PRICE,
    journalOriginalPrice: JOURNAL_ORIGINAL_PRICE,
    digitalPrice: DIGITAL_PRICE,
    digitalOriginalPrice: DIGITAL_ORIGINAL_PRICE,
  };
}

/**
 * Live pricing, editable from /admin/pricing. Falls back to the static
 * defaults in lib/pricing.ts when Firebase isn't configured or no
 * `config/pricing` doc has been saved yet.
 */
export async function getPricingConfig(): Promise<PricingConfig> {
  if (!isFirebaseConfigured()) {
    return defaultPricingConfig();
  }

  try {
    const { getDb } = await import("@/lib/firebase/admin");
    const snapshot = await getDb().collection("config").doc("pricing").get();
    if (!snapshot.exists) return defaultPricingConfig();

    const doc = snapshot.data() as PricingConfigDoc;
    return {
      journalPrice: doc.journalPrice,
      journalOriginalPrice: doc.journalOriginalPrice ?? doc.journalPrice,
      digitalPrice: doc.digitalPrice,
      digitalOriginalPrice: doc.digitalOriginalPrice ?? doc.digitalPrice,
    };
  } catch {
    return defaultPricingConfig();
  }
}
