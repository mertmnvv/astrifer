import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import { getPricingConfig } from "@/lib/pricingConfig";
import { savePricingAction } from "./actions";

export const dynamic = "force-dynamic";

const FIELD_CLASS = "w-full rounded-md border border-text/[0.14] bg-text/[0.04] px-3 py-2 text-sm text-text";
const FIELD_LABEL_CLASS = "block font-mono text-[10px] uppercase tracking-widest text-dim";

export default async function AdminPricingPage() {
  if (!isFirebaseConfigured()) {
    return (
      <p className="text-sm text-subtle">
        Firebase yapılandırılmamış — fiyatları düzenlemek için <code>.env.local</code> içindeki Admin SDK
        değişkenlerini doldur.
      </p>
    );
  }

  const { journalPrice, digitalPrice } = await getPricingConfig();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl italic text-bright">Fiyatlar</h1>
      <p className="text-sm text-subtle">
        Buradaki değerler kaydedildiği anda /urun/defter ve /checkout sayfalarına yansır.
      </p>

      <form action={savePricingAction} className="space-y-8">
        <div className="space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-amber">Diğer ürünler</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="journalPrice" className={FIELD_LABEL_CLASS}>
                Deri Defter (₺)
              </label>
              <input
                id="journalPrice"
                name="journalPrice"
                type="number"
                min={0}
                step={1}
                required
                defaultValue={journalPrice}
                className={FIELD_CLASS}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="digitalPrice" className={FIELD_LABEL_CLASS}>
                Dijital Sayfa (₺)
              </label>
              <input
                id="digitalPrice"
                name="digitalPrice"
                type="number"
                min={0}
                step={1}
                required
                defaultValue={digitalPrice}
                className={FIELD_CLASS}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-fit rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink transition-opacity hover:opacity-90"
        >
          Kaydet
        </button>
      </form>
    </div>
  );
}
