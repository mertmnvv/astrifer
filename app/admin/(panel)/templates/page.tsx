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
};

const CATEGORY_OPTIONS = Object.keys(CATEGORY_LABELS) as TemplateCategory[];

async function getTemplates(): Promise<TemplateDoc[]> {
  const { getDb } = await import("@/lib/firebase/admin");
  const snapshot = await getDb().collection("templates").orderBy("sortOrder", "asc").get();
  return snapshot.docs.map((doc) => doc.data() as TemplateDoc);
}

export default async function AdminTemplatesPage() {
  if (!isFirebaseConfigured()) {
    return (
      <p className="text-sm text-haze">
        Firebase yapılandırılmamış — şablonları görmek için <code>.env.local</code> içindeki Admin SDK
        değişkenlerini doldur.
      </p>
    );
  }

  const templates = await getTemplates();

  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <h1 className="font-display text-2xl italic text-text">Şablonlar</h1>
        <div className="overflow-x-auto rounded-lg border border-brass-dim/40">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-panel-navy font-mono text-[10px] uppercase tracking-widest text-haze">
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
                <tr key={template.slug} className="border-t border-brass-dim/20">
                  <td className="px-4 py-3 align-top font-mono text-xs text-haze">{template.slug}</td>
                  <td className="px-4 py-3 align-top text-text">{template.name}</td>
                  <td className="px-4 py-3 align-top text-text">{CATEGORY_LABELS[template.category]}</td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${
                        template.isActive ? "bg-brass/20 text-brass" : "bg-haze/10 text-haze"
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
                        className="rounded-full border border-brass-dim px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-brass transition-colors hover:bg-brass hover:text-void"
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
        <h2 className="font-display text-xl italic text-text">Yeni şablon</h2>
        <form
          action={createTemplateAction}
          className="grid max-w-xl gap-4 rounded-lg border border-brass-dim/40 bg-panel-navy p-6 sm:grid-cols-2"
        >
          <div className="space-y-1.5">
            <label htmlFor="slug" className="block font-mono text-[10px] uppercase tracking-widest text-haze">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              required
              pattern="[a-z0-9-]+"
              title="Sadece küçük harf, rakam ve tire"
              className="w-full rounded-md border border-brass-dim/40 bg-void px-3 py-2 text-sm text-text"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="name" className="block font-mono text-[10px] uppercase tracking-widest text-haze">
              Ad
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-md border border-brass-dim/40 bg-void px-3 py-2 text-sm text-text"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="category" className="block font-mono text-[10px] uppercase tracking-widest text-haze">
              Kategori
            </label>
            <select
              id="category"
              name="category"
              required
              className="w-full rounded-md border border-brass-dim/40 bg-void px-3 py-2 text-sm text-text"
            >
              {CATEGORY_OPTIONS.map((category) => (
                <option key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label
              htmlFor="description"
              className="block font-mono text-[10px] uppercase tracking-widest text-haze"
            >
              Açıklama
            </label>
            <input
              id="description"
              name="description"
              className="w-full rounded-md border border-brass-dim/40 bg-void px-3 py-2 text-sm text-text"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label
              htmlFor="defaultMessage"
              className="block font-mono text-[10px] uppercase tracking-widest text-haze"
            >
              Varsayılan mesaj
            </label>
            <input
              id="defaultMessage"
              name="defaultMessage"
              className="w-full rounded-md border border-brass-dim/40 bg-void px-3 py-2 text-sm text-text"
            />
          </div>
          <button
            type="submit"
            className="w-fit rounded-full border border-brass bg-brass px-4 py-2 font-mono text-xs uppercase tracking-widest text-void transition-colors hover:bg-brass-dim sm:col-span-2"
          >
            Şablon ekle
          </button>
        </form>
      </div>
    </div>
  );
}
