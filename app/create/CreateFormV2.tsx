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
        <p className="archive-kicker text-[#c79a52]">Önizleme ücretsiz</p>
        <h2 className="mt-3 font-display text-3xl leading-tight text-white">Beş kısa adımda kişisel arşiviniz.</h2>
        <p className="mt-3 text-sm leading-6 text-[#aeb5ba]">Ödeme yapmadan önce dijital sayfanızı ve defter temasını göreceksiniz.</p>
        <ol className="mt-6 border-t border-white/10">
          {PROMISES.map(([n, title, detail]) => (
            <li key={n} className="grid grid-cols-[32px_1fr] gap-3 border-b border-white/10 py-3">
              <span className="font-mono text-[10px] text-[#c79a52]">{n}</span>
              <span><strong className="block text-sm font-medium text-[#f2eee4]">{title}</strong><small className="text-xs text-[#7f8990]">{detail}</small></span>
            </li>
          ))}
        </ol>
        <div className="mt-5 border border-[#c79a52]/30 bg-[#c79a52]/5 p-4">
          <p className="archive-kicker text-[#c79a52]">Sizden alınan</p>
          <p className="mt-2 text-xs leading-5 text-[#aeb5ba]">An bilgileri ve eklemek istediğiniz içerikler.</p>
          <p className="mt-4 archive-kicker text-[#c79a52]">Size teslim edilen</p>
          <p className="mt-2 text-xs leading-5 text-[#aeb5ba]">Kalıcı kişisel bağlantı; seçerseniz baskıya hazır fiziksel defter.</p>
        </div>
      </aside>
      <div className="min-w-0 archive-frame p-3 sm:p-6">
        <CreateForm templates={templates} pricing={pricing} />
      </div>
    </div>
  );
}
