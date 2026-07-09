import Link from "next/link";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { DIGITAL_PRICE, JOURNAL_PRICE, POSTER_SIZES, formatTRY } from "@/lib/pricing";

const posterFrom = Math.min(...POSTER_SIZES.map((size) => size.basePrice));

const PRODUCTS = [
  {
    title: "Dijital Sayfa",
    description: "Kalıcı bağlantınız ve paylaşılabilir zaman kapsülü sayfanız.",
    price: `${formatTRY(DIGITAL_PRICE)}`,
    href: "/create",
    cta: "Oluştur",
  },
  {
    title: "Poster & Çerçeve",
    description: "300 DPI baskı kalitesinde, gerçek gökyüzünüz duvarınızda.",
    price: `${formatTRY(posterFrom)}'den başlayan`,
    href: "/urun/poster",
    cta: "İncele",
  },
  {
    title: "Deri Defter",
    description: "Yıldız haritanız, anılarınız ve sizin satırlarınız için 30 sayfa.",
    price: formatTRY(JOURNAL_PRICE),
    href: "/urun/defter",
    cta: "İncele",
  },
];

export function ProductsTeaser() {
  return (
    <section id="urunler" className="scroll-mt-20 px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <RevealOnScroll className="mx-auto max-w-xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-brass-dim">Ürünler</p>
          <h2 className="mt-4 font-display text-3xl italic text-text sm:text-4xl">Dijital, ya da elle tutulur.</h2>
        </RevealOnScroll>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {PRODUCTS.map((product, index) => (
            <RevealOnScroll key={product.title} delayMs={index * 120}>
              <Link
                href={product.href}
                className="group flex h-full flex-col rounded-lg border border-brass-dim/20 bg-panel-navy/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brass-dim/60"
              >
                <h3 className="font-display text-xl italic text-text">{product.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-haze">{product.description}</p>
                <div className="mt-6 flex items-center justify-between border-t border-brass-dim/15 pt-4">
                  <span className="font-mono text-xs uppercase tracking-widest text-brass">{product.price}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-haze transition-colors group-hover:text-brass">
                    {product.cta} →
                  </span>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
