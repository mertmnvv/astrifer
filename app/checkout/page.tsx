"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SectionHeading } from "@/components/atlas/SectionHeading";
import { AtlasPanel } from "@/components/atlas/AtlasPanel";
import { formatTRY } from "@/lib/pricing";
import { cartTotal, clearCart } from "@/lib/cart";
import { useCart } from "@/lib/useCart";
import { createOrderAction } from "./actions";
import type { OrderItemDoc } from "@/types/firestore";

const FIELD_CLASS =
  "w-full rounded-[10px] border border-text/[0.14] bg-text/[0.04] px-3 py-2.5 text-sm text-text placeholder:text-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber";
const LABEL_CLASS = "mb-1.5 block font-mono text-[9.5px] uppercase tracking-[0.14em] text-dim";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart();
  const total = cartTotal(items);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive the star map slug — all items in a single order share the same slug
  const starMapSlug = items.find((item) => item.slug)?.slug ?? "";

  const formValid = Boolean(
    name.trim() && email.trim() && phone.trim() && items.length > 0 && starMapSlug,
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formValid || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      // Convert cart items to OrderItemDoc format
      const orderItems: OrderItemDoc[] = items.map((item) => ({
        productType: item.productType as "digital" | "journal",
        label: item.productLabel,
        price: item.price,
        starMapSlug: item.slug ?? starMapSlug,
        journalLetterText: item.journalConfig?.letterText ?? null,
        journalLetterOpeningDate: item.journalConfig?.openingDate ?? null,
      }));

      const result = await createOrderAction({
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        starMapSlug,
        items: orderItems,
      });

      clearCart();
      router.push(
        `/siparis-onay?id=${encodeURIComponent(result.orderId)}&no=${encodeURIComponent(result.orderNumber)}`,
      );
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : "Sipariş oluşturulamadı — lütfen tekrar deneyin.");
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen px-4 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <SectionHeading eyebrow="Ödeme" title="Siparişinizi tamamlayın." />
          <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-subtle">
            İletişim bilgilerinizi girin. Siparişiniz alındıktan sonra ödeme
            talimatları size ulaştırılacaktır.
          </p>

          {items.length === 0 ? (
            <div className="mt-10 text-center">
              <p className="text-sm text-subtle">
                Sepetiniz boş.{" "}
                <Link href="/sepet" className="text-amber underline underline-offset-2 hover:text-bright">
                  Sepete dön
                </Link>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 w-full space-y-6" noValidate>
              {/* ── Sipariş özeti ── */}
              <AtlasPanel padding="lg">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">
                  Sipariş Defteri
                </p>
                <div className="mt-4 divide-y divide-text/[0.08]">
                  {items.map((item) => (
                    <div key={item.id} className="py-3">
                      <div className="flex justify-between gap-4">
                        <dt className="font-mono text-[11px] uppercase tracking-widest text-dim">
                          {item.productLabel}
                        </dt>
                        <dd className="text-right font-mono text-sm font-medium text-amber">
                          {formatTRY(item.price)}
                        </dd>
                      </div>
                      <p className="mt-1 font-display text-base italic text-text">{item.title}</p>
                      {item.summary.length > 0 && (
                        <p className="mt-0.5 text-xs text-subtle">{item.summary.join(" · ")}</p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between gap-4 border-t border-text/[0.08] pt-4">
                  <dt className="font-mono text-xs uppercase tracking-widest text-dim">Toplam</dt>
                  <dd className="font-display text-2xl italic text-amber">{formatTRY(total)}</dd>
                </div>
              </AtlasPanel>

              {/* ── İletişim bilgileri ── */}
              <AtlasPanel padding="lg">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">
                  İletişim Bilgileri
                </p>
                <div className="mt-4 flex flex-col gap-4">
                  <div>
                    <label htmlFor="checkout-name" className={LABEL_CLASS}>
                      Ad Soyad
                    </label>
                    <input
                      id="checkout-name"
                      type="text"
                      required
                      maxLength={100}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Adınız ve soyadınız"
                      className={FIELD_CLASS}
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-email" className={LABEL_CLASS}>
                      E-posta
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      required
                      maxLength={200}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className={FIELD_CLASS}
                    />
                  </div>
                  <div>
                    <label htmlFor="checkout-phone" className={LABEL_CLASS}>
                      Telefon
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      required
                      maxLength={20}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className={FIELD_CLASS}
                    />
                  </div>
                </div>
              </AtlasPanel>

              {/* ── Bilgilendirme ── */}
              <div className="rounded-2xl border border-amber/20 bg-amber/[0.04] px-5 py-4">
                <p className="text-sm leading-relaxed text-subtle">
                  <span className="font-medium text-amber">Ödeme bilgisi:</span>{" "}
                  Siparişiniz onaylandıktan sonra ödeme talimatları (banka hesap
                  bilgileri) tarafınıza iletilecektir. Ödemeniz onaylandığında
                  üretime başlanır.
                </p>
              </div>

              {/* ── Hata mesajı ── */}
              {error && (
                <p role="alert" className="text-sm text-red-300">
                  {error}
                </p>
              )}

              {/* ── Gönder butonu ── */}
              <button
                type="submit"
                disabled={!formValid || isSubmitting}
                className="w-full rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-6 py-3.5 font-mono text-xs uppercase tracking-widest text-ink shadow-[0_10px_40px_-12px_rgba(230,163,92,0.6)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? "Sipariş oluşturuluyor…" : "Siparişi Tamamla"}
              </button>

              <Link
                href="/sepet"
                className="block text-center font-mono text-xs uppercase tracking-widest text-amber underline-offset-4 transition-colors hover:text-bright hover:underline"
              >
                ← Sepete dön
              </Link>
            </form>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
