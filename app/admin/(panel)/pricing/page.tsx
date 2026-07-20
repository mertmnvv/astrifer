import { Card, FIELD_CLASS, FIELD_LABEL_CLASS, PageHeader } from "@/components/admin/ui";
import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import { getPricingConfig } from "@/lib/pricingConfig";
import { savePricingAction } from "./actions";

export const dynamic = "force-dynamic";

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
      <PageHeader
        title="Fiyatlar"
        description="Buradaki değerler kaydedildiği anda tüm site genelinde dinamik olarak yansır."
      />

      <form action={savePricingAction} className="space-y-6">
        <Card title="Deri Defter Fiyatlandırması">
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
        </Card>

        <Card title="Dijital Sayfa Fiyatlandırması">
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
        </Card>

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
