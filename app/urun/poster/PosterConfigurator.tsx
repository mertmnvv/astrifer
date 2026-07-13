"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PosterArt } from "@/components/astrolab/PosterArt";
import { PosterTextBand } from "@/components/astrolab/PosterTextBand";
import type { NebulaMood } from "@/components/astrolab/nebulaMood";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { FrameMockup } from "@/components/ui/FrameMockup";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import { DEFAULT_FRAME_OPTION, formatTRY, type FrameOption, type PosterSize } from "@/lib/pricing";

const MOOD_OPTIONS: { value: NebulaMood; label: string }[] = [
  { value: "warm", label: "Sıcak" },
  { value: "cool", label: "Soğuk" },
  { value: "neutral", label: "Nötr" },
];

const MESSAGE_MAX_LENGTH = 240;

export interface PosterConfiguratorProps {
  sky: ComputeSkyResult;
  headline: string;
  names: string;
  dateTimeLabel: string;
  coordsLabel: string;
  defaultMessage: string;
  photoUrl: string | null;
  qrUrl: string;
  posterSizes: { value: PosterSize; label: string; basePrice: number }[];
  frameOptions: { value: FrameOption; label: string; description: string; surcharge: number }[];
}

export function PosterConfigurator({
  sky,
  headline,
  names,
  dateTimeLabel,
  coordsLabel,
  defaultMessage,
  photoUrl,
  qrUrl,
  posterSizes,
  frameOptions,
}: PosterConfiguratorProps) {
  const router = useRouter();
  const [size, setSize] = useState<PosterSize>("50x50");
  const [frame, setFrame] = useState<FrameOption>(DEFAULT_FRAME_OPTION);
  const [mood, setMood] = useState<NebulaMood>("warm");
  const [message, setMessage] = useState(defaultMessage);

  const price = useMemo(() => {
    const sizePrice = posterSizes.find((option) => option.value === size)?.basePrice ?? 0;
    const frameSurcharge = frameOptions.find((option) => option.value === frame)?.surcharge ?? 0;
    return sizePrice + frameSurcharge;
  }, [size, frame, posterSizes, frameOptions]);
  const sizeLabel = posterSizes.find((option) => option.value === size)?.label ?? size;
  const frameLabel = frameOptions.find((option) => option.value === frame)?.label ?? frame;

  const handleOrder = () => {
    const params = new URLSearchParams({
      product: frame === "frameless" ? "poster" : "framed_poster",
      size,
      frame,
      mood,
      message,
      price: price.toString(),
    });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,23rem)]">
      <div className="order-1 flex flex-col items-center gap-4">
        <div className="w-full max-w-lg">
          <FrameMockup frame={frame} className="w-full">
            <div className="flex aspect-square w-full flex-col overflow-hidden">
              <PosterArt
                sky={sky}
                palette={getSkyPalette("gece-laciverti")}
                mood={mood}
                photoUrl={photoUrl}
                qrUrl={qrUrl}
                className="flex-[0_0_84%]"
              />
              <PosterTextBand
                headline={headline}
                personalMessage={message}
                names={names}
                dateTimeLabel={dateTimeLabel}
                coordsLabel={coordsLabel}
                className="flex-[0_0_16%]"
              />
            </div>
          </FrameMockup>
        </div>
        <p className="text-center text-xs text-subtle">
          {sizeLabel} · {frameLabel} — örnek gökyüzü ile önizleme
        </p>

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {frameOptions.map((option) => (
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
                <div className="h-full w-full bg-[#0d1024]" />
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
            options={posterSizes.map((option) => ({ value: option.value, label: option.label }))}
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
            options={frameOptions.map((option) => ({
              value: option.value,
              label: option.label,
              description: option.description,
            }))}
          />
        </div>

        <div>
          <p className="mb-1.5 font-mono text-xs uppercase tracking-widest text-dim">Renk Ruhu</p>
          <RadioCardGroup
            name="mood"
            ariaLabel="Nebula renk ruhu"
            value={mood}
            onChange={setMood}
            columnsClassName="grid-cols-3"
            options={MOOD_OPTIONS}
          />
        </div>

        <div>
          <label htmlFor="poster-message" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-dim">
            Kişisel Mesaj
          </label>
          <textarea
            id="poster-message"
            rows={3}
            maxLength={MESSAGE_MAX_LENGTH}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="w-full resize-none rounded-[10px] border border-text/[0.14] bg-text/[0.04] px-3 py-2.5 font-display text-sm italic text-text placeholder:text-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
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
