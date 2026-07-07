import Link from "next/link";
import { formatTRY } from "@/lib/pricing";

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
  const price = priceParam ? Number(priceParam) : undefined;

  const hasSummary = Boolean(title || product);

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
          {product && (
            <div className="flex justify-between gap-4">
              <dt className="text-haze">Ürün</dt>
              <dd className="text-text">{product === "framed_poster" ? "Çerçeveli Poster" : "Poster"}</dd>
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
          {price !== undefined && !Number.isNaN(price) && (
            <div className="flex justify-between gap-4">
              <dt className="text-haze">Tutar</dt>
              <dd className="text-text">{formatTRY(price)}</dd>
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
      <Link
        href="/create"
        className="rounded-full border border-brass-dim px-6 py-3 font-mono text-xs uppercase tracking-widest text-brass transition-colors hover:bg-brass hover:text-void focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
      >
        Konfigüratöre dön
      </Link>
    </main>
  );
}
