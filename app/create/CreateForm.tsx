"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { StarChart } from "@/components/astrolab/StarChart";
import { LedgerRule } from "@/components/atlas/LedgerRule";
import { computeSky } from "@/lib/astronomy/computeSky";
import { PlaceCombobox } from "@/components/ui/PlaceCombobox";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { PhotoPicker, type PickedPhoto } from "@/components/ui/PhotoPicker";
import { VoiceRecorder, type VoiceRecorderValue } from "@/components/ui/VoiceRecorder";
import { SkyPaletteSwatchPicker } from "@/components/ui/SkyPaletteSwatchPicker";
import { SKY_PALETTES, DEFAULT_SKY_PALETTE, getSkyPalette } from "@/components/astrolab/palettes";
import { BUILTIN_PLACES, type PlaceResult } from "@/lib/geocode/cities";
import { zonedTimeToUtc, utcToZonedTime } from "@/lib/geocode/timezone";
import { addToCart } from "@/lib/cart";
import { setLastCreatedPage } from "@/lib/lastCreatedPage";
import { DIGITAL_PRICE, formatTRY } from "@/lib/pricing";
import { slugify } from "@/lib/slug";
import type { TemplateOption } from "@/lib/templates";
import { createStarMapAction } from "./actions";

const SITE_HOST = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://astrifer.com").replace(/^https?:\/\//, "");

const QUICK_CITY_NAMES = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Eskişehir",
  "Trabzon",
  "Paris",
  "Roma",
  "New York",
];
const QUICK_CITIES = QUICK_CITY_NAMES.map((name) => BUILTIN_PLACES.find((place) => place.name === name)).filter(
  (place): place is PlaceResult => Boolean(place),
);

const FIELD_CLASS =
  "w-full rounded-[10px] border border-text/[0.14] bg-text/[0.04] px-3 py-2.5 text-sm text-text placeholder:text-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber";
const FIELD_LABEL_CLASS = "mb-1.5 block font-mono text-[9.5px] uppercase tracking-[0.14em] text-dim";

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

