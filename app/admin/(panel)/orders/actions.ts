"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getBucket, getDb } from "@/lib/firebase/admin";
import { renderPrintFile } from "@/lib/printRender";
import type { OrderDoc, OrderStatus, ProductType } from "@/types/firestore";
import type { PosterSize } from "@/lib/pricing";

const VALID_STATUSES: OrderStatus[] = ["pending", "paid", "failed", "refunded", "fulfilled", "shipped"];
const PRINTABLE_PRODUCTS: ProductType[] = ["poster", "framed_poster"];
const SIGNED_URL_TTL_MS = 5 * 60 * 1000;

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

/**
 * Renders the 300 DPI print file for an order's star map and stores its
 * Storage path on the order doc. The rendered PNG itself never passes
 * through this action's response — only a path into the locked-down
 * `starmaps-print/` prefix (see storage.rules) is persisted.
 */
export async function renderPrintFileAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("Geçersiz sipariş.");

  const orderRef = getDb().collection("orders").doc(orderId);
  const snapshot = await orderRef.get();
  if (!snapshot.exists) throw new Error("Sipariş bulunamadı.");

  const order = snapshot.data() as OrderDoc;
  if (!PRINTABLE_PRODUCTS.includes(order.productType) || !order.size) {
    throw new Error("Bu sipariş türü için baskı dosyası üretilemez.");
  }

  const result = await renderPrintFile(order.starMapSlug, order.size as PosterSize);

  await orderRef.update({
    printFilePath: result.storagePath,
    printFileRenderedAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/admin/orders");
}

/** Mints a fresh short-lived signed URL for an already-rendered print file and redirects the admin's browser to it. */
export async function getPrintDownloadUrlAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("Geçersiz sipariş.");

  const snapshot = await getDb().collection("orders").doc(orderId).get();
  if (!snapshot.exists) throw new Error("Sipariş bulunamadı.");

  const order = snapshot.data() as OrderDoc;
  if (!order.printFilePath) throw new Error("Bu sipariş için henüz baskı dosyası üretilmedi.");

  const [url] = await getBucket()
    .file(order.printFilePath)
    .getSignedUrl({ action: "read", expires: Date.now() + SIGNED_URL_TTL_MS });

  redirect(url);
}
