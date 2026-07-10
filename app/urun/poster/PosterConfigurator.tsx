"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StarChart } from "@/components/astrolab/StarChart";
import { FrameMockup } from "@/components/ui/FrameMockup";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import { FRAME_OPTIONS, POSTER_SIZES, formatTRY, priceFor, type FrameOption, type PosterSize } from "@/lib/pricing";

export interface PosterConfiguratorProps {
  sky: ComputeSkyResult;
  previewLabel: string;
}

export function PosterConfigurator({ sky, previewLabel }: PosterConfiguratorProps) {
  const router = useRouter();
  const [size, setSize] = useState<PosterSize>("50x50");
  const [frame, setFrame] = useState<FrameOption>("black");

  const price = useMemo(() => priceFor(size, frame), [size, frame]);
  const sizeLabel = POSTER_SIZES.find((option) => option.value === size)?.label ?? size;
  const frameLabel = FRAME_OPTIONS.find((option) => option.value === frame)?.label ?? frame;

  const handleOrder = () => {
    const params = new URLSearchParams({
      product: frame === "none" ? "poster" : "framed_poster",
      size,
      frame,
      price: price.toString(),
    });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,23rem)]">
      <div className="order-1 flex flex-col items-center gap-4">
        <div className="w-full max-w-lg">
          <FrameMockup frame={frame} className="w-full">
            <div className="aspect-square w-full">
              <StarChart sky={sky} label={previewLabel} className="h-full w-full" />
            </div>
          </FrameMockup>
        </div>
        <p className="text-center text-xs text-subtle">
          {sizeLabel} · {frameLabel} — örnek gökyüzü ile önizleme
        </p>

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {FRAME_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFrame(option.value)}
              aria-pressed={frame === option.value}
              aria-label={`${option.label} çerçeveyi seç`}
              className={`h-14 w-14 overflow-hidden rounded-md transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber ${
                frame === option.value ? "ring-2 ring-amber" : "ring-1 ring-text/10"
              }`}
            >
              <FrameMockup frame={option.value} className="h-full w-full">
                <div className="h-full w-full" />
              </FrameMockup>
            </button>
          ))}
        </div>
      </div>

      <div className="order-2 flex flex-col gap-6">
        <div>
          <p className="mb-1.5 font-mono text-xs uppercase tracking-widest text-dim">Boyut</p>
          <RadioCardGroup
            name="size"
            ariaLabel="Poster boyutu"
            value={size}
            onChange={setSize}
            columnsClassName="grid-cols-2"
            options={POSTER_SIZES.map((option) => ({ value: option.value, label: option.label }))}
          />
        </div>

        <div>
          <p className="mb-1.5 font-mono text-xs uppercase tracking-widest text-dim">Çerçeve</p>
          <RadioCardGroup
            name="frame"
            ariaLabel="Çerçeve seçeneği"
            value={frame}
            onChange={setFrame}
            columnsClassName="grid-cols-2"
            options={FRAME_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
              description: option.description,
            }))}
          />
        </div>

        <div className="rounded-2xl border border-text/10 bg-text/[0.035] p-4">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-subtle">Toplam</span>
            <span className="font-display text-3xl italic text-amber">{formatTRY(price)}</span>
          </div>
          <p className="mt-1 text-[11px] text-dim">
            300 DPI baskı, kargo dahil. Üretim süresi 3-5 iş günü.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOrder}
          className="w-full rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-6 py-3 font-mono text-xs uppercase tracking-widest text-ink transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        >
          Sipariş Ver
        </button>
      </div>
    </div>
  );
}
