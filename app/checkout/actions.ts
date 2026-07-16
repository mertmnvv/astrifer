"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { createOrder } from "@/lib/orders";
import { getPaytrToken, type PaytrBasketItem } from "@/lib/payment/paytr";
import { getSiteUrl } from "@/lib/siteUrl";
import type { OrderItemDoc, ShippingAddress } from "@/types/firestore";

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

const OrderItemSchema = z.object({
  productType: z.enum(["digital", "journal"]),
  label: z.string().min(1),
  price: z.number().positive(),
  starMapSlug: z.string().min(1),
  journalLetterText: z.string().nullable().optional(),
  journalLetterOpeningDate: z.string().nullable().optional(),
});

const ShippingAddressSchema = z.object({
  name: z.string().min(1, "Kargo alıcı adı gerekli."),
  address: z.string().min(5, "Geçerli bir kargo adresi girin."),
  city: z.string().min(1, "İl (Şehir) seçimi veya girişi gerekli."),
  district: z.string().min(1, "İlçe girişi gerekli."),
});

const CreateOrderSchema = z.object({
  customerName: z.string().min(1, "Ad soyad gerekli."),
  customerEmail: z.string().email("Geçerli bir e-posta adresi girin."),
  customerPhone: z
    .string()
    .min(10, "Telefon numarası en az 10 karakter olmalı.")
    .regex(/^[0-9+\-() ]+$/, "Geçerli bir telefon numarası girin."),
  starMapSlug: z.string().min(1, "Dijital sayfa slug'ı eksik."),
  items: z.array(OrderItemSchema).min(1, "Sepette en az bir ürün olmalı."),
  shippingAddress: ShippingAddressSchema.nullable(),
});

export interface GetCheckoutPaymentTokenActionInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  starMapSlug: string;
  items: OrderItemDoc[];
  shippingAddress: ShippingAddress | null;
}

export interface GetCheckoutPaymentTokenResult {
  iframeToken: string;
  orderId: string;
  orderNumber: string;
}

function getClientIp(): string {
  const reqHeaders = headers();
  const forwardedFor = reqHeaders.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return reqHeaders.get("x-real-ip") || "127.0.0.1";
}

/**
 * Creates a "pending" order in Firestore, then calls the PayTR API
 * to retrieve a secure, one-time credit card iFrame payment token.
 */
export async function getCheckoutPaymentTokenAction(
  input: GetCheckoutPaymentTokenActionInput,
): Promise<GetCheckoutPaymentTokenResult> {
  const parsed = CreateOrderSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Geçersiz sipariş bilgisi.";
    throw new Error(firstError);
  }

  const hasJournal = parsed.data.items.some((item) => item.productType === "journal");
  if (hasJournal && !parsed.data.shippingAddress) {
    throw new Error("Deri Defter siparişi için kargo adresi doldurulmalıdır.");
  }

  // Apply discount: if a journal item is present, the digital item with the same slug gets price = 0
  const journalSlugs = new Set(
    parsed.data.items.filter((item) => item.productType === "journal").map((item) => item.starMapSlug)
  );

  const adjustedItems = parsed.data.items.map((item) => {
    if (item.productType === "digital" && journalSlugs.has(item.starMapSlug)) {
      return { ...item, price: 0 };
    }
    return item;
  });

  // 1. Write the order with 'pending' status to Firestore
  const { orderId, orderNumber } = await createOrder({
    customerName: parsed.data.customerName,
    customerEmail: parsed.data.customerEmail,
    customerPhone: parsed.data.customerPhone,
    starMapSlug: parsed.data.starMapSlug,
    items: adjustedItems as OrderItemDoc[],
    paymentMethod: "paytr",
    shippingAddress: parsed.data.shippingAddress,
  });

  // 2. Fetch the client IP address from the request headers
  const userIp = getClientIp();

  // 3. Format basket items array for the PayTR API
  const basketItems: PaytrBasketItem[] = adjustedItems.map((item) => ({
    name: item.label,
    price: item.price.toFixed(2),
    quantity: 1,
  }));

  // 4. Address format: required by PayTR (defaulting to placeholder for digital-only purchases)
  const userAddress = parsed.data.shippingAddress
    ? `${parsed.data.shippingAddress.address} ${parsed.data.shippingAddress.district}/${parsed.data.shippingAddress.city}`
    : "Dijital Teslimat, Astrifer";

  const paytrUserName = parsed.data.shippingAddress?.name || parsed.data.customerName;

  const siteUrl = getSiteUrl();
  const merchantOkUrl = `${siteUrl}/siparis-onay?id=${encodeURIComponent(orderId)}&no=${encodeURIComponent(orderNumber)}`;
  const merchantFailUrl = `${siteUrl}/checkout?error=payment_failed`;

  const totalAmount = adjustedItems.reduce((sum, item) => sum + item.price, 0);

  try {
    // 5. Query PayTR for the one-time iFrame token
    const iframeToken = await getPaytrToken({
      userIp,
      merchantOid: orderNumber,
      email: parsed.data.customerEmail,
      totalAmount,
      userName: paytrUserName,
      userAddress,
      userPhone: parsed.data.customerPhone,
      basketItems,
      merchantOkUrl,
      merchantFailUrl,
      hasPhysicalProduct: hasJournal,
    });

    return {
      iframeToken,
      orderId,
      orderNumber,
    };
  } catch (error) {
    console.error("PayTR Token retrieval failure:", error);
    throw new Error(error instanceof Error ? error.message : "Ödeme altyapısı başlatılamadı.");
  }
}
