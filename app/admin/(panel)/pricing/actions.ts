"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/firebase/admin";
import { FRAME_OPTIONS, POSTER_SIZES } from "@/lib/pricing";

function parseNonNegativeNumber(formData: FormData, key: string): number {
  const value = Number(formData.get(key));
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Geçersiz fiyat: ${key}`);
  }
  return value;
}

/**
 * Admins only ever edit the numbers — which sizes/frames exist stays fixed
 * to the lib/pricing.ts shape, so labels/descriptions are always re-read
 * from there rather than trusted from form input.
 */
export async function savePricingAction(formData: FormData) {
  const posterSizes = POSTER_SIZES.map((option) => ({
    value: option.value,
    label: option.label,
    basePrice: parseNonNegativeNumber(formData, `posterSize_${option.value}`),
  }));

  const frameOptions = FRAME_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
    description: option.description,
    surcharge: parseNonNegativeNumber(formData, `frameSurcharge_${option.value}`),
  }));

  const journalPrice = parseNonNegativeNumber(formData, "journalPrice");
  const digitalPrice = parseNonNegativeNumber(formData, "digitalPrice");

  await getDb().collection("config").doc("pricing").set({
    posterSizes,
    frameOptions,
    journalPrice,
    digitalPrice,
    updatedAt: new Date(),
  });

  revalidatePath("/admin/pricing");
  revalidatePath("/urun/poster");
  revalidatePath("/urun/defter");
  revalidatePath("/checkout");
}
