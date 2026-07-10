import Link from "next/link";
import { CoverPanel } from "@/components/journal/CoverPanel";
import { DIGITAL_PRICE, JOURNAL_PRICE, formatTRY } from "@/lib/pricing";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SectionHeading } from "@/components/atlas/SectionHeading";
import { AtlasPanel } from "@/components/atlas/AtlasPanel";
import { LedgerRule } from "@/components/atlas/LedgerRule";

function toSearchParams(searchParams: { [key: string]: string | string[] | undefined }): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
    } else {
      params.set(key, value);
    }
  }
  return params;
}

function LedgerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="font-mono text-[11px] uppercase tracking-widest text-leather-lt">{label}</dt>
      <dd className="text-right text-sm text-ink">{value}</dd>
    </div>
  );
}

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const get = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const title = get("title");
  const location = get("location");
  const date = get("date");
  const template = get("template");
  const message = get("message");
  const product = get("product");
  const size = get("size");
  const frame = get("frame");
  const priceParam = get("price");
  const photosParam = get("photos");
  const photoUrls = photosParam ? photosParam.split(",").filter(Boolean) : [];
  const voiceUrl = get("voice");
  const journalAdded = get("addOn") === "journal";

  const productLabel: Record<string, string> = {
    framed_poster: "Çerçeveli Poster",
    poster: "Poster",
    journal: "Deri Defter",
    digital: "Dijital Sayfa",
  };

  // /create hands off with no `product` param at all — that's the base
  // digital-page order, which never had a price attached until now.
  const isDigitalOrder = !product && Boolean(title);
  const effectiveProduct = product ?? (isDigitalOrder ? "digital" : undefined);
  const basePrice = priceParam ? Number(priceParam) : isDigitalOrder ? DIGITAL_PRICE : undefined;
  const grandTotal = (basePrice ?? 0) + (journalAdded ? JOURNAL_PRICE : 0);

  const addOnOnParams = toSearchParams(searchParams);
  addOnOnParams.set("addOn", "journal");
  const addOnOffParams = toSearchParams(searchParams);
  addOnOffParams.delete("addOn");

  const hasSummary = Boolean(title || product);
  const showJournalUpsell = effectiveProduct !== "journal";

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-void px-4 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <SectionHeading eyebrow="Checkout" title="Siparişini gözden geçir." tone="parchment" />
          <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-haze">
            Ödeme akışı henüz bağlanmadı. Konfigüratörden gelen bilgiler doğru şekilde taşındı — iyzico
            entegrasyonu ayrı bir görevde eklenecek.
          </p>

          {hasSummary && (
            <AtlasPanel tone="parchment" textured padding="lg" className="mt-10 w-full">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-leather-lt">Sipariş Defteri</p>
              <div className="mt-4 divide-y divide-ink/10">
                {title && <LedgerRow label="İsim / Başlık" value={title} />}
                {template && <LedgerRow label="Şablon" value={template} />}
                {location && <LedgerRow label="Konum" value={location} />}
                {date && <LedgerRow label="Tarih (UTC)" value={date} />}
                {effectiveProduct && (
                  <LedgerRow label="Ürün" value={productLabel[effectiveProduct] ?? effectiveProduct} />
                )}
                {size && <LedgerRow label="Boyut" value={size} />}
                {frame && frame !== "none" && <LedgerRow label="Çerçeve" value={frame} />}
                {photoUrls.length > 0 && <LedgerRow label="Fotoğraflar" value={`${photoUrls.length} adet yüklendi`} />}
                {voiceUrl && <LedgerRow label="Sesli mesaj" value="Eklendi" />}
              </div>
              {message && (
                <div className="mt-2">
                  <LedgerRule tone="ink" />
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-leather-lt">Mesaj</p>
                  <p className="mt-1.5 font-display text-base italic leading-relaxed text-ink">{message}</p>
                </div>
              )}
              {basePrice !== undefined && !Number.isNaN(basePrice) && (
                <div className="mt-4">
                  <LedgerRule tone="ink" />
                  <div className="mt-4 flex justify-between gap-4">
                    <dt className="font-mono text-xs uppercase tracking-widest text-leather-lt">Tutar</dt>
                    <dd className="font-mono text-sm font-bold text-brass">{formatTRY(basePrice)}</dd>
                  </div>
                </div>
              )}
            </AtlasPanel>
          )}

          {showJournalUpsell && (
            <AtlasPanel tone="parchment-dim" padding="none" className="mt-6 flex w-full items-center gap-4 p-4">
              <div className="w-16 shrink-0">
                <CoverPanel compact />
              </div>
              <div className="flex-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-brass-dim">Ekstra: Deri Defter</p>
                <p className="mt-0.5 text-xs text-ink/70">Kapağında haritan, içinde 30 boş sayfa.</p>
                <p className="mt-1 font-display text-lg italic text-ink">{formatTRY(JOURNAL_PRICE)}</p>
              </div>
              <Link
                href={`?${(journalAdded ? addOnOffParams : addOnOnParams).toString()}`}
                className={`shrink-0 rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass ${
                  journalAdded
                    ? "border-brass bg-brass-dim/20 text-leather-lt"
                    : "border-ink/25 text-ink/70 hover:border-brass hover:text-leather-lt"
                }`}
              >
                {journalAdded ? "✓ Eklendi" : "+ Ekle"}
              </Link>
            </AtlasPanel>
          )}

          {grandTotal > 0 && (journalAdded || basePrice !== undefined) && (
            <p className="mt-8 font-mono text-xs uppercase tracking-widest text-haze">
              Toplam: <span className="text-brass">{formatTRY(grandTotal)}</span>
            </p>
          )}

          <Link
            href={toSearchParams(searchParams).toString() ? `/create?${toSearchParams(searchParams).toString()}` : "/create"}
            className="mt-10 font-mono text-xs uppercase tracking-widest text-brass underline-offset-4 transition-colors hover:text-parchment hover:underline"
          >
            ← Konfigüratöre dön
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
