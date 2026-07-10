import Link from "next/link";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/atlas/SectionHeading";
import { AtlasPanel } from "@/components/atlas/AtlasPanel";
import { DIGITAL_PRICE, JOURNAL_PRICE, POSTER_SIZES, formatTRY } from "@/lib/pricing";

const posterFrom = Math.min(...POSTER_SIZES.map((size) => size.basePrice));

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
    href: "/create",
    cta: "Hemen Oluştur",
  },
  {
    title: "Poster & Çerçeve",
    description: "300 DPI baskı kalitesinde, evinizin en güzel köşesi için sanatsal gökyüzü tablosu.",
    price: `${formatTRY(posterFrom)}'den başlayan`,
    features: [
      "300 DPI Fine-Art müze kalitesi baskı",
      "Mat premium dokulu sanatsal kağıt",
      "Şık ahşap/metal çerçeve seçenekleri",
      "Dijital sayfaya yönlendiren QR kod",
    ],
    href: "/urun/poster",
    cta: "Seçenekleri İncele",
    badge: "Çok Satan",
  },
  {
    title: "Deri Defter",
    description: "Kapağında size özel yıldız haritası, içinde anılarınız ve sizin satırlarınız.",
    price: formatTRY(JOURNAL_PRICE),
    features: [
      "El işçiliği hakiki deri ciltleme",
      "Özel gofre (sıcak baskı) kapak deseni",
      "30 sayfa 120gr fildişi eskiz kağıdı",
      "Gömülü akıllı QR kod bağlantısı",
    ],
    href: "/urun/defter",
    cta: "Detayları Gör",
  },
];

export function ProductsTeaser() {
  return (
    <section id="urunler" className="scroll-mt-20 bg-parchment-dim px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <RevealOnScroll>
          <SectionHeading eyebrow="Koleksiyon" title="Dijital, ya da elle tutulur." />
        </RevealOnScroll>

        <RevealOnScroll delayMs={120} className="mt-14">
          <AtlasPanel tone="parchment" textured padding="none">
            <div className="grid divide-y divide-ink/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {PRODUCTS.map((product) => (
                <div key={product.title} className="relative flex flex-col p-7 sm:p-8">
                  {product.badge && (
                    <div className="absolute right-6 top-6 rounded-full bg-brass px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-widest text-void">
                      {product.badge}
                    </div>
                  )}

                  <h3 className="font-display text-2xl italic text-ink">{product.title}</h3>
                  <p className="mt-3 text-xs leading-relaxed text-ink/70">{product.description}</p>

                  <ul className="mt-6 flex-1 space-y-2 border-t border-ink/10 pt-5">
                    {product.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-xs text-ink/80">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass"
                        >
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-col gap-4 border-t border-ink/10 pt-5">
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-leather-lt">Fiyat</span>
                      <span className="font-mono text-sm font-bold uppercase tracking-wider text-brass">
                        {product.price}
                      </span>
                    </div>

                    <Link
                      href={product.href}
                      className="w-full rounded-full border border-ink/25 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-ink transition-all duration-300 hover:border-brass hover:bg-brass hover:text-void focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
                    >
                      {product.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </AtlasPanel>
        </RevealOnScroll>
      </div>
    </section>
  );
}
