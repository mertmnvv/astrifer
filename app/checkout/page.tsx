import Link from "next/link";
import { CoverPanel } from "@/components/journal/CoverPanel";
import { DIGITAL_PRICE, JOURNAL_PRICE, formatTRY } from "@/lib/pricing";

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
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-brass">Checkout</p>
      <h1 className="max-w-lg font-display text-3xl italic text-text sm:text-4xl">
        Ödeme akışı henüz bağlanmadı.
      </h1>
      <p className="max-w-md text-sm text-haze">
        Konfigüratörden gelen bilgiler doğru şekilde taşındı — iyzico entegrasyonu
        ayrı bir görevde eklenecek.
      </p>
      {hasSummary && (
        <dl className="w-full max-w-sm space-y-2 rounded-lg border border-brass-dim/40 bg-panel-navy p-5 text-left text-sm">
          {title && (
            <div className="flex justify-between gap-4">
              <dt className="text-haze">İsim / Başlık</dt>
              <dd className="text-text">{title}</dd>
            </div>
          )}
          {template && (
            <div className="flex justify-between gap-4">
              <dt className="text-haze">Şablon</dt>
              <dd className="text-text">{template}</dd>
            </div>
          )}
          {location && (
            <div className="flex justify-between gap-4">
              <dt className="text-haze">Konum</dt>
              <dd className="text-text">{location}</dd>
            </div>
          )}
          {date && (
            <div className="flex justify-between gap-4">
              <dt className="text-haze">Tarih (UTC)</dt>
              <dd className="text-text">{date}</dd>
            </div>
          )}
          {effectiveProduct && (
            <div className="flex justify-between gap-4">
              <dt className="text-haze">Ürün</dt>
              <dd className="text-text">{productLabel[effectiveProduct] ?? effectiveProduct}</dd>
            </div>
          )}
          {size && (
            <div className="flex justify-between gap-4">
              <dt className="text-haze">Boyut</dt>
              <dd className="text-text">{size}</dd>
            </div>
          )}
          {frame && frame !== "none" && (
            <div className="flex justify-between gap-4">
              <dt className="text-haze">Çerçeve</dt>
              <dd className="text-text">{frame}</dd>
            </div>
          )}
          {basePrice !== undefined && !Number.isNaN(basePrice) && (
            <div className="flex justify-between gap-4">
              <dt className="text-haze">Tutar</dt>
              <dd className="text-text">{formatTRY(basePrice)}</dd>
            </div>
          )}
          {photoUrls.length > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-haze">Fotoğraflar</dt>
              <dd className="text-text">{photoUrls.length} adet yüklendi</dd>
            </div>
          )}
          {voiceUrl && (
            <div className="flex justify-between gap-4">
              <dt className="text-haze">Sesli mesaj</dt>
              <dd className="text-text">Eklendi</dd>
            </div>
          )}
          {message && (
            <div>
              <dt className="text-haze">Mesaj</dt>
              <dd className="mt-1 text-text">{message}</dd>
            </div>
          )}
        </dl>
      )}

      {showJournalUpsell && (
        <div className="flex w-full max-w-sm items-center gap-4 rounded-lg border border-brass-dim/40 bg-panel-navy p-4 text-left">
          <div className="w-16 shrink-0">
            <CoverPanel compact />
          </div>
          <div className="flex-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-brass">Ekstra: Deri Defter</p>
            <p className="mt-0.5 text-xs text-haze">Kapağında haritan, içinde 30 boş sayfa.</p>
            <p className="mt-1 font-display text-lg italic text-text">{formatTRY(JOURNAL_PRICE)}</p>
          </div>
          <Link
            href={`?${(journalAdded ? addOnOffParams : addOnOnParams).toString()}`}
            className={`shrink-0 rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass ${
              journalAdded
                ? "border-brass bg-brass-dim/20 text-brass"
                : "border-brass-dim text-haze hover:border-brass hover:text-brass"
            }`}
          >
            {journalAdded ? "✓ Eklendi" : "+ Ekle"}
          </Link>
        </div>
      )}

      {grandTotal > 0 && (journalAdded || basePrice !== undefined) && (
        <p className="font-mono text-xs uppercase tracking-widest text-haze">
          Toplam: <span className="text-brass">{formatTRY(grandTotal)}</span>
        </p>
      )}

      <Link
        href="/create"
        className="rounded-full border border-brass-dim px-6 py-3 font-mono text-xs uppercase tracking-widest text-brass transition-colors hover:bg-brass hover:text-void focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
      >
        Konfigüratöre dön
      </Link>
    </main>
  );
}
