"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { StarChart } from "@/components/astrolab/StarChart";
import { StarKeyLegend } from "@/components/astrolab/StarKeyLegend";
import { LedgerRule } from "@/components/atlas/LedgerRule";
import { computeSky } from "@/lib/astronomy/computeSky";
import { PlaceCombobox } from "@/components/ui/PlaceCombobox";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { PhotoPicker, type PickedPhoto } from "@/components/ui/PhotoPicker";
import { VoiceRecorder, type VoiceRecorderValue } from "@/components/ui/VoiceRecorder";
import { SkyPaletteSwatchPicker } from "@/components/ui/SkyPaletteSwatchPicker";
import { SKY_PALETTES, DEFAULT_SKY_PALETTE, getSkyPalette } from "@/components/astrolab/palettes";
import { NightCoverPage } from "@/components/journal/night/NightCoverPage";
import { getJournalTheme } from "@/components/journal/night/journalTheme";
import { JournalThemeProvider } from "@/components/journal/JournalThemeContext";
import { CreateStepIndicator, type CreateStep } from "@/components/create/CreateStepIndicator";
import { JournalThemeSwatch } from "@/components/create/JournalThemeSwatch";
import { BUILTIN_PLACES, type PlaceResult } from "@/lib/geocode/cities";
import { zonedTimeToUtc, utcToZonedTime } from "@/lib/geocode/timezone";
import { formatCoords } from "@/lib/geo/formatCoords";
import { addToCart } from "@/lib/cart";
import { getCreateDraft, setCreateDraft, clearCreateDraft } from "@/lib/createDraft";
import { formatTRY } from "@/lib/pricing";
import type { PricingConfig } from "@/lib/pricingConfig";
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

const LETTER_MAX_LENGTH = 2000;

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

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function isValidPlace(value: unknown): value is PlaceResult {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as PlaceResult).name === "string" &&
    typeof (value as PlaceResult).latitude === "number" &&
    typeof (value as PlaceResult).longitude === "number" &&
    typeof (value as PlaceResult).timezone === "string"
  );
}

function SectionLabel({ n, children }: { n: string; children: ReactNode }) {
  return (
    <p className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
      <span className="text-amber">{n}</span>
      &nbsp;&nbsp;{children}
    </p>
  );
}

const STEPS: CreateStep[] = [
  { n: 1, label: "Anı Seçin" },
  { n: 2, label: "Zaman & Konum" },
  { n: 3, label: "Gökyüzü Rengi" },
  { n: 4, label: "Kişiselleştir" },
  { n: 5, label: "Fiziksel Olarak da Saklayın" },
];

const STEP_ERROR_MESSAGES: Record<number, string> = {
  2: "Devam etmek için tarih, saat ve konum bilgilerini doldurun.",
  4: "Devam etmek için bir başlık girin.",
};

function AddOnCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
        checked ? "border-amber bg-amber text-ink" : "border-text/25 text-transparent"
      }`}
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export interface CreateFormProps {
  templates: TemplateOption[];
  pricing: PricingConfig;
}

export function CreateForm({ templates, pricing }: CreateFormProps) {
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

  const [journalEnabled, setJournalEnabled] = useState(false);
  const [journalLetterText, setJournalLetterText] = useState(
    "Bu satırları okuduğunuzda aradan yıllar geçmiş olacak. O geceki hissi hiç unutmayın...",
  );
  const [journalOpeningDate, setJournalOpeningDate] = useState("");
  const minOpeningDate = useMemo(() => tomorrowIso(), []);

  const [currentStep, setCurrentStep] = useState(1);
  const [furthestStep, setFurthestStep] = useState(1);
  const [touchedStep, setTouchedStep] = useState<number | null>(null);

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
  // prerenderable; runs once, client-side only, after hydration. When there's
  // no such query-param session, falls back to restoring a locally-saved
  // in-progress draft instead — see lib/createDraft.ts — so leaving /create
  // mid-form (e.g. to read the /urun/defter showcase page) and coming back
  // doesn't lose progress.
  useEffect(() => {
    if (didHydrateFromUrl.current) return;
    didHydrateFromUrl.current = true;

    const params = new URLSearchParams(window.location.search);
    const restoredTitle = params.get("title");
    if (!restoredTitle) {
      const draft = getCreateDraft();
      if (!draft) return;

      setTitle(draft.title);
      if (draft.message) setMessage(draft.message);
      setDate(draft.date);
      setTime(draft.time);
      if (isValidPlace(draft.place)) setPlace(draft.place);
      setPaletteId(draft.paletteId);
      if (draft.photos.length > 0) {
        setPhotos(
          draft.photos.map((photo) => ({
            id: photo.id,
            caption: photo.caption,
            previewUrl: photo.url,
            status: "done" as const,
            url: photo.url,
          })),
        );
      }
      if (draft.voiceNoteUrl) {
        setVoiceNote({ url: draft.voiceNoteUrl, source: "upload", status: "done", remoteUrl: draft.voiceNoteUrl });
      }
      setJournalEnabled(draft.journalEnabled);
      if (draft.journalLetterText) setJournalLetterText(draft.journalLetterText);
      setJournalOpeningDate(draft.journalOpeningDate);

      // Always mark the skip (even when the template itself isn't changing)
      // so the auto-fill effect's dev-mode double-invoke can't clobber the
      // message we just restored above — mirrors the URL-hydration branch
      // below, which needs the exact same guard for the exact same reason.
      const draftTemplateSlug = draft.templateSlug || templateSlug;
      pendingTemplateMessageSkip.current = draftTemplateSlug;
      if (draftTemplateSlug !== templateSlug && templates.some((item) => item.slug === draftTemplateSlug)) {
        setTemplateSlug(draftTemplateSlug);
      }
      return;
    }

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

  const currentTemplate = useMemo(() => templates.find((item) => item.slug === templateSlug), [templates, templateSlug]);
  const currentTemplateExamples = currentTemplate?.exampleMessages ?? [];

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

  const previewDateLine = useMemo(() => {
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

  const coordsLabel = place ? formatCoords(place.latitude, place.longitude) : "";

  const previewSlug = slugify(title) || "senin-sayfan";
  const previewUrl = `${SITE_HOST}/s/${previewSlug}`;

  const totalPrice = pricing.digitalPrice + (journalEnabled ? pricing.journalPrice : 0);

  const requiredFieldsValid = Boolean(place && date && time && title.trim() && templateSlug);
  const uploadsPending = photos.some((photo) => photo.status === "uploading") || voiceNote?.status === "uploading";
  const uploadsFailed = photos.some((photo) => photo.status === "error") || voiceNote?.status === "error";
  const isValid = requiredFieldsValid && !uploadsPending && !uploadsFailed;

  const stepValidity: Record<number, boolean> = {
    1: Boolean(templateSlug),
    2: Boolean(place && date && time),
    3: true,
    4: Boolean(title.trim()),
    5: true,
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    setFurthestStep((furthest) => Math.max(furthest, step));
  };

  const handleStepIndicatorClick = (step: number) => {
    if (step <= furthestStep) setCurrentStep(step);
  };

  const handleNext = () => {
    if (!stepValidity[currentStep]) {
      setTouchedStep(currentStep);
      return;
    }
    setTouchedStep(null);
    goToStep(Math.min(STEPS.length, currentStep + 1));
  };

  const handleBack = () => {
    setCurrentStep((step) => Math.max(1, step - 1));
  };

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

  // Autosaves the in-progress form as a resumable draft (see
  // lib/createDraft.ts) — skipped while the form is still effectively blank
  // so a fresh page load never overwrites a real draft with empty fields
  // before the restore effect above has a chance to run.
  useEffect(() => {
    const isEffectivelyEmpty = !title.trim() && !place && !message.trim() && photos.length === 0 && !journalEnabled;
    if (isEffectivelyEmpty) return;

    setCreateDraft({
      date,
      time,
      place,
      title,
      message,
      templateSlug,
      paletteId,
      photos: photos
        .filter((photo) => photo.status === "done" && photo.url)
        .map((photo) => ({ id: photo.id, url: photo.url as string, caption: photo.caption })),
      voiceNoteUrl: voiceNote?.status === "done" ? (voiceNote.remoteUrl ?? null) : null,
      journalEnabled,
      journalLetterText,
      journalOpeningDate,
    });
  }, [
    date,
    time,
    place,
    title,
    message,
    templateSlug,
    paletteId,
    photos,
    voiceNote,
    journalEnabled,
    journalLetterText,
    journalOpeningDate,
  ]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (currentStep !== STEPS.length) return;
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
        price: pricing.digitalPrice,
        summary: [previewDateLine],
        slug,
      });

      if (journalEnabled) {
        addToCart({
          productType: "journal",
          productLabel: "Deri Defter",
          title,
          price: pricing.journalPrice,
          summary: journalOpeningDate ? [`Gelecek Mektubu açılış: ${journalOpeningDate}`] : [],
          slug,
          journalConfig: { letterText: journalLetterText, openingDate: journalOpeningDate || null },
        });
      }

      clearCreateDraft();
      router.push(`/s/${slug}/claim?token=${encodeURIComponent(ownerToken)}&next=${encodeURIComponent("/sepet")}`);
    } catch {
      setIsSubmitting(false);
      setSubmitError("Sayfa oluşturulamadı — lütfen tekrar deneyin.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[minmax(0,28rem)_1fr] lg:items-start" noValidate>
      {/* STEP INDICATOR — always first: above the preview on mobile, spanning both columns on desktop */}
      <div className="order-1 lg:order-1 lg:col-span-2">
        <CreateStepIndicator
          steps={STEPS}
          currentStep={currentStep}
          furthestStep={furthestStep}
          onStepClick={handleStepIndicatorClick}
        />
      </div>

      {/* FORM */}
      <div className="order-3 flex flex-col gap-9 lg:order-2">
        <div className={currentStep === 1 ? "block" : "hidden"}>
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

        <div className={currentStep === 2 ? "block" : "hidden"}>
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

        <div className={currentStep === 3 ? "block" : "hidden"}>
          <SectionLabel n="03">Gökyüzü Rengi</SectionLabel>
          <SkyPaletteSwatchPicker name="palette" palettes={SKY_PALETTES} value={paletteId} onChange={setPaletteId} />
          <JournalThemeSwatch paletteId={paletteId} />
        </div>

        <div className={currentStep === 4 ? "block" : "hidden"}>
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

        <div className={currentStep === 5 ? "block" : "hidden"}>
          <SectionLabel n="05">Fiziksel Olarak da Saklayın</SectionLabel>
          <p className="mb-4 text-sm leading-relaxed text-subtle">
            Bu anı fiziksel olarak da saklamak ister misiniz?
          </p>

          <label
            className={`flex w-full cursor-pointer flex-col gap-3 rounded-2xl border p-4 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-amber sm:max-w-xs ${
              journalEnabled ? "border-amber/50 bg-amber/[0.06]" : "border-text/10 bg-text/[0.02] hover:border-text/20"
            }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={journalEnabled}
              onChange={(event) => setJournalEnabled(event.target.checked)}
            />
            <div className="mx-auto w-full max-w-[7rem]">
              <JournalThemeProvider theme={getJournalTheme(paletteId)}>
                <NightCoverPage names={title.trim() || "İsim & İsim"} />
              </JournalThemeProvider>
            </div>
            <p className="text-center text-[10px] text-dim">Renk: {getJournalTheme(paletteId).label} (03. adımda seçildi)</p>
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-base italic text-bright">Deri Defter</span>
              <AddOnCheckbox checked={journalEnabled} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-dim">Suni deri · 26 sayfa</span>
              <span className="font-mono text-xs text-amber">{formatTRY(pricing.journalPrice)}</span>
            </div>
          </label>

          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${journalEnabled ? "mt-5 grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-4 rounded-2xl border border-text/10 bg-text/[0.02] p-4">
                <div>
                  <label htmlFor="letter-text" className={FIELD_LABEL_CLASS}>
                    Gelecek Mektubu
                  </label>
                  <textarea
                    id="letter-text"
                    rows={4}
                    maxLength={LETTER_MAX_LENGTH}
                    value={journalLetterText}
                    onChange={(event) => setJournalLetterText(event.target.value)}
                    className={`${FIELD_CLASS} resize-none font-display italic`}
                  />
                  <p className="mt-1 text-[11px] text-dim">
                    Bu metin mühürlenip arka kapaktaki cebe yerleştirilen ayrı bir sayfaya basılır — kitabın
                    kendisinde görünmez.
                  </p>
                </div>
                <div>
                  <label htmlFor="opening-date" className={FIELD_LABEL_CLASS}>
                    Açılış Tarihi
                  </label>
                  <input
                    id="opening-date"
                    type="date"
                    min={minOpeningDate}
                    value={journalOpeningDate}
                    onChange={(event) => setJournalOpeningDate(event.target.value)}
                    className={`${FIELD_CLASS} [color-scheme:dark]`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-text/10 pt-6">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full border border-text/15 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-subtle transition-colors hover:border-amber/40 hover:text-amber"
            >
              Geri
            </button>
          )}
          {currentStep < STEPS.length && (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-ink shadow-[0_12px_40px_-14px_rgba(230,163,92,0.6)] transition-opacity hover:opacity-90"
            >
              İleri
            </button>
          )}
        </div>
        {touchedStep === currentStep && !stepValidity[currentStep] && STEP_ERROR_MESSAGES[currentStep] && (
          <p role="alert" className="text-sm text-red-300">
            {STEP_ERROR_MESSAGES[currentStep]}
          </p>
        )}

        {currentStep === STEPS.length && touchedSubmit && !requiredFieldsValid && (
          <p role="alert" className="text-sm text-red-300">
            Devam etmek için tarih, saat, konum ve isim alanlarını doldurun.
          </p>
        )}
        {currentStep === STEPS.length && touchedSubmit && requiredFieldsValid && uploadsFailed && (
          <p role="alert" className="text-sm text-red-300">
            Bazı yüklemeler başarısız oldu — devam etmeden önce kaldırın ya da tekrar deneyin.
          </p>
        )}
        {currentStep === STEPS.length && submitError && (
          <p role="alert" className="text-sm text-red-300">
            {submitError}
          </p>
        )}
      </div>

      {/* LIVE PREVIEW */}
      <div className="order-2 flex flex-col gap-4 lg:sticky lg:top-28 lg:order-3 lg:self-start">
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
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-amber">{previewDateLine}</p>
                <p className="font-mono text-[8px] tracking-[0.18em] text-dim">{coordsLabel}</p>
              </div>
              <p className="font-mono text-[8px] tracking-[0.34em] text-faint">ASTRIFER</p>
            </div>
          </div>
        </div>

        <StarKeyLegend
          sky={sky}
          palette={getSkyPalette(paletteId)}
          className="border-t border-text/10 pt-4"
        />

        <div className="flex flex-col gap-1 border-t border-text/10 pt-4">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-dim">Sayfanın Linki</span>
          <span className="break-all font-mono text-xs text-muted">{previewUrl}</span>
        </div>

        <div className="flex flex-col gap-2 border-t border-text/10 pt-4">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-dim">Dijital Sayfa</span>
            <span className="font-mono text-sm text-text">{formatTRY(pricing.digitalPrice)}</span>
          </div>
          {journalEnabled && (
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-dim">Deri Defter</span>
              <span className="font-mono text-sm text-text">{formatTRY(pricing.journalPrice)}</span>
            </div>
          )}
          <div className="flex items-baseline justify-between border-t border-text/10 pt-2">
            <span className="font-mono text-xs uppercase tracking-widest text-bright">Toplam</span>
            <span className="font-mono text-lg text-amber">{formatTRY(totalPrice)}</span>
          </div>
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
          disabled={uploadsPending || isSubmitting || currentStep !== STEPS.length}
          className="w-full rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-6 py-3.5 font-mono text-xs uppercase tracking-widest text-ink shadow-[0_12px_40px_-14px_rgba(230,163,92,0.6)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:opacity-40"
        >
          {isSubmitting ? "Oluşturuluyor…" : uploadsPending ? "Yükleniyor…" : "Sepete Ekle"}
        </button>
        {currentStep !== STEPS.length && (
          <p className="text-center text-[11px] text-dim">Son adıma (05) gelince aktifleşir.</p>
        )}
      </div>
    </form>
  );
}
