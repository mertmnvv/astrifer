import Link from "next/link";
import { CoverPanel } from "@/components/journal/CoverPanel";
import { formatTRY } from "@/lib/pricing";
import { getPricingConfig } from "@/lib/pricingConfig";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SectionHeading } from "@/components/atlas/SectionHeading";
import { AtlasPanel } from "@/components/atlas/AtlasPanel";

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
      <dt className="font-mono text-[11px] uppercase tracking-widest text-dim">{label}</dt>
      <dd className="text-right text-sm text-text">{value}</dd>
    </div>
  );
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { digitalPrice, journalPrice } = await getPricingConfig();

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
  const mood = get("mood");
  const letterText = get("letterText");
  const letterOpeningDate = get("letterOpeningDate");

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
  const basePrice = priceParam ? Number(priceParam) : isDigitalOrder ? digitalPrice : undefined;
  const grandTotal = (basePrice ?? 0) + (journalAdded ? journalPrice : 0);

  const addOnOnParams = toSearchParams(searchParams);
  addOnOnParams.set("addOn", "journal");
  const addOnOffParams = toSearchParams(searchParams);
  addOnOffParams.delete("addOn");

  const hasSummary = Boolean(title || product);
  const showJournalUpsell = effectiveProduct !== "journal";

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen px-4 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <SectionHeading eyebrow="Sepet" title="Siparişini gözden geçir." />
          <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-subtle">
            Konfigüratörden gelen bilgiler doğru şekilde taşındı. Ödeme adımı henüz bağlanmadı — iyzico
            entegrasyonu ayrı bir görevde eklenecek.
          </p>

          {hasSummary && (
            <AtlasPanel padding="lg" className="mt-10 w-full">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Sipariş Defteri</p>
              <div className="mt-4 divide-y divide-text/[0.08]">
                {title && <LedgerRow label="İsim / Başlık" value={title} />}
                {template && <LedgerRow label="Şablon" value={template} />}
                {location && <LedgerRow label="Konum" value={location} />}
                {date && <LedgerRow label="Tarih (UTC)" value={date} />}
                {effectiveProduct && (
                  <LedgerRow label="Ürün" value={productLabel[effectiveProduct] ?? effectiveProduct} />
                )}
                {size && <LedgerRow label="Boyut" value={size} />}
                {frame && frame !== "frameless" && <LedgerRow label="Çerçeve" value={frame} />}
                {mood && <LedgerRow label="Renk Ruhu" value={mood} />}
                {photoUrls.length > 0 && <LedgerRow label="Fotoğraflar" value={`${photoUrls.length} adet yüklendi`} />}
                {voiceUrl && <LedgerRow label="Sesli mesaj" value="Eklendi" />}
                {letterOpeningDate && <LedgerRow label="Mektup Açılış Tarihi" value={letterOpeningDate} />}
              </div>
              {message && (
                <div className="mt-2 border-t border-text/[0.08] pt-4">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-dim">Mesaj</p>
                  <p className="mt-1.5 font-display text-base italic leading-relaxed text-text">{message}</p>
                </div>
              )}
              {letterText && (
                <div className="mt-2 border-t border-text/[0.08] pt-4">
                  <p className="font-mono text-[11px] uppercase tracking-widest text-dim">Gelecek Mektubu</p>
                  <p className="mt-1.5 whitespace-pre-line font-display text-base italic leading-relaxed text-text">
                    {letterText}
                  </p>
                </div>
              )}
              {basePrice !== undefined && !Number.isNaN(basePrice) && (
                <div className="mt-4 flex justify-between gap-4 border-t border-text/[0.08] pt-4">
                  <dt className="font-mono text-xs uppercase tracking-widest text-dim">Tutar</dt>
                  <dd className="font-mono text-sm font-medium text-amber">{formatTRY(basePrice)}</dd>
                </div>
              )}
            </AtlasPanel>
          )}

          {showJournalUpsell && (
            <AtlasPanel padding="none" className="mt-4 flex w-full items-center gap-4 p-4">
              <div className="w-14 shrink-0">
                <CoverPanel compact />
              </div>
              <div className="flex-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-amber">Ekstra: Deri Defter</p>
                <p className="mt-0.5 text-xs text-subtle">Kapağında haritan, 26 sayfalık kişiye özel bir defter.</p>
                <p className="mt-1 font-display text-lg italic text-text">{formatTRY(journalPrice)}</p>
              </div>
              <Link
                href={`?${(journalAdded ? addOnOffParams : addOnOnParams).toString()}`}
                className={`shrink-0 rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber ${
                  journalAdded ? "border-amber/60 bg-amber/15 text-amber" : "border-text/20 text-subtle hover:border-amber/50 hover:text-amber"
                }`}
              >
                {journalAdded ? "✓ Eklendi" : "+ Ekle"}
              </Link>
            </AtlasPanel>
          )}

          {grandTotal > 0 && (journalAdded || basePrice !== undefined) && (
            <div className="mt-6 flex w-full items-baseline justify-between px-1">
              <span className="font-mono text-xs uppercase tracking-widest text-subtle">Toplam</span>
              <span className="font-display text-3xl italic text-amber">{formatTRY(grandTotal)}</span>
            </div>
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
            href={toSearchParams(searchParams).toString() ? `/create?${toSearchParams(searchParams).toString()}` : "/create"}
            className="mt-8 font-mono text-xs uppercase tracking-widest text-amber underline-offset-4 transition-colors hover:text-bright hover:underline"
          >
            ← Konfigüratöre dön
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
