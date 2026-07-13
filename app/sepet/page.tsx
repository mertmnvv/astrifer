"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SectionHeading } from "@/components/atlas/SectionHeading";
import { AtlasPanel } from "@/components/atlas/AtlasPanel";
import { CrossSell, type CrossSellProduct } from "@/components/CrossSell";
import { cartTotal, removeFromCart } from "@/lib/cart";
import { useCart } from "@/lib/useCart";
import { formatTRY } from "@/lib/pricing";

export default function CartPage() {
  const router = useRouter();
  const items = useCart();
  const total = cartTotal(items);
  const ownedProducts: CrossSellProduct[] = items.map((item) =>
    item.productType === "framed_poster" ? "poster" : item.productType,
  );

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen px-4 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <SectionHeading eyebrow="Sepet" title="Sepetiniz." />

          {items.length === 0 ? (
            <>
              <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-subtle">
                Sepetiniz henüz boş. Bir zaman kapsülü oluşturarak ya da poster/defter konfigüratörlerinden
                birini keşfederek başlayabilirsiniz.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/create"
                  className="rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-6 py-3 font-mono text-xs uppercase tracking-widest text-ink transition-opacity hover:opacity-90"
                >
                  Dijital Sayfa Oluştur
                </Link>
                <Link
                  href="/urun/poster"
                  className="rounded-full border border-amber/40 px-6 py-3 font-mono text-xs uppercase tracking-widest text-amber transition-colors hover:bg-amber/10"
                >
                  Poster İncele
                </Link>
                <Link
                  href="/urun/defter"
                  className="rounded-full border border-amber/40 px-6 py-3 font-mono text-xs uppercase tracking-widest text-amber transition-colors hover:bg-amber/10"
                >
                  Defter İncele
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-subtle">
                Sepetinizdeki ürünleri gözden geçirin, dilerseniz kaldırın, sonra ödemeye geçin.
              </p>

              <div className="mt-10 flex w-full flex-col gap-4">
                {items.map((item) => (
                  <AtlasPanel key={item.id} padding="lg" className="w-full">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber">
                          {item.productLabel}
                        </p>
                        <p className="mt-1 font-display text-lg italic text-bright">{item.title}</p>
                        {item.summary.length > 0 && (
                          <ul className="mt-2 space-y-0.5">
                            {item.summary.map((line) => (
                              <li key={line} className="text-xs text-subtle">
                                {line}
                              </li>
                            ))}
                          </ul>
                        )}
                        {item.slug && (
                          <Link
                            href={`/s/${item.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block font-mono text-[10px] uppercase tracking-widest text-amber underline underline-offset-2 hover:text-bright"
                          >
                            Dijital sayfayı görüntüle
                          </Link>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-3">
                        <span className="font-display text-xl italic text-amber">{formatTRY(item.price)}</span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="font-mono text-[10px] uppercase tracking-widest text-subtle underline-offset-2 transition-colors hover:text-red-300 hover:underline"
                        >
                          Kaldır
                        </button>
                      </div>
                    </div>
                  </AtlasPanel>
                ))}
              </div>

              <div className="mt-6 flex w-full items-baseline justify-between px-1">
                <span className="font-mono text-xs uppercase tracking-widest text-subtle">Toplam</span>
                <span className="font-display text-3xl italic text-amber">{formatTRY(total)}</span>
              </div>

              <button
                type="button"
                onClick={() => router.push("/checkout")}
                className="mt-5 w-full rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-6 py-3.5 font-mono text-xs uppercase tracking-widest text-ink shadow-[0_10px_40px_-12px_rgba(230,163,92,0.6)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
              >
                Ödemeye Geç
              </button>
            </>
          )}

          <div className="w-full">
            <CrossSell exclude={ownedProducts} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
