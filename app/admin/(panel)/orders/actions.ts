"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/firebase/admin";
import type { OrderStatus } from "@/types/firestore";

const VALID_STATUSES: OrderStatus[] = ["pending", "paid", "failed", "refunded", "fulfilled", "shipped"];

export async function updateOrderAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();

  if (!orderId || !VALID_STATUSES.includes(status as OrderStatus)) {
    throw new Error("Geçersiz sipariş güncellemesi.");
  }

  await getDb()
    .collection("orders")
    .doc(orderId)
    .update({
      status,
      trackingNumber: trackingNumber.length > 0 ? trackingNumber : null,
      updatedAt: new Date(),
    });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
