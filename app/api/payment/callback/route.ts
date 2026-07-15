import { NextRequest } from "next/server";
import { verifyPaytrCallbackSignature } from "@/lib/payment/paytr";
import { sendOrderPaidCustomerEmail, sendOrderPaidAdminEmail } from "@/lib/email/email";
import type { ShippingAddress } from "@/types/firestore";

export const dynamic = "force-dynamic";

/**
 * Webhook callback route POSTed asynchronously by PayTR upon card payment completion.
 * Verifies authenticity, updates the order status in Firestore, and sends emails.
 */
export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);

    const merchant_oid = params.get("merchant_oid") || "";
    const status = params.get("status") || "";
    const total_amount = params.get("total_amount") || "";
    const hash = params.get("hash") || "";

    // 1. Verify that this call is authentic and signed by PayTR
    const verified = verifyPaytrCallbackSignature({
      merchant_oid,
      status,
      total_amount,
      hash,
    });

    if (!verified) {
      console.error(`PayTR callback signature verification failed for order: ${merchant_oid}`);
      // Returning "OK" to stop PayTR from retrying spoofed requests, but log it as an error
      return new Response("OK", { status: 200 });
    }

    const { getDb } = await import("@/lib/firebase/admin");
    const db = getDb();
    const snapshot = await db
      .collection("orders")
      .where("orderNumber", "==", merchant_oid)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.error(`Order not found for PayTR callback: ${merchant_oid}`);
      return new Response("OK", { status: 200 });
    }

    const orderDoc = snapshot.docs[0];
    const orderData = orderDoc.data();

    // 2. Handle Payment Success
    if (status === "success") {
      // Prevent double-sending of emails if this callback was already processed
      if (orderData.status !== "paid") {
        await orderDoc.ref.update({
          status: "paid",
          iyzicoPaymentId: params.get("payment_type") || "PayTR", // Trace label mapping PayTR payment mode
          iyzicoConversationId: params.get("payment_amount") || null, // Trace label mapping PayTR payment amount cents
          updatedAt: new Date(),
        });

        // Trigger emails asynchronously
        try {
          await sendOrderPaidCustomerEmail({
            toEmail: orderData.customerEmail,
            customerName: orderData.customerName || "Değerli Müşterimiz",
            orderNumber: orderData.orderNumber,
            items: orderData.items || [],
            totalAmount: orderData.totalAmount,
          });

          await sendOrderPaidAdminEmail({
            customerName: orderData.customerName || "İsimsiz",
            customerEmail: orderData.customerEmail,
            customerPhone: orderData.customerPhone || "",
            shippingAddress: orderData.shippingAddress as ShippingAddress | null,
            orderNumber: orderData.orderNumber,
            items: orderData.items || [],
            totalAmount: orderData.totalAmount,
          });
        } catch (emailErr) {
          console.error("Failed to send transactional order emails:", emailErr);
        }
      }
    } else {
      // 3. Handle Payment Failure
      const reasonMsg = params.get("failed_reason_msg") || "Unknown error";
      console.warn(`PayTR reported payment failure for order ${merchant_oid}: ${reasonMsg}`);
      
      if (orderData.status === "pending") {
        await orderDoc.ref.update({
          status: "failed",
          updatedAt: new Date(),
        });
      }
    }

    // PayTR requires exactly "OK" printed as response to acknowledge callback processing completion
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error handling PayTR callback hook:", error);
    return new Response("Internal Error", { status: 500 });
  }
}
