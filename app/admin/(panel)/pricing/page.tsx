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

  const { journalPrice, journalOriginalPrice, digitalPrice, digitalOriginalPrice } = await getPricingConfig();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl italic text-bright">Fiyatlar</h1>
      <p className="text-sm text-subtle">
        Buradaki değerler kaydedildiği anda tüm site genelinde dinamik olarak yansır.
      </p>

      <form action={savePricingAction} className="space-y-8">
        <div className="space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-amber">Deri Defter Fiyatlandırması</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="journalOriginalPrice" className={FIELD_LABEL_CLASS}>
                Gerçek Fiyat (₺) - Üstü Çizilecek Olan
              </label>
              <input
                id="journalOriginalPrice"
                name="journalOriginalPrice"
                type="number"
                min={0}
                step={1}
                required
                defaultValue={journalOriginalPrice}
                className={FIELD_CLASS}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="journalPrice" className={FIELD_LABEL_CLASS}>
                İndirimli Fiyat (₺) - Satış Fiyatı
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
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-mono text-xs uppercase tracking-widest text-amber">Dijital Sayfa Fiyatlandırması</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="digitalOriginalPrice" className={FIELD_LABEL_CLASS}>
                Gerçek Fiyat (₺) - Üstü Çizilecek Olan
              </label>
              <input
                id="digitalOriginalPrice"
                name="digitalOriginalPrice"
                type="number"
                min={0}
                step={1}
                required
                defaultValue={digitalOriginalPrice}
                className={FIELD_CLASS}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="digitalPrice" className={FIELD_LABEL_CLASS}>
                İndirimli Fiyat (₺) - Satış Fiyatı
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
