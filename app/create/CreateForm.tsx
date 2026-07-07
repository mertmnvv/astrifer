"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StarChart } from "@/components/astrolab/StarChart";
import { computeSky } from "@/lib/astronomy/computeSky";
import { PlaceCombobox } from "@/components/ui/PlaceCombobox";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { PhotoPicker, type PickedPhoto } from "@/components/ui/PhotoPicker";
import { VoiceRecorder, type VoiceRecorderValue } from "@/components/ui/VoiceRecorder";
import type { PlaceResult } from "@/lib/geocode/cities";
import { zonedTimeToUtc } from "@/lib/geocode/timezone";
import type { TemplateOption } from "@/lib/templates";

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function defaultDateTime(): { date: string; time: string } {
  const now = new Date();
  return {
    date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
  };
}

export interface CreateFormProps {
  templates: TemplateOption[];
}

export function CreateForm({ templates }: CreateFormProps) {
  const router = useRouter();
  const initial = defaultDateTime();

  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [place, setPlace] = useState<PlaceResult | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [templateSlug, setTemplateSlug] = useState(templates[0]?.slug ?? "");
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [voiceNote, setVoiceNote] = useState<VoiceRecorderValue | null>(null);
  const [touchedSubmit, setTouchedSubmit] = useState(false);

  useEffect(() => {
    if (message.trim().length > 0) return;
    const template = templates.find((item) => item.slug === templateSlug);
    if (template?.defaultMessage) setMessage(template.defaultMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateSlug]);

  const eventDateUtc = useMemo(() => {
    if (!place || !date || !time) return null;
    try {
      return zonedTimeToUtc(`${date}T${time}`, place.timezone);
    } catch {
      return null;
    }
  }, [place, date, time]);

  const sky = useMemo(() => {
    if (!eventDateUtc || !place) return null;
    return computeSky({ date: eventDateUtc, latitude: place.latitude, longitude: place.longitude });
  }, [eventDateUtc, place]);

  const previewLabel = place
    ? `${place.name} üzerinde ${date} ${time} anının gökyüzü`
    : "Konum seçilince gökyüzü önizlemesi burada görünecek";

  const isValid = Boolean(place && date && time && title.trim() && templateSlug);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouchedSubmit(true);
    if (!isValid || !place || !eventDateUtc) return;

    const params = new URLSearchParams({
      title,
      message,
      template: templateSlug,
      location: place.name,
      lat: place.latitude.toString(),
      lon: place.longitude.toString(),
      date: eventDateUtc.toISOString(),
    });
    if (photos.length > 0) params.set("photos", photos.length.toString());
    if (voiceNote) params.set("voice", "1");
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[minmax(0,26rem)_1fr]" noValidate>
      <div className="order-2 flex flex-col gap-6 lg:order-1">
        <fieldset className="grid grid-cols-2 gap-4">
          <legend className="sr-only">Tarih ve saat</legend>
          <div>
            <label htmlFor="event-date" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-haze">
              Tarih
            </label>
            <input
              id="event-date"
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-md border border-brass-dim/60 bg-panel-navy px-3 py-2.5 text-sm text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
            />
          </div>
          <div>
            <label htmlFor="event-time" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-haze">
              Saat
            </label>
            <input
              id="event-time"
              type="time"
              required
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="w-full rounded-md border border-brass-dim/60 bg-panel-navy px-3 py-2.5 text-sm text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
            />
          </div>
        </fieldset>

        <PlaceCombobox label="Konum" value={place} onChange={setPlace} required />

        <div>
          <label htmlFor="title" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-haze">
            İsim / Başlık
          </label>
          <input
            id="title"
            type="text"
            required
            maxLength={80}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="ör. Ayşe & Mehmet"
            className="w-full rounded-md border border-brass-dim/60 bg-panel-navy px-3 py-2.5 text-sm text-text placeholder:text-haze/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
          />
        </div>

        <div>
          <label htmlFor="message" className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-haze">
            Mesaj
          </label>
          <textarea
            id="message"
            rows={3}
            maxLength={240}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="w-full resize-none rounded-md border border-brass-dim/60 bg-panel-navy px-3 py-2.5 text-sm text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
          />
        </div>

        <div>
          <p className="mb-1.5 font-mono text-xs uppercase tracking-widest text-haze">
            Fotoğraflar (opsiyonel)
          </p>
          <PhotoPicker photos={photos} onChange={setPhotos} />
        </div>

        <div>
          <p className="mb-1.5 font-mono text-xs uppercase tracking-widest text-haze">
            Sesli Mesaj (opsiyonel)
          </p>
          <VoiceRecorder value={voiceNote} onChange={setVoiceNote} />
        </div>

        <div>
          <p className="mb-1.5 font-mono text-xs uppercase tracking-widest text-haze">Şablon</p>
          <RadioCardGroup
            name="template"
            ariaLabel="Şablon"
            value={templateSlug}
            onChange={setTemplateSlug}
            options={templates.map((template) => ({
              value: template.slug,
              label: template.name,
              description: template.description,
            }))}
          />
        </div>

        {touchedSubmit && !isValid && (
          <p role="alert" className="text-sm text-red-300">
            Devam etmek için tarih, saat, konum ve isim alanlarını doldurun.
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-full bg-brass px-6 py-3 font-mono text-xs uppercase tracking-widest text-void transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text disabled:opacity-40"
        >
          Devam Et
        </button>
      </div>

      <div className="order-1 flex flex-col items-center gap-3 lg:order-2 lg:sticky lg:top-10 lg:self-start">
        <div className="aspect-square w-full max-w-[32rem]">
          <StarChart sky={sky} label={previewLabel} className="h-full w-full" />
        </div>
        <p className="max-w-sm text-center text-xs text-haze">{previewLabel}</p>
      </div>
    </form>
  );
}
