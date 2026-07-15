import Link from "next/link";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/atlas/SectionHeading";
import { DIGITAL_PRICE, JOURNAL_PRICE, formatTRY } from "@/lib/pricing";

interface ProductItem {
  title: string;
  description: string;
  price: string;
  features: string[];
  href: string;
  cta: string;
  badge?: string;
}

const PRODUCTS: ProductItem[] = [
  {
    title: "Dijital Sayfa",
    description: "Kalıcı bağlantınız ve paylaşılabilir interaktif zaman kapsülü sayfanız.",
    price: `${formatTRY(DIGITAL_PRICE)}`,
    features: [
      "Ömür boyu kalıcı web bağlantısı",
      "Ses kaydı & fotoğraf galerisi",
      "Arka plan müzik desteği",
      "Canlı yıldız haritası simülasyonu",
    ],
    href: "/urun/dijital",
    cta: "Detayları Gör",
  },
  {
    title: "Deri Defter",
    description: "Kapağında size özel yıldız haritası, içinde anılarınız ve sizin satırlarınız.",
    price: formatTRY(JOURNAL_PRICE),
    features: [
      "Premium suni deri, el işçiliği ciltleme",
      "Özel gofre (sıcak baskı) kapak deseni",
      "Altın yaldızlı sayfa kenarı",
      "15 sayfa boş/çizgili, 26 sayfalık kitap",
      "Birlikte Anılarımız fotoğraf sayfası (4 foto)",
      "Gelecek Mektubu — ileri tarihe mühürlü mektup",
      "Hediye altın renkli kalem",
      "Gömülü akıllı QR kod bağlantısı",
    ],
    href: "/urun/defter",
    cta: "Detayları Gör",
  },
];

export function ProductsTeaser() {
  return (
    <section id="urunler" className="scroll-mt-20 px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <RevealOnScroll>
          <SectionHeading eyebrow="Koleksiyon" title="Dijital, ya da elle tutulur." />
        </RevealOnScroll>

        <div className="mx-auto mt-14 grid max-w-2xl gap-5 sm:grid-cols-2">
          {PRODUCTS.map((product, index) => (
            <RevealOnScroll key={product.title} delayMs={index * 100}>
              <div className="relative flex h-full flex-col rounded-[22px] border border-text/10 bg-text/[0.035] p-7 sm:p-8">
                {product.badge && (
                  <div className="absolute right-6 top-6 rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-2.5 py-1 font-mono text-[8px] font-medium uppercase tracking-widest text-ink">
                    {product.badge}
                  </div>
                )}

                <h3 className="font-display text-2xl italic text-text">{product.title}</h3>
                <p className="mt-3 min-h-[44px] text-xs leading-relaxed text-subtle">{product.description}</p>

                <ul className="mt-6 flex-1 space-y-2 border-t border-text/10 pt-5">
                  {product.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-xs text-muted">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber"
                      >
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-baseline justify-between border-t border-text/10 pt-[18px]">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-dim">Fiyat</span>
                  <span className="font-mono text-sm font-medium text-amber">{product.price}</span>
                </div>

                <Link
                  href={product.href}
                  className="mt-4 w-full rounded-full border border-amber/40 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-amber transition-colors hover:bg-amber hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
                >
                  {product.cta}
                </Link>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
