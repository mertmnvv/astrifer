import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import type { TemplateCategory, TemplateDoc } from "@/types/firestore";
import { createTemplateAction, toggleTemplateActiveAction } from "./actions";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  dogum: "Doğum",
  yildonumu: "Yıldönümü",
  teklif: "Evlilik Teklifi",
  mezuniyet: "Mezuniyet",
  anma: "Anma",
  dugun: "Düğün",
};

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS) as TemplateCategory[];
const FIELD_CLASS = "w-full rounded-md border border-text/[0.14] bg-text/[0.04] px-3 py-2 text-sm text-text";
const FIELD_LABEL_CLASS = "block font-mono text-[10px] uppercase tracking-widest text-dim";

async function getTemplates(): Promise<TemplateDoc[]> {
  const { getDb } = await import("@/lib/firebase/admin");
  const snapshot = await getDb().collection("templates").orderBy("sortOrder", "asc").get();
  return snapshot.docs.map((doc) => doc.data() as TemplateDoc);
}

export default async function AdminTemplatesPage() {
  if (!isFirebaseConfigured()) {
    return (
      <p className="text-sm text-subtle">
        Firebase yapılandırılmamış — şablonları görmek için <code>.env.local</code> içindeki Admin SDK
        değişkenlerini doldur.
      </p>
    );
  }

  const templates = await getTemplates();

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h1 className="font-display text-2xl italic text-bright">Şablonlar</h1>
        <div className="overflow-x-auto rounded-2xl border border-text/10">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-panel font-mono text-[10px] uppercase tracking-widest text-dim">
              <tr>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Ad</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.slug} className="border-t border-text/10">
                  <td className="px-4 py-3 align-top font-mono text-xs text-subtle">{template.slug}</td>
                  <td className="px-4 py-3 align-top text-text">{template.name}</td>
                  <td className="px-4 py-3 align-top text-text">{CATEGORY_LABELS[template.category]}</td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                        template.isActive ? "bg-amber/20 text-amber" : "bg-text/10 text-subtle"
                      }`}
                    >
                      {template.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <form action={toggleTemplateActiveAction}>
                      <input type="hidden" name="slug" value={template.slug} />
                      <input type="hidden" name="isActive" value={String(template.isActive)} />
                      <button
                        type="submit"
                        className="rounded-full border border-amber/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-amber transition-colors hover:bg-amber hover:text-ink"
                      >
                        {template.isActive ? "Pasifleştir" : "Aktifleştir"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-display text-xl italic text-bright">Yeni şablon</h2>
        <form
          action={createTemplateAction}
          className="grid max-w-xl gap-4 rounded-2xl border border-text/10 bg-text/[0.035] p-6 sm:grid-cols-2"
        >
          <div className="space-y-1.5">
            <label htmlFor="slug" className={FIELD_LABEL_CLASS}>
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              required
              pattern="[a-z0-9-]+"
              title="Sadece küçük harf, rakam ve tire"
              className={FIELD_CLASS}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="name" className={FIELD_LABEL_CLASS}>
              Ad
            </label>
            <input id="name" name="name" required className={FIELD_CLASS} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="category" className={FIELD_LABEL_CLASS}>
              Kategori
            </label>
            <select id="category" name="category" required className={FIELD_CLASS}>
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category} className="bg-panel text-text">
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="description" className={FIELD_LABEL_CLASS}>
              Açıklama
            </label>
            <input id="description" name="description" className={FIELD_CLASS} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="exampleMessage1" className={FIELD_LABEL_CLASS}>
              Örnek Mesaj 1
            </label>
            <input id="exampleMessage1" name="exampleMessage1" className={FIELD_CLASS} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="exampleMessage2" className={FIELD_LABEL_CLASS}>
              Örnek Mesaj 2
            </label>
            <input id="exampleMessage2" name="exampleMessage2" className={FIELD_CLASS} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="exampleMessage3" className={FIELD_LABEL_CLASS}>
              Örnek Mesaj 3
            </label>
            <input id="exampleMessage3" name="exampleMessage3" className={FIELD_CLASS} />
          </div>
          <button
            type="submit"
            className="w-fit rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink transition-opacity hover:opacity-90 sm:col-span-2"
          >
            Şablon ekle
          </button>
        </form>
      </div>
    </div>
  );
}
