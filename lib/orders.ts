import "server-only";

import type { OrderItemDoc, PaymentMethod } from "@/types/firestore";

// ---------------------------------------------------------------------------
// Order number generation
// ---------------------------------------------------------------------------

/**
 * Produces a human-readable order number like `AST-20260715-A3K8`.
 * The suffix is a short random alphanumeric string — not globally unique
 * on its own, but combined with the date component the collision probability
 * is negligible for the expected order volume.
 */
function generateOrderNumber(): string {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const chars = "ABCDEFGHJKLMNPRSTUVWXYZ23456789"; // no ambiguous I/O/0/1
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }

  return `AST-${datePart}-${suffix}`;
}

// ---------------------------------------------------------------------------
// Create order
// ---------------------------------------------------------------------------

export interface CreateOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  starMapSlug: string;
  items: OrderItemDoc[];
  /** Defaults to `"manual"` when omitted. */
  paymentMethod?: PaymentMethod;
}

export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
}

/**
 * Writes a new order to Firestore. The order starts with `status: "pending"`
 * and `paymentMethod: "manual"` (or whichever method is specified). The
 * admin can later flip status via `/admin/orders`.
 *
 * Intentionally does NOT send any e-mail or notification — that will be
 * layered on top once a transactional e-mail service is configured.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const { getDb } = await import("@/lib/firebase/admin");
  const db = getDb();

  const totalAmount = input.items.reduce((sum, item) => sum + item.price, 0);
  const orderNumber = generateOrderNumber();

  // Derive legacy single-product fields for backward compat with the
  // existing admin panel views and print pipeline.
  const hasJournal = input.items.some((item) => item.productType === "journal");
  const hasDigital = input.items.some((item) => item.productType === "digital");
  const legacyProductType = hasJournal && hasDigital ? "bundle" : hasJournal ? "journal" : "digital";

  // Extract journal-specific fields from the journal item (if any) so the
  // existing print pipeline (which reads these top-level fields) keeps working.
  const journalItem = input.items.find((item) => item.productType === "journal");
  const journalLetterText = journalItem?.journalLetterText ?? null;
  const journalLetterOpeningDate = journalItem?.journalLetterOpeningDate
    ? new Date(journalItem.journalLetterOpeningDate)
    : null;

  const now = new Date();

  const docRef = await db.collection("orders").add({
    orderNumber,
    starMapSlug: input.starMapSlug,
    customerEmail: input.customerEmail,
    customerName: input.customerName || null,
    customerPhone: input.customerPhone || null,
    productType: legacyProductType,
    priceAmount: totalAmount,
    totalAmount,
    currency: "TRY",
    items: input.items,
    status: "paid",
    paymentMethod: input.paymentMethod ?? "manual",
    iyzicoPaymentId: null,
    iyzicoConversationId: null,
    shippingAddress: null,
    trackingNumber: null,
    journalLetterText,
    journalLetterOpeningDate,
    printFilePaths: null,
    printPdfPath: null,
    printFileRenderedAt: null,
    letterInsertPrintPath: null,
    createdAt: now,
    updatedAt: now,
  });

  return { orderId: docRef.id, orderNumber };
}
