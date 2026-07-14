"use client";

import Link from "next/link";
import { CrossSell, type CrossSellProduct } from "@/components/CrossSell";
import { formatTRY } from "@/lib/pricing";
import { cartTotal } from "@/lib/cart";
import { useCart } from "@/lib/useCart";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SectionHeading } from "@/components/atlas/SectionHeading";
import { AtlasPanel } from "@/components/atlas/AtlasPanel";

export default function CheckoutPage() {
  const items = useCart();
  const total = cartTotal(items);
  const ownedProducts: CrossSellProduct[] = items.map((item) => item.productType);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen px-4 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <SectionHeading eyebrow="Ödeme" title="Siparişini gözden geçir." />
          <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-subtle">
            Sepetinden gelen bilgiler doğru şekilde taşındı. Ödeme adımı henüz bağlanmadı — iyzico
            entegrasyonu ayrı bir görevde eklenecek.
          </p>

          {items.length === 0 ? (
            <p className="mt-10 text-center text-sm text-subtle">
              Sepetiniz boş.{" "}
              <Link href="/sepet" className="text-amber underline underline-offset-2 hover:text-bright">
                Sepete dön
              </Link>
              .
            </p>
          ) : (
            <AtlasPanel padding="lg" className="mt-10 w-full">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Sipariş Defteri</p>
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
          )}

          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Ödeme akışı henüz bağlanmadı"
            className="mt-5 w-full cursor-not-allowed rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-6 py-3.5 font-mono text-xs uppercase tracking-widest text-ink opacity-40"
          >
            Ödemeye Geç
          </button>

          <Link
            href="/sepet"
            className="mt-8 font-mono text-xs uppercase tracking-widest text-amber underline-offset-4 transition-colors hover:text-bright hover:underline"
          >
            ← Sepete dön
          </Link>

          <div className="w-full">
            <CrossSell exclude={ownedProducts} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
