import { CreateForm } from "./CreateForm";
import type { TemplateOption } from "@/lib/templates";
import type { PricingConfig } from "@/lib/pricingConfig";

export interface CreateFormV2Props {
  templates: TemplateOption[];
  pricing: PricingConfig;
}

const PROMISES = [
  ["01", "An", "Tarih, saat ve konum"],
  ["02", "Hikâye", "İsimler ve kişisel mesaj"],
  ["03", "Görünüm", "Gökyüzü rengi ve harita"],
  ["04", "Anılar", "Fotoğraf, ses, video ve müzik"],
  ["05", "Ürün", "Dijital sayfa veya Deri Defter"],
];

/**
 * V2 presentation shell. The proven form/state and slug payload remain in
 * CreateForm while the new experience is developed independently. This
 * creates a safe seam for replacing backend actions in the final phase.
 */
export function CreateFormV2({ templates, pricing }: CreateFormV2Props) {
  return (
    <div className="create-v2 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
      <aside className="archive-frame p-5 lg:sticky lg:top-24">
        <p className="archive-kicker text-[#5eead4]">3D önizleme ücretsiz</p>
        <h2 className="mt-4 font-display text-4xl font-semibold leading-[0.95] text-white">Beş kısa adımda kendi geceniz.</h2>
        <p className="mt-4 text-sm leading-7 text-[#9fb4ca]">Ödeme yapmadan önce yıldızları döndürebileceğiniz gerçek sayfanızı ve defter temasını göreceksiniz.</p>
        <ol className="mt-7 border-t border-[#9dd2ff]/10">
          {PROMISES.map(([n, title, detail]) => (
            <li key={n} className="grid grid-cols-[32px_1fr] gap-3 border-b border-[#9dd2ff]/10 py-3.5">
              <span className="font-mono text-[10px] text-[#5eead4]">{n}</span>
              <span><strong className="block text-sm font-medium text-[#edf7ff]">{title}</strong><small className="text-xs text-[#7890a8]">{detail}</small></span>
            </li>
          ))}
        </ol>
        <div className="mt-6 border border-[#5eead4]/20 bg-[#5eead4]/5 p-4">
          <p className="archive-kicker text-[#5eead4]">Sizden alınan</p>
          <p className="mt-2 text-xs leading-5 text-[#9fb4ca]">An bilgileri ve eklemek istediğiniz içerikler.</p>
          <p className="mt-4 archive-kicker text-[#9a8cf0]">Size teslim edilen</p>
          <p className="mt-2 text-xs leading-5 text-[#9fb4ca]">3D kişisel bağlantı; seçerseniz baskıya hazır fiziksel defter.</p>
        </div>
      </aside>
      <div className="min-w-0 archive-frame p-3 sm:p-6">
        <CreateForm templates={templates} pricing={pricing} />
      </div>
    </div>
  );
}
