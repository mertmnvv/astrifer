"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { StarChart } from "@/components/astrolab/StarChart";
import { computeSky } from "@/lib/astronomy/computeSky";
import { PlaceCombobox } from "@/components/ui/PlaceCombobox";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { PhotoPicker, type PickedPhoto } from "@/components/ui/PhotoPicker";
import { VoiceRecorder, type VoiceRecorderValue } from "@/components/ui/VoiceRecorder";
import { SkyPaletteSwatchPicker } from "@/components/ui/SkyPaletteSwatchPicker";
import { JournalThemeSwatchPicker } from "@/components/ui/JournalThemeSwatchPicker";
import { SKY_PALETTES, DEFAULT_SKY_PALETTE, getSkyPalette } from "@/components/astrolab/palettes";
import { NightCoverPage } from "@/components/journal/night/NightCoverPage";
import { getJournalTheme, type JournalThemeId, PALETTE_TO_JOURNAL_THEME } from "@/components/journal/night/journalTheme";
import { JournalThemeProvider } from "@/components/journal/JournalThemeContext";
import { StarMapSpreadPage } from "@/components/journal/night/StarMapSpreadPage";
import { StarKeyPage } from "@/components/journal/night/StarKeyPage";
import { MemoryPage } from "@/components/journal/night/MemoryPage";
import { EssayPage } from "@/components/journal/night/EssayPage";
import { BlankPage } from "@/components/journal/night/BlankPage";
import { BackCoverPage } from "@/components/journal/night/BackCoverPage";
import { QrPage } from "@/components/journal/night/QrPage";
import { BookFlip } from "@/components/journal/BookFlip";
import { pickNumberedStars, splitSkyByAzimuth } from "@/components/journal/starMapSpread";
import { buildSkyEssay, buildSkyNarrative } from "@/lib/astronomy/skyNarrative";
import { ScaledPreview } from "@/components/ScaledPreview";
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
  const [journalThemeId, setJournalThemeId] = useState<JournalThemeId>("navy-gold");
  const [isJournalThemeManuallySelected, setIsJournalThemeManuallySelected] = useState(false);
  const [touchedSubmit, setTouchedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [journalEnabled, setJournalEnabled] = useState(false);
  const [journalLetterText, setJournalLetterText] = useState(
    "Bu satırları okuduğunuzda aradan yıllar geçmiş olacak. O geceki hissi hiç unutmayın...",
  );
  const [journalOpeningDate, setJournalOpeningDate] = useState("");
  const minOpeningDate = useMemo(() => tomorrowIso(), []);

  // Synchronize the notebook theme with the sky palette theme by default,
  // until the user manually changes the notebook theme.
  useEffect(() => {
    if (!isJournalThemeManuallySelected) {
      const defaultThemeId = PALETTE_TO_JOURNAL_THEME[paletteId] ?? "navy-gold";
      setJournalThemeId(defaultThemeId);
    }
  }, [paletteId, isJournalThemeManuallySelected]);

  const [currentStep, setCurrentStep] = useState(1);
  const [furthestStep, setFurthestStep] = useState(1);
  const [touchedStep, setTouchedStep] = useState<number | null>(null);

  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [youtubeInput, setYoutubeInput] = useState("");
  const [isConvertingMusic, setIsConvertingMusic] = useState(false);
  const [musicError, setMusicError] = useState<string | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);

  const handleYoutubeChange = async (val: string) => {
    setYoutubeInput(val);
    setMusicError(null);

    if (!val.trim()) {
      setMusicUrl(null);
      return;
    }

    const isYt = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\//.test(val.trim());
    if (!isYt) {
      setMusicError("Lütfen geçerli bir YouTube video linki girin.");
      return;
    }

    setIsConvertingMusic(true);
    try {
      const res = await fetch("/api/youtube-mp3", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: val.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Dönüştürme başarısız.");
      }
      const data = await res.json();
      setMusicUrl(data.url);
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Bir hata oluştu.";
      setMusicError(errMsg);
      setMusicUrl(null);
    } finally {
      setIsConvertingMusic(false);
    }
  };

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
      if (draft.journalThemeId) {
        setJournalThemeId(draft.journalThemeId as JournalThemeId);
      }
      if (draft.isJournalThemeManuallySelected !== undefined) {
        setIsJournalThemeManuallySelected(draft.isJournalThemeManuallySelected);
      }
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
      if (draft.musicUrl) {
        setMusicUrl(draft.musicUrl);
        setYoutubeInput(draft.musicUrl);
      }

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

    const musicParam = params.get("music");
    if (musicParam) {
      setMusicUrl(musicParam);
      setYoutubeInput(musicParam);
    }
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

  const previewSky = useMemo(() => {
    if (sky) return sky;
    // Fallback sky
    return computeSky({
      date: new Date("2026-07-15T21:00:00.000Z"),
      latitude: 41.0082,
      longitude: 28.9784,
    });
  }, [sky]);

  const previewSlug = slugify(title) || "senin-sayfan";

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
    if (musicUrl) params.set("music", musicUrl);
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
  }, [place, eventDateUtc, title, message, photos, voiceNote, musicUrl, paletteId, previewSlug]);

  const bookPages = useMemo(() => {
    // Pick stars based on previewSky
    const page1Stars = pickNumberedStars(splitSkyByAzimuth(previewSky, 0, 180), 6, 1);
    const page2Stars = pickNumberedStars(splitSkyByAzimuth(previewSky, 180, 360), 6, 7);
    const allStars = [...page1Stars, ...page2Stars];

    const narrative = buildSkyNarrative(previewSky);
    const essay = buildSkyEssay(previewSky);

    // Photos state in CreateForm has pickedPhotos
    const donePhotos = photos.filter((p) => p.status === "done" && p.url);

    return [
      // 0: Cover
      <NightCoverPage key="cover" names={title.trim() || "İsim & İsim"} />,
      // 1: StarMap Left
      <StarMapSpreadPage key="map-left" sky={previewSky} numberedStars={page1Stars} />,
      // 2: StarMap Right
      <StarMapSpreadPage key="map-right" sky={previewSky} numberedStars={page2Stars} />,
      // 3: StarKey Page
      <div key="key" className="h-full w-full bg-void">
        <ScaledPreview designWidth={600} designHeight={800} className="h-full w-full">
          <StarKeyPage numberedStars={allStars} narrative={narrative} widthPx={600} heightPx={800} />
        </ScaledPreview>
      </div>,
      // 4: Memory 1
      <MemoryPage key="mem1" photo={donePhotos[0] ? { url: donePhotos[0].url!, caption: donePhotos[0].caption || undefined } : { url: "", caption: undefined }} caption={donePhotos[0]?.caption || "İlk “Merhaba”"} />,
      // 5: Memory 2
      <MemoryPage key="mem2" photo={donePhotos[1] ? { url: donePhotos[1].url!, caption: donePhotos[1].caption || undefined } : { url: "", caption: undefined }} caption={donePhotos[1]?.caption || "O Gece"} />,
      // 6: Memory 3
      <MemoryPage key="mem3" photo={donePhotos[2] ? { url: donePhotos[2].url!, caption: donePhotos[2].caption || undefined } : { url: "", caption: undefined }} caption={donePhotos[2]?.caption || "Yüzük"} />,
      // 7: Memory 4
      <MemoryPage key="mem4" photo={donePhotos[3] ? { url: donePhotos[3].url!, caption: donePhotos[3].caption || undefined } : { url: "", caption: undefined }} caption={donePhotos[3]?.caption || "Ailece"} />,
      // 8: Essay
      <div key="essay" className="h-full w-full bg-void">
        <ScaledPreview designWidth={600} designHeight={800} className="h-full w-full">
          <EssayPage essay={essay} widthPx={600} heightPx={800} />
        </ScaledPreview>
      </div>,
      // 9: Blank Page
      <BlankPage key="blank-pre-qr" />,
      // 10: QR Code Page
      <QrPage key="qr-page" qrUrl={previewHref || "https://astrifer.com/s/preview"} />,
      // 11: Blank Page
      <BlankPage key="blank-post-qr" />,
      // 12: Back Cover
      <BackCoverPage key="back-cover" />,
    ];
  }, [previewSky, title, photos, previewHref]);

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



  const totalPrice = pricing.digitalPrice + (journalEnabled ? pricing.journalPrice : 0);

  const requiredFieldsValid = Boolean(place && date && time && title.trim() && templateSlug);
  const uploadsPending = photos.some((photo) => photo.status === "uploading") || voiceNote?.status === "uploading" || isConvertingMusic;
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
      journalThemeId,
      isJournalThemeManuallySelected,
      photos: photos
        .filter((photo) => photo.status === "done" && photo.url)
        .map((photo) => ({ id: photo.id, url: photo.url as string, caption: photo.caption })),
      voiceNoteUrl: voiceNote?.status === "done" ? (voiceNote.remoteUrl ?? null) : null,
      journalEnabled,
      journalLetterText,
      journalOpeningDate,
      musicUrl: musicUrl,
    });
  }, [
    date,
    time,
    place,
    title,
    message,
    templateSlug,
    paletteId,
    journalThemeId,
    isJournalThemeManuallySelected,
    photos,
    voiceNote,
    journalEnabled,
    journalLetterText,
    journalOpeningDate,
    musicUrl,
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
        journalThemeId,
        photoUrls,
        voiceNoteUrl: voiceNote?.status === "done" ? (voiceNote.remoteUrl ?? null) : null,
        musicUrl: musicUrl,
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
      <div className="order-2 flex flex-col gap-9">
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
          <JournalThemeSwatch paletteId={paletteId} journalThemeId={journalThemeId} isManuallySelected={isJournalThemeManuallySelected} />
        </div>

        <div className={currentStep === 4 ? "block" : "hidden"}>
          <SectionLabel n="04">Kişiselleştir</SectionLabel>

          <p className="mb-2 text-xs text-dim">Fotoğraflar (en fazla 4)</p>
          <PhotoPicker photos={photos} onChange={setPhotos} />

          <p className="mb-2 mt-4 text-xs text-dim">Sesli mesaj (opsiyonel)</p>
          <VoiceRecorder value={voiceNote} onChange={setVoiceNote} />

          <p className="mb-2 mt-4 text-xs text-dim">Arka plan müziği (YouTube - opsiyonel)</p>
          <div className="flex flex-col gap-2.5 rounded-2xl border border-text/10 bg-text/[0.02] p-4">
            <div className="relative flex flex-col gap-2">
              <input
                id="youtube-music"
                type="text"
                value={youtubeInput}
                onChange={(e) => handleYoutubeChange(e.target.value)}
                placeholder="ör. https://www.youtube.com/watch?v=..."
                className={FIELD_CLASS}
                disabled={isConvertingMusic}
              />
              {isConvertingMusic && (
                <div className="mt-2 flex items-center gap-2 text-xs text-amber font-mono">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber border-t-transparent" />
                  YouTube videosundan müzik dönüştürülüyor, lütfen bekleyin...
                </div>
              )}
              {musicError && (
                <p className="mt-1 text-xs text-red-500 font-mono">{musicError}</p>
              )}
              {musicUrl && !isConvertingMusic && (
                <div className="mt-3 flex flex-col gap-2 rounded-xl border border-amber/20 bg-amber/[0.04] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-amber font-bold">
                      Arka Plan Müziği Aktif
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setYoutubeInput("");
                        setMusicUrl(null);
                        setMusicError(null);
                      }}
                      className="text-[10px] uppercase font-mono text-dim hover:text-red-500 transition-colors"
                    >
                      Kaldır
                    </button>
                  </div>
                  <audio controls src={musicUrl} className="h-8 w-full mt-1 bg-transparent" />
                </div>
              )}
            </div>
          </div>

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
              <JournalThemeProvider theme={getJournalTheme(journalThemeId)}>
                <NightCoverPage names={title.trim() || "İsim & İsim"} />
              </JournalThemeProvider>
            </div>
            <p className="text-center text-[10px] text-dim">
              Renk: {getJournalTheme(journalThemeId).label} {!isJournalThemeManuallySelected ? "(Varsayılan)" : "(Özelleştirildi)"}
            </p>
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
                  <label className={FIELD_LABEL_CLASS}>Defter Kapak Rengi</label>
                  <JournalThemeSwatchPicker
                    name="journalTheme"
                    value={journalThemeId}
                    onChange={(themeId) => {
                      setJournalThemeId(themeId);
                      setIsJournalThemeManuallySelected(true);
                    }}
                  />
                  <p className="mt-1 text-[11px] text-dim">
                    Varsayılan olarak dijital sayfada seçtiğiniz renk tonuna uygun bir kapak atanır, isterseniz yukarıdan değiştirebilirsiniz.
                  </p>
                </div>

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

                {/* DERI DEFTER INTERACTIVE PREVIEW */}
                <div className="mt-6 border-t border-text/10 pt-6 flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setShowBookModal(true)}
                    className="rounded-full border border-amber/40 bg-amber/5 px-6 py-3 font-mono text-xs uppercase tracking-widest text-amber transition-colors hover:bg-amber hover:text-ink shadow-lg"
                  >
                    📖 Defteri İncele
                  </button>
                  <p className="mt-2 text-xs text-dim text-center">
                    Kendi yıldız haritanız, isimleriniz ve yüklediğiniz fotoğraflarla özelleştirilmiş defterinizi çevirerek inceleyin.
                  </p>
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
      <div className="order-3 flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
        <div className="mx-auto w-full flex justify-center">
          <div className="relative">
            {/* Glowing background */}
            <div className="absolute -inset-4 rounded-[48px] bg-gradient-to-r from-amber/10 to-transparent blur-xl -z-10 animate-pulse" />

            {/* iPhone Frame Wrapper */}
            <div className="relative w-[300px] h-[600px] rounded-[44px] border-[10px] border-[#1d1d1f] bg-[#0b0810] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.9)] ring-1 ring-white/10 flex flex-col overflow-hidden">
              
              {/* Dynamic Island / Notch */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-[#1d1d1f] rounded-full z-30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-void/70 absolute left-3.5" />
                <div className="w-10 h-0.5 bg-[#2d2d2f] rounded-full" />
              </div>

              {/* Scrollable Screen Content */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none pt-12 pb-6 px-3.5 space-y-8 select-none relative text-left scroll-smooth">
                {/* Simulated Blur Background */}
                <div aria-hidden className="absolute inset-0 -z-10 opacity-60 blur-[1.5px] pointer-events-none">
                  <StarChart sky={sky} label="" className="h-full w-full object-cover" palette={getSkyPalette(paletteId)} showLabels={false} />
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_35%,rgba(11,8,16,0.15)_0%,rgba(11,8,16,0.65)_70%,#0b0810_100%)]"
                />

                {/* Stage 1: Title Reveal */}
                <div className="text-center pt-3 flex flex-col items-center">
                  <span className="h-0.5 w-6 bg-amber/30 rounded" />
                  <h3 className="mt-3.5 font-display text-lg italic text-bright leading-tight max-w-[200px] mx-auto">
                    {title.trim() || "İsim & İsim"}
                  </h3>
                  <p className="mt-2 font-mono text-[8px] uppercase tracking-widest text-amber">
                    {previewDateLine}
                  </p>
                  <p className="mt-0.5 font-mono text-[7px] text-dim">
                    {coordsLabel}
                  </p>
                </div>

                {/* Stage 2: Star Medallion & Message */}
                <div className="flex flex-col items-center">
                  <div className="relative aspect-square w-48 rounded-full border border-amber/20 p-1.5 shadow-[0_0_25px_rgba(230,163,92,0.15)] bg-void/50 backdrop-blur-sm">
                    <div className="h-full w-full rounded-full overflow-hidden relative">
                      <StarChart sky={sky} label={previewLabel} className="h-full w-full" palette={getSkyPalette(paletteId)} showLabels={false} />
                    </div>
                  </div>
                  <div className="mt-4 text-center px-4 max-w-[210px]">
                    <p className="font-display text-[10px] italic leading-relaxed text-subtle">
                      &ldquo;{message.trim() || "Sen benim gökyüzümdeki en güzel yıldızımsın."}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Stage 3: Star Key Legend Preview */}
                <div className="mx-1 p-3 rounded-xl border border-amber/15 bg-void/75 backdrop-blur-sm text-center">
                  <h5 className="font-mono text-[7px] uppercase tracking-widest text-amber">Yıldız Anahtarı</h5>
                  <div className="mt-2 space-y-1.5 text-left max-w-[170px] mx-auto text-[7px] font-mono text-muted">
                    <div className="flex justify-between border-b border-text/5 pb-0.5">
                      <span>01. Sirius (Akyıldız)</span>
                      <span className="text-amber">★ -1.46 mag</span>
                    </div>
                    <div className="flex justify-between border-b border-text/5 pb-0.5">
                      <span>02. Vega</span>
                      <span className="text-amber">★ 0.03 mag</span>
                    </div>
                    <div className="flex justify-between">
                      <span>03. Altair</span>
                      <span className="text-amber">★ 0.76 mag</span>
                    </div>
                  </div>
                </div>

                {/* Stage 4: First Moment Photos (Live uploaded photos) */}
                {photos.length > 0 && (
                  <div className="flex flex-col items-center">
                    <p className="font-mono text-[7px] uppercase tracking-[0.2em] text-dim mb-3">İlk An</p>
                    <div className="flex flex-col gap-4 items-center">
                      {photos.map((p, idx) => (
                        <div key={p.id} className="w-36 overflow-hidden bg-[#fdfaf1] p-1.5 pb-3 shadow-lg shadow-black/40" style={{ transform: `rotate(${(idx % 2 === 0 ? 1.5 : -1.5)}deg)` }}>
                          <div className="w-full aspect-square bg-[#eceae1] overflow-hidden rounded-sm relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.previewUrl} alt="Yüklenen fotoğraf" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stage 5: Timeline Placeholders */}
                <div className="space-y-4 px-1 pt-2">
                  <p className="text-center font-mono text-[7px] uppercase tracking-[0.2em] text-dim">Zaman Çizelgesi</p>
                  <p className="text-center text-[8px] text-muted max-w-[190px] mx-auto leading-relaxed">
                    Sayfanız oluştuktan sonra anılarınızı ekleyebileceğiniz zaman tüneliniz:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center bg-[#fdfaf1]/[0.02] border border-dashed border-amber/20 p-1.5 pb-2 rounded-lg text-center scale-95">
                      <div className="w-full aspect-square border border-dashed border-amber/10 bg-void/50 rounded flex items-center justify-center text-amber/30">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                          <path d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25" />
                        </svg>
                      </div>
                      <p className="mt-1 font-display text-[7px] italic text-amber/80">İlk Fotoğrafımız</p>
                    </div>
                    <div className="flex flex-col items-center bg-[#fdfaf1]/[0.02] border border-dashed border-amber/20 p-1.5 pb-2 rounded-lg text-center scale-95">
                      <div className="w-full aspect-square border border-dashed border-amber/10 bg-void/50 rounded flex items-center justify-center text-amber/30">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                          <path d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                      </div>
                      <p className="mt-1 font-display text-[7px] italic text-amber/80">İlk Tatilimiz</p>
                    </div>
                    <div className="flex flex-col items-center bg-[#fdfaf1]/[0.02] border border-dashed border-amber/20 p-1.5 pb-2 rounded-lg text-center scale-95">
                      <div className="w-full aspect-square border border-dashed border-amber/10 bg-void/50 rounded flex items-center justify-center text-amber/30">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                          <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25" />
                        </svg>
                      </div>
                      <p className="mt-1 font-display text-[7px] italic text-amber/80">Geleceğe Not</p>
                    </div>
                  </div>
                </div>

                {/* Stage 6: Voice Record Player */}
                {voiceNote && (
                  <div className="mx-1 p-2.5 rounded-xl border border-amber/15 bg-void/75 backdrop-blur-sm flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="h-5.5 w-5.5 rounded-full bg-amber/10 flex items-center justify-center text-amber animate-pulse">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                        </svg>
                      </div>
                      <div className="text-[7.5px] font-mono text-muted">Sesli_Mesaj.mp3</div>
                    </div>
                    <div className="text-[7.5px] font-mono text-amber">Kayıtlı</div>
                  </div>
                )}
              </div>

              {/* Home Indicator line */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-[#1d1d1f] rounded-full z-30" />
            </div>
          </div>
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

      {/* 3D Book Preview Modal */}
      <AnimatePresence>
        {showBookModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setShowBookModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-neutral-950 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center gap-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                onClick={() => setShowBookModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center">
                <h3 className="font-display italic text-2xl text-bright">Deri Defter Canlı Önizlemesi</h3>
                <p className="text-xs text-dim mt-1">Özelleştirilmiş defterinizin sayfalarını çevirin</p>
              </div>

              {/* Flippable Book */}
              <div className="w-full py-4">
                <JournalThemeProvider theme={getJournalTheme(journalThemeId)}>
                  <BookFlip pages={bookPages} />
                </JournalThemeProvider>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
