"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { NightCoverPage } from "@/components/journal/night/NightCoverPage";
import { BackCoverPage } from "@/components/journal/night/BackCoverPage";
import { addToCart } from "@/lib/cart";
import { formatTRY } from "@/lib/pricing";

const LETTER_MAX_LENGTH = 2000;

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export interface JournalConfiguratorProps {
  names: string;
  journalPrice: number;
  slug: string;
}

export function JournalConfigurator({ names, journalPrice, slug }: JournalConfiguratorProps) {
  const router = useRouter();
  const [letterText, setLetterText] = useState(
    "Bu satırları okuduğunuzda aradan yıllar geçmiş olacak. O geceki hissi hiç unutmayın...",
  );
  const [openingDate, setOpeningDate] = useState("");
  const minDate = useMemo(() => tomorrowIso(), []);

  const handleAddToCart = () => {
    addToCart({
      productType: "journal",
      productLabel: "Deri Defter",
      title: names,
      price: journalPrice,
      summary: openingDate ? [`Gelecek Mektubu açılış: ${openingDate}`] : [],
      slug,
    });
    router.push("/sepet");
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_1fr]">
      <div className="order-1 flex flex-col items-center gap-4">
        <div className="w-full max-w-xs">
          <NightCoverPage names={names} />
        </div>
        <p className="text-center text-xs text-subtle">Kapak önizlemesi</p>
        <div className="w-full max-w-[10rem]">
          <BackCoverPage />
        </div>
        <p className="text-center text-xs text-subtle">Arka kapak — Gelecek Mektubu cebi</p>
      </div>

      <div className="order-2 flex flex-col gap-6">
        <div>
          <label htmlFor="letter-text" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-dim">
            Gelecek Mektubu
          </label>
          <textarea
            id="letter-text"
            rows={5}
            maxLength={LETTER_MAX_LENGTH}
            value={letterText}
            onChange={(event) => setLetterText(event.target.value)}
            className="w-full resize-none rounded-[10px] border border-text/[0.14] bg-text/[0.04] px-3 py-2.5 font-display text-sm italic text-text placeholder:text-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          />
          <p className="mt-1 text-[11px] text-dim">
            Bu metin mühürlenip arka kapaktaki cebe yerleştirilen ayrı bir sayfaya basılır — kitabın kendisinde
            görünmez.
          </p>
        </div>

        <div>
          <label htmlFor="opening-date" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-dim">
            Açılış Tarihi
          </label>
          <input
            id="opening-date"
            type="date"
            min={minDate}
            value={openingDate}
            onChange={(event) => setOpeningDate(event.target.value)}
            className="w-full rounded-[10px] border border-text/[0.14] bg-text/[0.04] px-3 py-2.5 text-sm text-text [color-scheme:dark] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          />
        </div>

        <div className="rounded-2xl border border-text/10 bg-text/[0.035] p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-subtle">Fiyat</span>
            <span className="font-display text-3xl italic text-amber">{formatTRY(journalPrice)}</span>
          </div>
          <p className="mt-1 text-[11px] text-dim">Kargo dahil. Üretim süresi 5-7 iş günü. Altın renkli kalem hediyeli.</p>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-6 py-3 font-mono text-xs uppercase tracking-widest text-ink transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        >
          Sepete Ekle
        </button>
      </div>
    </div>
  );
}
