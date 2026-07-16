"use client";

import { useState, type FormEvent, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SectionHeading } from "@/components/atlas/SectionHeading";
import { AtlasPanel } from "@/components/atlas/AtlasPanel";
import { formatTRY } from "@/lib/pricing";
import { cartTotal, clearCart } from "@/lib/cart";
import { useCart } from "@/lib/useCart";
import { getCheckoutPaymentTokenAction } from "./actions";
import type { OrderItemDoc } from "@/types/firestore";

const FIELD_CLASS =
  "w-full rounded-[10px] border border-text/[0.14] bg-text/[0.04] px-3 py-2.5 text-sm text-text placeholder:text-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber";
const LABEL_CLASS = "mb-1.5 block font-mono text-[9.5px] uppercase tracking-[0.14em] text-dim";

function CheckoutForm() {
  const items = useCart();
  const total = cartTotal(items);
  const searchParams = useSearchParams();

  // Check if PayTR redirected back with a payment failure error query param
  const paymentFailed = searchParams.get("error") === "payment_failed";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Shipping details state (used only if a physical journal is in the cart)
  const [shippingName, setShippingName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToSales, setAgreedToSales] = useState(false);

  const [paytrToken, setPaytrToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    paymentFailed ? "Ödeme işlemi başarısız oldu veya iptal edildi. Lütfen tekrar deneyin." : null
  );

  const starMapSlug = items.find((item) => item.slug)?.slug ?? "";
  const hasJournal = items.some((item) => item.productType === "journal");

  const shippingValid =
    !hasJournal ||
    Boolean(shippingName.trim() && address.trim() && city.trim() && district.trim());

  const formValid = Boolean(
    name.trim() && email.trim() && phone.trim() && items.length > 0 && starMapSlug && shippingValid && agreedToTerms && agreedToSales
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!formValid || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const orderItems: OrderItemDoc[] = items.map((item) => ({
        productType: item.productType as "digital" | "journal",
        label: item.productLabel,
        price: item.price,
        starMapSlug: item.slug ?? starMapSlug,
        journalLetterText: item.journalConfig?.letterText ?? null,
        journalLetterOpeningDate: item.journalConfig?.openingDate ?? null,
      }));

      const result = await getCheckoutPaymentTokenAction({
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        starMapSlug,
        items: orderItems,
        shippingAddress: hasJournal
          ? {
              name: shippingName.trim(),
              address: address.trim(),
              city: city.trim(),
              district: district.trim(),
            }
          : null,
      });

      // Clear checkout cart local items to avoid duplicates
      clearCart();
      setPaytrToken(result.iframeToken);
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : "Ödeme başlatılamadı — lütfen tekrar deneyin.");
    }
  };

  // If secure token has been fetched, show PayTR secure iframe inline in place of form
  if (paytrToken) {
    return (
      <main className="min-h-screen px-4 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <SectionHeading eyebrow="Ödeme" title="Güvenli Ödeme" />
          <p className="mx-auto mt-4 max-w-md text-center text-xs leading-relaxed text-subtle">
            Lütfen aşağıdaki alana kredi kartı bilgilerinizi girerek ödemenizi tamamlayın.
            Ödemeniz PayTR 256-bit SSL korumasıyla güvence altındadır.
          </p>

          <div className="relative mt-8 w-full min-h-[600px] border border-text/10 bg-void/50 rounded-2xl overflow-hidden shadow-2xl">
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-void/90 gap-3">
                <svg className="h-7 w-7 animate-spin text-amber" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                <p className="font-mono text-[9px] uppercase tracking-widest text-dim animate-pulse">Güvenli ödeme alanı yükleniyor...</p>
              </div>
            )}
            <iframe
              src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
              width="100%"
              height="600"
              frameBorder="0"
              scrolling="no"
              onLoad={() => setIframeLoading(false)}
            />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
      <div className="mx-auto flex max-w-xl flex-col items-center">
        <SectionHeading eyebrow="Ödeme" title="Siparişinizi tamamlayın." />
        <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-subtle">
          Sipariş detaylarınızı onaylayın ve bilgilerinizi doldurarak ödeme adımına ilerleyin.
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
                {(() => {
                  const journalSlugs = new Set(
                    items.filter((i) => i.productType === "journal" && i.slug).map((i) => i.slug)
                  );

                  return items.map((item) => {
                    const isFreeDigital = item.productType === "digital" && item.slug && journalSlugs.has(item.slug);

                    return (
                      <div key={item.id} className="py-3">
                        <div className="flex justify-between gap-4">
                          <dt className="font-mono text-[11px] uppercase tracking-widest text-dim">
                            {item.productLabel}
                          </dt>
                          <dd className="text-right font-mono text-sm font-medium text-amber">
                            {isFreeDigital ? (
                              <span className="flex flex-col items-end">
                                <span className="text-xs text-dim line-through">{formatTRY(item.price)}</span>
                                <span className="text-green-400">Bedava</span>
                              </span>
                            ) : (
                              formatTRY(item.price)
                            )}
                          </dd>
                        </div>
                        <p className="mt-1 font-display text-base italic text-text">{item.title}</p>
                        {item.summary.length > 0 && (
                          <p className="mt-0.5 text-xs text-subtle">{item.summary.join(" · ")}</p>
                        )}
                      </div>
                    );
                  });
                })()}
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

            {/* ── Kargo teslimat bilgileri (Deri Defter varsa) ── */}
            {hasJournal && (
              <AtlasPanel padding="lg">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">
                  Kargo Teslimat Bilgileri
                </p>
                <div className="mt-4 flex flex-col gap-4">
                  <div>
                    <label htmlFor="shipping-name" className={LABEL_CLASS}>
                      Alıcı Ad Soyad
                    </label>
                    <input
                      id="shipping-name"
                      type="text"
                      required
                      maxLength={100}
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      placeholder="Teslim alacak kişinin adı soyadı"
                      className={FIELD_CLASS}
                    />
                  </div>
                  <div>
                    <label htmlFor="shipping-address" className={LABEL_CLASS}>
                      Açık Adres
                    </label>
                    <textarea
                      id="shipping-address"
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Mahalle, cadde/sokak, daire no..."
                      className={`${FIELD_CLASS} resize-none`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="shipping-city" className={LABEL_CLASS}>
                        İl (Şehir)
                      </label>
                      <input
                        id="shipping-city"
                        type="text"
                        required
                        maxLength={50}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="İstanbul"
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <label htmlFor="shipping-district" className={LABEL_CLASS}>
                        İlçe
                      </label>
                      <input
                        id="shipping-district"
                        type="text"
                        required
                        maxLength={50}
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="Kadıköy"
                        className={FIELD_CLASS}
                      />
                    </div>
                  </div>
                </div>
              </AtlasPanel>
            )}

            {/* ── Yasal onay kutuları ── */}
            <div className="flex flex-col gap-3.5 rounded-2xl border border-text/10 bg-text/[0.01] p-4.5 text-left mb-4">
              <label className="flex items-start gap-3 cursor-pointer text-[11px] leading-relaxed text-subtle hover:text-bright select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-text/20 bg-void text-amber focus:ring-amber focus:ring-offset-void focus:outline-none accent-amber"
                />
                <span>
                  <Link href="/sozlesmeler/kullanim-kosullari" target="_blank" className="text-amber underline hover:text-bright transition-colors font-medium">Kullanım Koşullarını</Link> ve <Link href="/sozlesmeler/kvkk" target="_blank" className="text-amber underline hover:text-bright transition-colors font-medium">KVKK Aydınlatma Metnini</Link> okudum, onaylıyorum.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer text-[11px] leading-relaxed text-subtle hover:text-bright select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreedToSales}
                  onChange={(e) => setAgreedToSales(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-text/20 bg-void text-amber focus:ring-amber focus:ring-offset-void focus:outline-none accent-amber"
                />
                <span>
                  <Link href="/sozlesmeler/mesafeli-satis" target="_blank" className="text-amber underline hover:text-bright transition-colors font-medium">Mesafeli Satış Sözleşmesini</Link> ve <Link href="/sozlesmeler/on-bilgilendirme" target="_blank" className="text-amber underline hover:text-bright transition-colors font-medium">Ön Bilgilendirme Formunu</Link> okudum, onaylıyorum.
                </span>
              </label>
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
              {isSubmitting ? "Ödeme penceresi açılıyor…" : "Kredi Kartı ile Öde"}
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
  );
}

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <Suspense
        fallback={
          <main className="min-h-screen px-4 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36 flex items-center justify-center">
            <p className="font-mono text-xs uppercase tracking-widest text-dim animate-pulse">
              Yükleniyor...
            </p>
          </main>
        }
      >
        <CheckoutForm />
      </Suspense>
      <SiteFooter />
    </>
  );
}
