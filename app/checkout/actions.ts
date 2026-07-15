"use server";

import { z } from "zod";
import { createOrder, type CreateOrderResult } from "@/lib/orders";
import type { OrderItemDoc } from "@/types/firestore";

// ---------------------------------------------------------------------------
// Input schema
// ---------------------------------------------------------------------------

const OrderItemSchema = z.object({
  productType: z.enum(["digital", "journal"]),
  label: z.string().min(1),
  price: z.number().positive(),
  starMapSlug: z.string().min(1),
  journalLetterText: z.string().nullable().optional(),
  journalLetterOpeningDate: z.string().nullable().optional(),
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
});

// ---------------------------------------------------------------------------
// Server action
// ---------------------------------------------------------------------------

export interface CreateOrderActionInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  starMapSlug: string;
  items: OrderItemDoc[];
}

/**
 * Called from the checkout page's client component. Validates input with Zod,
 * then delegates to `lib/orders.ts` → `createOrder`. Returns the order id
 * and human-readable order number so the client can navigate to the
 * confirmation page.
 */
export async function createOrderAction(
  input: CreateOrderActionInput,
): Promise<CreateOrderResult> {
  const parsed = CreateOrderSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Geçersiz sipariş bilgisi.";
    throw new Error(firstError);
  }

  return createOrder({
    customerName: parsed.data.customerName,
    customerEmail: parsed.data.customerEmail,
    customerPhone: parsed.data.customerPhone,
    starMapSlug: parsed.data.starMapSlug,
    items: parsed.data.items as OrderItemDoc[],
  });
}
