import "server-only";
import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import { DIGITAL_PRICE, FRAME_OPTIONS, JOURNAL_PRICE, POSTER_SIZES } from "@/lib/pricing";
import type { FrameOption, PosterSize } from "@/lib/pricing";
import type { PricingConfigDoc } from "@/types/firestore";

export interface PricingConfig {
  posterSizes: { value: PosterSize; label: string; basePrice: number }[];
  frameOptions: { value: FrameOption; label: string; description: string; surcharge: number }[];
  journalPrice: number;
  digitalPrice: number;
}

function defaultPricingConfig(): PricingConfig {
  return {
    posterSizes: POSTER_SIZES,
    frameOptions: FRAME_OPTIONS,
    journalPrice: JOURNAL_PRICE,
    digitalPrice: DIGITAL_PRICE,
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
      // Which sizes/frames exist is fixed by lib/pricing.ts — admins only
      // ever edit the numbers (see app/admin/(panel)/pricing/actions.ts),
      // so the value literals are safe to reassert here.
      posterSizes: doc.posterSizes as PricingConfig["posterSizes"],
      frameOptions: doc.frameOptions as PricingConfig["frameOptions"],
      journalPrice: doc.journalPrice,
      digitalPrice: doc.digitalPrice,
    };
  } catch {
    return defaultPricingConfig();
  }
}
