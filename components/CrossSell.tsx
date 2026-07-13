import Link from "next/link";

export type CrossSellProduct = "digital" | "poster" | "journal";

const PRODUCTS: Record<CrossSellProduct, { title: string; description: string; href: string }> = {
  digital: {
    title: "Dijital Sayfa",
    description: "Kalıcı bağlantı, gerçek gökyüzü ve zamanla büyüyen bir zaman çizelgesi.",
    href: "/create",
  },
  poster: {
    title: "Poster & Çerçeve",
    description: "300 DPI baskı kalitesinde, duvarınızda sonsuza dek duran bir sanat eseri.",
    href: "/urun/poster",
  },
  journal: {
    title: "Deri Defter",
    description: "Kapağında yıldız haritanız, 26 sayfalık kişiye özel bir defter.",
    href: "/urun/defter",
  },
};

/** Cross-sell section linking the other products — shown on each product page (and cart/checkout) so they always point to one another. `exclude` accepts one product or several (e.g. every product already in the cart) so nothing already owned gets re-suggested. */
export function CrossSell({ exclude }: { exclude: CrossSellProduct | CrossSellProduct[] }) {
  const excluded = new Set(Array.isArray(exclude) ? exclude : [exclude]);
  const others = (Object.keys(PRODUCTS) as CrossSellProduct[]).filter((key) => !excluded.has(key));

  if (others.length === 0) return null;

  return (
    <div className="mt-16 border-t border-text/10 pt-10">
      <p className="mb-5 text-center font-mono text-xs uppercase tracking-widest text-dim">
        Bunlar da ilginizi çekebilir
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {others.map((key) => {
          const product = PRODUCTS[key];
          return (
            <Link
              key={key}
              href={product.href}
              className="rounded-2xl border border-text/10 bg-text/[0.035] p-5 transition-colors hover:border-amber/40 hover:bg-text/[0.05]"
            >
              <p className="font-display text-lg italic text-bright">{product.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-subtle">{product.description}</p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-amber">İncele →</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
