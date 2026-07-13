"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getBucket, getDb } from "@/lib/firebase/admin";
import { renderPrintFile } from "@/lib/printRender";
import { renderJournalPrintFiles, renderLetterInsert } from "@/lib/journalPrintRender";
import type { OrderDoc, OrderStatus } from "@/types/firestore";
import type { PosterSize } from "@/lib/pricing";
import { POSTER_PRINTABLE_PRODUCTS, STATUS_OPTIONS as VALID_STATUSES } from "./shared";

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
  if (!POSTER_PRINTABLE_PRODUCTS.includes(order.productType) || !order.size) {
    throw new Error("Bu sipariş türü için baskı dosyası üretilemez.");
  }

  const result = await renderPrintFile(order.starMapSlug, order.size as PosterSize, {
    mood: order.posterColorMood ?? undefined,
    message: order.posterPersonalMessage ?? undefined,
  });

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

/**
 * Renders all 26 journal pages (13 distinct files — the 15 blank pages
 * reuse one render) and stores the manifest on the order doc. Mirrors
 * renderPrintFileAction's shape but for the journal's multi-page pipeline.
 */
export async function renderJournalPrintFilesAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("Geçersiz sipariş.");

  const orderRef = getDb().collection("orders").doc(orderId);
  const snapshot = await orderRef.get();
  if (!snapshot.exists) throw new Error("Sipariş bulunamadı.");

  const order = snapshot.data() as OrderDoc;
  if (order.productType !== "journal") {
    throw new Error("Bu sipariş türü için defter baskı dosyası üretilemez.");
  }

  const { manifest } = await renderJournalPrintFiles(order.starMapSlug);

  await orderRef.update({
    printFilePaths: manifest.map((entry) => entry.storagePath),
    printFileRenderedAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/admin/orders");
}

/**
 * Renders the sealed "Gelecek Mektubu" insert as its own, separate print
 * file — kept apart from renderJournalPrintFilesAction's manifest since
 * it carries the order's own private letter text.
 */
export async function renderLetterInsertAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("Geçersiz sipariş.");

  const orderRef = getDb().collection("orders").doc(orderId);
  const snapshot = await orderRef.get();
  if (!snapshot.exists) throw new Error("Sipariş bulunamadı.");

  const order = snapshot.data() as OrderDoc;
  if (order.productType !== "journal" || !order.journalLetterText) {
    throw new Error("Bu sipariş için mektup metni bulunamadı.");
  }

  const openingDateIso = order.journalLetterOpeningDate ? order.journalLetterOpeningDate.toDate().toISOString() : "";
  const result = await renderLetterInsert(order.starMapSlug, order.journalLetterText, openingDateIso);

  await orderRef.update({
    letterInsertPrintPath: result.storagePath,
    updatedAt: new Date(),
  });

  revalidatePath("/admin/orders");
}

/** Mints a fresh short-lived signed URL for the sealed letter insert — same security posture as getPrintDownloadUrlAction, kept as its own action since this file is more sensitive than the rest of the book. */
export async function getLetterInsertDownloadUrlAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("Geçersiz sipariş.");

  const snapshot = await getDb().collection("orders").doc(orderId).get();
  if (!snapshot.exists) throw new Error("Sipariş bulunamadı.");

  const order = snapshot.data() as OrderDoc;
  if (!order.letterInsertPrintPath) throw new Error("Bu sipariş için henüz mektup eki üretilmedi.");

  const [url] = await getBucket()
    .file(order.letterInsertPrintPath)
    .getSignedUrl({ action: "read", expires: Date.now() + SIGNED_URL_TTL_MS });

  redirect(url);
}
