"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/firebase/admin";

function parseNonNegativeNumber(formData: FormData, key: string): number {
  const value = Number(formData.get(key));
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Geçersiz fiyat: ${key}`);
  }
  return value;
}

export async function savePricingAction(formData: FormData) {
  const journalPrice = parseNonNegativeNumber(formData, "journalPrice");
  const journalOriginalPrice = parseNonNegativeNumber(formData, "journalOriginalPrice");
  const digitalPrice = parseNonNegativeNumber(formData, "digitalPrice");
  const digitalOriginalPrice = parseNonNegativeNumber(formData, "digitalOriginalPrice");

  await getDb().collection("config").doc("pricing").set({
    journalPrice,
    journalOriginalPrice,
    digitalPrice,
    digitalOriginalPrice,
    updatedAt: new Date(),
  });

  revalidatePath("/admin/pricing");
  revalidatePath("/urun/defter");
  revalidatePath("/checkout");
}
