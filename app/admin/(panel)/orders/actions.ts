"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/firebase/admin";
import { getR2SignedUrl } from "@/lib/r2";
import { renderJournalPrintFiles, renderLetterInsert } from "@/lib/journalPrintRender";
import type { OrderDoc, OrderStatus } from "@/types/firestore";
import { resolveItemSlug, STATUS_OPTIONS as VALID_STATUSES } from "./shared";

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

export async function deleteOrderAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("Geçersiz sipariş.");

  await getDb().collection("orders").doc(orderId).delete();

  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

/**
 * Renders all 26 journal pages (13 distinct files — the 15 blank pages
 * reuse one render) and stores the manifest on the order doc.
 */
export async function renderJournalPrintFilesAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("Geçersiz sipariş.");

  const orderRef = getDb().collection("orders").doc(orderId);
  const snapshot = await orderRef.get();
  if (!snapshot.exists) throw new Error("Sipariş bulunamadı.");

  const order = snapshot.data() as OrderDoc;
  if (order.productType !== "journal" && order.productType !== "bundle") {
    throw new Error("Bu sipariş türü için defter baskı dosyası üretilemez.");
  }

  const { manifest, pdfStoragePath } = await renderJournalPrintFiles(resolveItemSlug(order, "journal"));

  await orderRef.update({
    printFilePaths: manifest.map((entry) => entry.storagePath),
    printPdfPath: pdfStoragePath,
    printFileRenderedAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/admin/orders");
}

/** Mints a fresh short-lived signed URL for the single, print-ready 26-page book PDF — the file handed to the print shop. Same security posture as getLetterInsertDownloadUrlAction. */
export async function getJournalPrintPdfDownloadUrlAction(orderId: string): Promise<string> {
  if (!orderId) throw new Error("Geçersiz sipariş.");

  const snapshot = await getDb().collection("orders").doc(orderId).get();
  if (!snapshot.exists) throw new Error("Sipariş bulunamadı.");

  const order = snapshot.data() as OrderDoc;
  if (!order.printPdfPath) throw new Error("Bu sipariş için henüz baskıya hazır PDF üretilmedi.");

  const url = await getR2SignedUrl(order.printPdfPath, 300);

  return url;
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
  const journalItem = order.items?.find((entry) => entry.productType === "journal");
  const letterText = journalItem?.journalLetterText ?? order.journalLetterText;
  const letterOpeningDateStr = journalItem?.journalLetterOpeningDate ?? null;

  if ((order.productType !== "journal" && order.productType !== "bundle") || !letterText) {
    throw new Error("Bu sipariş için mektup metni bulunamadı.");
  }

  const openingDateIso = letterOpeningDateStr
    ? letterOpeningDateStr
    : order.journalLetterOpeningDate
      ? order.journalLetterOpeningDate.toDate().toISOString()
      : "";

  const result = await renderLetterInsert(resolveItemSlug(order, "journal"), letterText, openingDateIso);

  await orderRef.update({
    letterInsertPrintPath: result.storagePath,
    updatedAt: new Date(),
  });

  revalidatePath("/admin/orders");
}

/** Mints a fresh short-lived signed URL for the sealed letter insert — same security posture as getPrintDownloadUrlAction, kept as its own action since this file is more sensitive than the rest of the book. */
export async function getLetterInsertDownloadUrlAction(orderId: string): Promise<string> {
  if (!orderId) throw new Error("Geçersiz sipariş.");

  const snapshot = await getDb().collection("orders").doc(orderId).get();
  if (!snapshot.exists) throw new Error("Sipariş bulunamadı.");

  const order = snapshot.data() as OrderDoc;
  if (!order.letterInsertPrintPath) throw new Error("Bu sipariş için henüz mektup eki üretilmedi.");

  const url = await getR2SignedUrl(order.letterInsertPrintPath, 300);

  return url;
}