function SectionLabel({ n, children }: { n: string; children: ReactNode }) {
  return (
    <p className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
      <span className="text-amber">{n}</span>
      &nbsp;&nbsp;{children}
    </p>
  );
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
  const [paletteId, setPaletteId] = useState(DEFAULT_SKY_PALETTE.id);
  const [touchedSubmit, setTouchedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Guards the template auto-fill effect below against clobbering a message
  // just restored by the "continue editing" hydration effect further down —
  // holds the templateSlug value we're waiting to settle on, then lets one
  // (suppressed) auto-fill cycle pass once state catches up to it.
  const pendingTemplateMessageSkip = useRef<string | null>(null);
  const didHydrateFromUrl = useRef(false);

  useEffect(() => {
    if (pendingTemplateMessageSkip.current !== null) {
      if (pendingTemplateMessageSkip.current !== templateSlug) return;
      pendingTemplateMessageSkip.current = null;
      return;
    }
    const template = templates.find((item) => item.slug === templateSlug);
    const firstExample = template?.exampleMessages[0];
    if (firstExample) setMessage(firstExample);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateSlug]);

  // "Düzenlemeye dön" from the digital-page preview (see StarMapView.tsx)
  // carries every field back as query params so editing continues from the
  // existing draft instead of starting a blank form. Reads window.location
  // directly (not useSearchParams()) so /create can stay statically
  // prerenderable; runs once, client-side only, after hydration.
  useEffect(() => {
    if (didHydrateFromUrl.current) return;
    didHydrateFromUrl.current = true;

    const params = new URLSearchParams(window.location.search);
    const restoredTitle = params.get("title");
    if (!restoredTitle) return;

    setTitle(restoredTitle);
    const restoredMessage = params.get("message");
    if (restoredMessage) setMessage(restoredMessage);

    const locationName = params.get("location");
    const lat = params.get("lat");
    const lon = params.get("lon");
    const timezone = params.get("timezone");
    if (locationName && lat && lon && timezone) {
      setPlace({ name: locationName, country: "", latitude: Number(lat), longitude: Number(lon), timezone });
      const dateIso = params.get("date");
      if (dateIso) {
        const zoned = utcToZonedTime(dateIso, timezone);
        if (zoned.date) setDate(zoned.date);
        if (zoned.time) setTime(zoned.time);
      }
    }

    const templateParam = params.get("template") ?? templateSlug;
    pendingTemplateMessageSkip.current = templateParam;
    if (templateParam !== templateSlug && templates.some((item) => item.slug === templateParam)) {
      setTemplateSlug(templateParam);
    }

    const paletteParam = params.get("palette");
    if (paletteParam) setPaletteId(paletteParam);

    const photosParam = params.get("photos");
    if (photosParam) {
      const urls = photosParam.split(",").filter(Boolean);
      setPhotos(
        urls.map((url, index) => ({
          id: `restored-${index}`,
          caption: "",
          previewUrl: url,
          status: "done" as const,
          url,
        })),
      );
    }

    const voiceParam = params.get("voice");
    if (voiceParam) setVoiceNote({ url: voiceParam, source: "upload", status: "done", remoteUrl: voiceParam });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentTemplateExamples = useMemo(
    () => templates.find((item) => item.slug === templateSlug)?.exampleMessages ?? [],
    [templates, templateSlug],
  );

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

  const posterDateLine = useMemo(() => {
    if (!place || !eventDateUtc) return "Tarih ve konum bekleniyor";
    try {
      const formatted = new Intl.DateTimeFormat("tr-TR", {
        timeZone: place.timezone,
        dateStyle: "long",
        timeStyle: "short",
      }).format(eventDateUtc);
      return `${formatted} · ${place.name}`;
    } catch {
      return `${date} · ${place.name}`;
    }
  }, [place, eventDateUtc, date]);

  const posterCoords = place
    ? `${Math.abs(place.latitude).toFixed(2)}°${place.latitude >= 0 ? "K" : "G"}   ${Math.abs(place.longitude).toFixed(2)}°${place.longitude >= 0 ? "D" : "B"}`
    : "";

  const previewSlug = slugify(title) || "senin-sayfan";
  const previewUrl = `${SITE_HOST}/s/${previewSlug}`;

  const requiredFieldsValid = Boolean(place && date && time && title.trim() && templateSlug);
  const uploadsPending = photos.some((photo) => photo.status === "uploading") || voiceNote?.status === "uploading";
  const uploadsFailed = photos.some((photo) => photo.status === "error") || voiceNote?.status === "error";
  const isValid = requiredFieldsValid && !uploadsPending && !uploadsFailed;

  const buildShareParams = (currentPlace: PlaceResult, currentEventDateUtc: Date) => {
    const params = new URLSearchParams({
      title,
      message,
      location: currentPlace.name,
      lat: currentPlace.latitude.toString(),
      lon: currentPlace.longitude.toString(),
      date: currentEventDateUtc.toISOString(),
    });
    const photoUrls = photos.filter((photo) => photo.status === "done" && photo.url).map((photo) => photo.url as string);
    if (photoUrls.length > 0) params.set("photos", photoUrls.join(","));
    if (voiceNote?.status === "done" && voiceNote.remoteUrl) params.set("voice", voiceNote.remoteUrl);
    params.set("palette", paletteId);
    return params;
  };

  const previewHref = useMemo(() => {
    if (!place || !eventDateUtc || !title.trim()) return null;
    const params = buildShareParams(place, eventDateUtc);
    params.set("timezone", place.timezone);
    params.set("slug", previewSlug);
    return `/create/onizleme?${params.toString()}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place, eventDateUtc, title, message, photos, voiceNote, paletteId, previewSlug]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouchedSubmit(true);
    if (!isValid || !place || !eventDateUtc) return;

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const photoUrls = photos
        .filter((photo) => photo.status === "done" && photo.url)
        .map((photo) => photo.url as string);

      const { slug, ownerToken } = await createStarMapAction({
        title,
        message,
        locationName: place.name,
        latitude: place.latitude,
        longitude: place.longitude,
        timezone: place.timezone,
        eventDateIso: eventDateUtc.toISOString(),
        templateSlug,
        paletteId,
        photoUrls,
        voiceNoteUrl: voiceNote?.status === "done" ? (voiceNote.remoteUrl ?? null) : null,
      });

      addToCart({
        productType: "digital",
        productLabel: "Dijital Sayfa",
        title,
        price: DIGITAL_PRICE,
        summary: [posterDateLine],
        slug,
      });
      setLastCreatedPage({ slug, title, locationName: place.name });

      const next = "/sepet";
      router.push(`/s/${slug}/claim?token=${encodeURIComponent(ownerToken)}&next=${encodeURIComponent(next)}`);
    } catch {
      setIsSubmitting(false);
      setSubmitError("Sayfa oluşturulamadı — lütfen tekrar deneyin.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[minmax(0,28rem)_1fr] lg:items-start" noValidate>
      {/* FORM */}
      <div className="order-2 flex flex-col gap-9 lg:order-1">
        <div>
          <SectionLabel n="01">Anı Seçin</SectionLabel>
          <RadioCardGroup
            name="template"
            ariaLabel="Şablon"
            align="left"
            columnsClassName="grid-cols-2 sm:grid-cols-3"
            value={templateSlug}
            onChange={setTemplateSlug}
            options={templates.map((template) => ({
              value: template.slug,
              label: template.name,
              description: template.description,
            }))}
          />
        </div>

        <div>
          <SectionLabel n="02">Zaman &amp; Konum</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="event-date" className={FIELD_LABEL_CLASS}>
                Tarih
              </label>
              <input
                id="event-date"
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className={`${FIELD_CLASS} [color-scheme:dark]`}
              />
            </div>
            <div>
              <label htmlFor="event-time" className={FIELD_LABEL_CLASS}>
                Saat
              </label>
              <input
                id="event-time"
                type="time"
                required
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className={`${FIELD_CLASS} [color-scheme:dark]`}
              />
            </div>
          </div>

          <div className="mt-3">
            <PlaceCombobox label="Konum" value={place} onChange={setPlace} required />
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {QUICK_CITIES.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => setPlace(city)}
                className="rounded-full border border-text/[0.14] px-3 py-1 text-xs text-muted transition-colors hover:border-amber/50 hover:text-amber"
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel n="03">Gökyüzü Rengi</SectionLabel>
          <SkyPaletteSwatchPicker name="palette" palettes={SKY_PALETTES} value={paletteId} onChange={setPaletteId} />
        </div>

        <div>
          <SectionLabel n="04">Kişiselleştir</SectionLabel>

          <p className="mb-2 text-xs text-dim">Fotoğraflar (en fazla 4)</p>
          <PhotoPicker photos={photos} onChange={setPhotos} />

          <p className="mb-2 mt-4 text-xs text-dim">Sesli mesaj (opsiyonel)</p>
          <VoiceRecorder value={voiceNote} onChange={setVoiceNote} />

          <div className="mt-4">
            <label htmlFor="title" className={FIELD_LABEL_CLASS}>
              Başlık
            </label>
            <input
              id="title"
              type="text"
              required
              maxLength={80}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="ör. Ayşe & Mehmet"
              className={FIELD_CLASS}
            />
          </div>

          <div className="mt-3">
            <label htmlFor="message" className={FIELD_LABEL_CLASS}>
              Kişisel Mesaj
            </label>
            <textarea
              id="message"
              rows={3}
              maxLength={240}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className={`${FIELD_CLASS} resize-none font-display italic`}
            />
            {currentTemplateExamples.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {currentTemplateExamples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setMessage(example)}
                    aria-pressed={message === example}
                    className={`max-w-full truncate rounded-full border px-3 py-1 text-left text-[11px] transition-colors ${
                      message === example
                        ? "border-amber/60 bg-amber/10 text-amber"
                        : "border-text/[0.14] text-muted hover:border-amber/40 hover:text-amber"
                    }`}
                    title={example}
                  >
                    {example}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {touchedSubmit && !requiredFieldsValid && (
          <p role="alert" className="text-sm text-red-300">
            Devam etmek için tarih, saat, konum ve isim alanlarını doldurun.
          </p>
        )}
        {touchedSubmit && requiredFieldsValid && uploadsFailed && (
          <p role="alert" className="text-sm text-red-300">
            Bazı yüklemeler başarısız oldu — devam etmeden önce kaldırın ya da tekrar deneyin.
          </p>
        )}
        {submitError && (
          <p role="alert" className="text-sm text-red-300">
            {submitError}
          </p>
        )}
      </div>

      {/* LIVE PREVIEW */}
      <div className="order-1 flex flex-col gap-4 lg:sticky lg:top-28 lg:order-2 lg:self-start">
        <div className="mx-auto w-full max-w-[27rem]">
          <div className="relative aspect-[3/4] rounded-md border border-text/[0.08] bg-panel shadow-2xl shadow-black/65">
            <div className="pointer-events-none absolute inset-[13px] rounded-sm border border-amber/[0.18]" />
            <div className="pointer-events-none absolute inset-4 rounded-sm border border-text/10" />
            <div className="relative flex h-full flex-col items-center justify-between px-[26px] pb-[22px] pt-[34px]">
              <div className="w-[72%] rounded-full border border-amber/[0.2] p-[7px]">
                <div className="aspect-square overflow-hidden rounded-full border border-amber/40">
                  <StarChart sky={sky} label={previewLabel} className="h-full w-full" palette={getSkyPalette(paletteId)} />
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 text-center">
                <LedgerRule className="max-w-[5rem]" />
                <p className="max-w-[32ch] font-display text-[17px] italic leading-relaxed text-text">
                  “{message.trim() || "Sen benim gökyüzümdeki en güzel yıldızımsın."}”
                </p>
                <h3 className="font-display text-2xl italic text-bright">{title.trim() || "İsim & İsim"}</h3>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber">{posterDateLine}</p>
                <p className="font-mono text-[8px] tracking-[0.18em] text-dim">{posterCoords}</p>
              </div>
              <p className="font-mono text-[8px] tracking-[0.34em] text-faint">ASTRIFER</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-text/10 pt-4">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-dim">Sayfanın Linki</span>
          <span className="break-all font-mono text-xs text-muted">{previewUrl}</span>
        </div>

        <div className="flex items-baseline justify-between border-t border-text/10 pt-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-dim">Dijital Sayfa</span>
          <span className="font-mono text-base text-amber">{formatTRY(DIGITAL_PRICE)}</span>
        </div>

        {previewHref ? (
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-full border border-amber/40 px-6 py-3 text-center font-mono text-xs uppercase tracking-widest text-amber transition-colors hover:bg-amber/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          >
            Dijital Sayfayı Önizle
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="Önizlemek için tarih, saat, konum ve isim alanlarını doldurun."
            className="w-full cursor-not-allowed rounded-full border border-text/10 px-6 py-3 text-center font-mono text-xs uppercase tracking-widest text-dim opacity-50"
          >
            Dijital Sayfayı Önizle
          </button>
        )}

        <button
          type="submit"
          disabled={uploadsPending || isSubmitting}
          className="w-full rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-6 py-3.5 font-mono text-xs uppercase tracking-widest text-ink shadow-[0_12px_40px_-14px_rgba(230,163,92,0.6)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:opacity-40"
        >
          {isSubmitting ? "Oluşturuluyor…" : uploadsPending ? "Yükleniyor…" : "Sepete Ekle"}
        </button>
      </div>
    </form>
  );
}
