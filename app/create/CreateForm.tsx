"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { computeSky } from "@/lib/astronomy/computeSky";
import { PlaceCombobox } from "@/components/ui/PlaceCombobox";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import { PhotoPicker, type PickedPhoto } from "@/components/ui/PhotoPicker";
import { VoiceRecorder, type VoiceRecorderValue } from "@/components/ui/VoiceRecorder";
import { VideoPicker, type VideoPickerValue } from "@/components/ui/VideoPicker";
import { SkyPaletteSwatchPicker } from "@/components/ui/SkyPaletteSwatchPicker";
import { JournalThemeSwatchPicker } from "@/components/ui/JournalThemeSwatchPicker";
import { SKY_PALETTES, DEFAULT_SKY_PALETTE } from "@/components/astrolab/palettes";
import { NightCoverPage } from "@/components/journal/night/NightCoverPage";
import { getJournalTheme, type JournalThemeId, PALETTE_TO_JOURNAL_THEME } from "@/components/journal/night/journalTheme";
import { JournalThemeProvider } from "@/components/journal/JournalThemeContext";
import { StarMapSpreadPage } from "@/components/journal/night/StarMapSpreadPage";
import { StarKeyPage } from "@/components/journal/night/StarKeyPage";
import { MemoryPage } from "@/components/journal/night/MemoryPage";
import { EssayPage } from "@/components/journal/night/EssayPage";
import { BlankPage } from "@/components/journal/night/BlankPage";
import { getYoutubeId } from "@/components/journal/MusicContext";
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
  "w-full rounded-[10px] border border-text/[0.14] bg-text/[0.04] px-3 py-2.5 text-sm text-text placeholder:text-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-light";
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
      <span className="text-iris-light">{n}</span>
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
        checked ? "border-iris bg-iris text-white" : "border-text/25 text-transparent"
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
  const [mediaOption, setMediaOption] = useState<"voice" | "video">("voice");
  const [voiceNote, setVoiceNote] = useState<VoiceRecorderValue | null>(null);
  const [videoFile, setVideoFile] = useState<VideoPickerValue | null>(null);
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
  const [musicError, setMusicError] = useState<string | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);

  // AI Memory Message Generator States
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiKeywords, setAiKeywords] = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);

  const handleGenerateAiMessage = async () => {
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/generate-narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: aiKeywords,
          date,
          location: place?.name,
          context: "letter",
        }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        setAiResult(data.text);
      } else {
        setAiError(data.error || "Mektup yazılamadı, lütfen tekrar deneyin.");
      }
    } catch {
      setAiError("Sunucu hatası oluştu, lütfen tekrar deneyin.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleYoutubeChange = (val: string) => {
    setYoutubeInput(val);
    setMusicError(null);

    if (!val.trim()) {
      setMusicUrl(null);
      return;
    }

    const videoId = getYoutubeId(val.trim());
    if (!videoId) {
      setMusicError("Lütfen geçerli bir YouTube video linki girin.");
      setMusicUrl(null);
      return;
    }

    setMusicUrl(val.trim());
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

      const draftTitleClean = (draft.title || "").trim().toLowerCase();
      if (draftTitleClean === "deneme başlığı" || draftTitleClean === "deneme basligi") {
        clearCreateDraft();
        return;
      }

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
      if (draft.videoUrl) {
        setVideoFile({ url: draft.videoUrl, source: "upload", status: "done", remoteUrl: draft.videoUrl });
      }
      if (draft.mediaOption) {
        setMediaOption(draft.mediaOption);
      }
      setJournalEnabled(draft.journalEnabled);
      if (draft.journalLetterText) setJournalLetterText(draft.journalLetterText);
      setJournalOpeningDate(draft.journalOpeningDate);
      if (draft.musicUrl) {
        setMusicUrl(draft.musicUrl);
        setYoutubeInput(draft.musicUrl);
      }
      if (draft.currentStep) {
        setCurrentStep(draft.currentStep);
      }
      if (draft.furthestStep) {
        setFurthestStep(draft.furthestStep);
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
    if (voiceParam) {
      setVoiceNote({ url: voiceParam, source: "upload", status: "done", remoteUrl: voiceParam });
      setMediaOption("voice");
    }

    const videoParam = params.get("video");
    if (videoParam) {
      setVideoFile({ url: videoParam, source: "upload", status: "done", remoteUrl: videoParam });
      setMediaOption("video");
    }

    const musicParam = params.get("music");
    if (musicParam) {
      setMusicUrl(musicParam);
      setYoutubeInput(musicParam);
    }

    const stepParam = params.get("step");
    if (stepParam) {
      const parsedStep = Number(stepParam);
      if (!isNaN(parsedStep) && parsedStep >= 1 && parsedStep <= 5) {
        setCurrentStep(parsedStep);
      }
    }
    const furthestStepParam = params.get("furthestStep");
    if (furthestStepParam) {
      const parsedFurthest = Number(furthestStepParam);
      if (!isNaN(parsedFurthest) && parsedFurthest >= 1 && parsedFurthest <= 5) {
        setFurthestStep(parsedFurthest);
      }
    } else if (stepParam) {
      const parsedStep = Number(stepParam);
      if (!isNaN(parsedStep) && parsedStep >= 1 && parsedStep <= 5) {
        setFurthestStep((f) => Math.max(f, parsedStep));
      }
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
    if (mediaOption === "voice" && voiceNote?.status === "done" && voiceNote.remoteUrl) params.set("voice", voiceNote.remoteUrl);
    if (mediaOption === "video" && videoFile?.status === "done" && videoFile.remoteUrl) params.set("video", videoFile.remoteUrl);
    if (musicUrl) params.set("music", musicUrl);
    params.set("palette", paletteId);
    return params;
  };

  const previewHref = useMemo(() => {
    if (!place || !eventDateUtc || !title.trim()) return null;
    const params = buildShareParams(place, eventDateUtc);
    params.set("timezone", place.timezone);
    params.set("slug", previewSlug);
    params.set("step", currentStep.toString());
    params.set("furthestStep", furthestStep.toString());
    return `/create/onizleme?${params.toString()}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place, eventDateUtc, title, message, photos, voiceNote, videoFile, mediaOption, musicUrl, paletteId, previewSlug, currentStep, furthestStep]);

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
      <BlankPage key="blank-9" />,
      // 10: Blank Page
      <BlankPage key="blank-10" />,
      // 11: QR Code Page
      <QrPage key="qr-page" qrUrl={previewHref || "https://astrifer.com/s/preview"} />,
      // 12: Back Cover
      <BackCoverPage key="back-cover" />,
    ];
  }, [previewSky, title, photos, previewHref]);

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

  const totalPrice = journalEnabled ? pricing.journalPrice : pricing.digitalPrice;

  const requiredFieldsValid = Boolean(place && date && time && title.trim() && templateSlug);
  const uploadsPending =
    photos.some((photo) => photo.status === "uploading") ||
    (mediaOption === "voice" && voiceNote?.status === "uploading") ||
    (mediaOption === "video" && videoFile?.status === "uploading");

  const uploadsFailed =
    photos.some((photo) => photo.status === "error") ||
    (mediaOption === "voice" && voiceNote?.status === "error") ||
    (mediaOption === "video" && videoFile?.status === "error");

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
      videoUrl: videoFile?.status === "done" ? (videoFile.remoteUrl ?? null) : null,
      mediaOption,
      journalEnabled,
      journalLetterText,
      journalOpeningDate,
      musicUrl: musicUrl,
      currentStep,
      furthestStep,
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
    videoFile,
    mediaOption,
    journalEnabled,
    journalLetterText,
    journalOpeningDate,
    musicUrl,
    currentStep,
    furthestStep,
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
        voiceNoteUrl: mediaOption === "voice" && voiceNote?.status === "done" ? (voiceNote.remoteUrl ?? null) : null,
        videoUrl: mediaOption === "video" && videoFile?.status === "done" ? (videoFile.remoteUrl ?? null) : null,
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
      <div className="order-1 lg:col-span-2">
        <CreateStepIndicator
          steps={STEPS}
          currentStep={currentStep}
          furthestStep={furthestStep}
          onStepClick={handleStepIndicatorClick}
        />
      </div>

      {/* FORM — floats as a panel over the always-visible preview below/beside it */}
      <div className="order-3 flex flex-col gap-9 rounded-3xl border border-text/[0.08] bg-void/40 p-6 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
        <motion.div
          key={1}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
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
        </motion.div>
        )}

        {currentStep === 2 && (
        <motion.div
          key={2}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
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
                className="rounded-full border border-text/[0.14] px-3 py-1 text-xs text-muted transition-colors hover:border-iris/50 hover:text-iris-light"
              >
                {city.name}
              </button>
            ))}
          </div>
        </motion.div>
        )}

        {currentStep === 3 && (
        <motion.div
          key={3}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <SectionLabel n="03">Gökyüzü Rengi</SectionLabel>
          <SkyPaletteSwatchPicker name="palette" palettes={SKY_PALETTES} value={paletteId} onChange={setPaletteId} />
          <JournalThemeSwatch paletteId={paletteId} journalThemeId={journalThemeId} isManuallySelected={isJournalThemeManuallySelected} />
        </motion.div>
        )}

        {currentStep === 4 && (
        <motion.div
          key={4}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <SectionLabel n="04">Kişiselleştir</SectionLabel>

          <p className="mb-2 text-xs text-dim">Fotoğraflar (en fazla 4)</p>
          <PhotoPicker photos={photos} onChange={setPhotos} />

          <div className="mt-4 mb-2 flex items-center justify-between">
            <span className="text-xs text-dim">Medya Ekle (Opsiyonel)</span>
            <div className="flex gap-1.5 rounded-full border border-text/10 bg-text/[0.03] p-0.5">
              <button
                type="button"
                onClick={() => setMediaOption("voice")}
                className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-colors ${
                  mediaOption === "voice"
                    ? "bg-iris text-white font-bold"
                    : "text-dim hover:text-bright"
                }`}
              >
                Ses Kaydı
              </button>
              <button
                type="button"
                onClick={() => setMediaOption("video")}
                className={`rounded-full px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider transition-colors ${
                  mediaOption === "video"
                    ? "bg-iris text-white font-bold"
                    : "text-dim hover:text-bright"
                }`}
              >
                Video Yükle
              </button>
            </div>
          </div>

          {mediaOption === "voice" ? (
            <VoiceRecorder value={voiceNote} onChange={setVoiceNote} />
          ) : (
            <VideoPicker value={videoFile} onChange={setVideoFile} />
          )}

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
              />
              {musicError && (
                <p className="mt-1 text-xs text-red-500 font-mono">{musicError}</p>
              )}
              {musicUrl && (
                <div className="mt-3 flex flex-col gap-2 rounded-xl border border-iris/20 bg-iris/[0.04] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-iris-light font-bold">
                      YouTube Müziği Aktif
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
                  <iframe
                    width="100%"
                    height="60"
                    src={`https://www.youtube.com/embed/${getYoutubeId(musicUrl)}?controls=1`}
                    title="YouTube music preview"
                    className="rounded-lg mt-1 border border-text/10"
                    allow="autoplay; encrypted-media"
                  />
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
                        ? "border-iris/60 bg-iris/10 text-iris-light"
                        : "border-text/[0.14] text-muted hover:border-iris/40 hover:text-iris-light"
                    }`}
                    title={example}
                  >
                    {example}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
        )}

        {currentStep === 5 && (
        <motion.div
          key={5}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <SectionLabel n="05">Fiziksel Olarak da Saklayın</SectionLabel>
          <p className="mb-4 text-sm leading-relaxed text-subtle">
            Bu anı fiziksel olarak da saklamak ister misiniz?
          </p>

          <label
            className={`flex w-full cursor-pointer flex-col gap-3 rounded-2xl border p-4 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-iris-light sm:max-w-xs ${
              journalEnabled ? "border-iris/50 bg-iris/[0.06]" : "border-text/10 bg-text/[0.02] hover:border-text/20"
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
              <span className="font-mono text-xs text-iris-light flex items-center gap-1.5">
                {pricing.journalOriginalPrice > pricing.journalPrice ? (
                  <>
                    <span className="line-through text-dim">{formatTRY(pricing.journalOriginalPrice)}</span>
                    <span className="font-semibold">{formatTRY(pricing.journalPrice)}</span>
                    <span className="rounded bg-green-500/10 px-1 py-0.5 text-[8px] font-bold text-green-400">
                      %{Math.round(((pricing.journalOriginalPrice - pricing.journalPrice) / pricing.journalOriginalPrice) * 100)} İNDİRİM
                    </span>
                  </>
                ) : (
                  <span>{formatTRY(pricing.journalPrice)}</span>
                )}
              </span>
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
                  <div className="flex items-center justify-between">
                    <label htmlFor="letter-text" className={FIELD_LABEL_CLASS}>
                      Gelecek Mektubu
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAiModal(true)}
                      className="font-mono text-[9px] uppercase tracking-wider text-iris-light hover:underline flex items-center gap-1 focus:outline-none"
                    >
                      <svg className="h-3 w-3 text-iris-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.467L21 21l-4.467-8.904t-8.904 4.467z" />
                      </svg>
                      <span>Yapay Zeka ile Yaz</span>
                    </button>
                  </div>
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
                    className="rounded-full border border-iris/40 bg-iris/5 px-6 py-3 font-mono text-xs uppercase tracking-widest text-iris-light transition-colors hover:bg-iris hover:text-white shadow-lg"
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
        </motion.div>
        )}
      </AnimatePresence>

        <div className="flex items-center gap-3 border-t border-text/10 pt-6">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full border border-text/15 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-subtle transition-colors hover:border-iris/40 hover:text-iris-light"
            >
              Geri
            </button>
          )}
          {currentStep < STEPS.length && (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto rounded-full bg-gradient-to-br from-iris to-flare px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-white shadow-[0_12px_40px_-14px_rgba(124,58,237,0.6)] transition-opacity hover:opacity-90"
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

      {/* ORDER PLAQUE — decorative gravur-style summary & CTA */}
      <div className="order-2 lg:order-4 lg:sticky lg:top-28 lg:self-start mx-auto w-full max-w-sm lg:mx-0">
        <div className="relative rounded-[26px] border border-iris/25 bg-gradient-to-b from-text/[0.04] via-transparent to-transparent p-7 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.7)]">
          {/* Corner flourishes */}
          <span aria-hidden className="pointer-events-none absolute left-4 top-4 h-4 w-4 border-l border-t border-iris/40" />
          <span aria-hidden className="pointer-events-none absolute right-4 top-4 h-4 w-4 border-r border-t border-iris/40" />
          <span aria-hidden className="pointer-events-none absolute bottom-4 left-4 h-4 w-4 border-b border-l border-iris/40" />
          <span aria-hidden className="pointer-events-none absolute bottom-4 right-4 h-4 w-4 border-b border-r border-iris/40" />

          {/* Plaque header */}
          <div className="flex flex-col items-center gap-2 pb-5 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-5 w-5 text-iris-light">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
            <h3 className="font-display italic text-lg text-bright">Sipariş Özeti</h3>
            <span className="h-px w-16 bg-gradient-to-r from-transparent via-iris/50 to-transparent" />
          </div>

          {/* Line items */}
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-dim">Dijital Sayfa</span>
              <span className="font-mono text-sm text-text flex items-center gap-1.5">
                {journalEnabled ? (
                  <>
                    <span className="line-through text-dim text-xs">{formatTRY(pricing.digitalPrice)}</span>
                    <span className="font-semibold text-green-400">Bedava</span>
                  </>
                ) : (
                  <>
                    {pricing.digitalOriginalPrice > pricing.digitalPrice && (
                      <span className="line-through text-dim text-xs">{formatTRY(pricing.digitalOriginalPrice)}</span>
                    )}
                    <span>{formatTRY(pricing.digitalPrice)}</span>
                  </>
                )}
              </span>
            </div>
            {journalEnabled && (
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-dim">Deri Defter</span>
                <span className="font-mono text-sm text-text flex items-center gap-1.5">
                  {pricing.journalOriginalPrice > pricing.journalPrice && (
                    <span className="line-through text-dim text-xs">{formatTRY(pricing.journalOriginalPrice)}</span>
                  )}
                  <span>{formatTRY(pricing.journalPrice)}</span>
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <span className="h-px flex-1 bg-text/10" />
              <span className="text-[9px] text-iris-light/60">✦</span>
              <span className="h-px flex-1 bg-text/10" />
            </div>

            <div className="flex items-baseline justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-bright">Toplam</span>
              <span className="font-mono text-xl text-iris-light">{formatTRY(totalPrice)}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {previewHref ? (
              <a
                href={previewHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block rounded-full border border-iris/40 px-6 py-3 text-center font-mono text-xs uppercase tracking-widest text-iris-light transition-colors hover:bg-iris/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-light"
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
              className="w-full rounded-full bg-gradient-to-br from-iris to-flare px-6 py-3.5 font-mono text-xs uppercase tracking-widest text-white shadow-[0_12px_40px_-14px_rgba(124,58,237,0.6)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-light disabled:opacity-40"
            >
              {isSubmitting ? "Oluşturuluyor…" : uploadsPending ? "Yükleniyor…" : "Sepete Ekle"}
            </button>
            {currentStep !== STEPS.length && (
              <p className="text-center text-[11px] text-dim">Son adıma (05) gelince aktifleşir.</p>
            )}
          </div>
        </div>
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

      {/* AI Memory Message Generator Modal */}
      <AnimatePresence>
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/85 backdrop-blur-sm" onClick={() => setShowAiModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl border border-text/10 bg-[#15101a] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setShowAiModal(false);
                  setAiError(null);
                  setAiResult("");
                }}
                className="absolute top-4 right-4 text-dim hover:text-bright"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-iris-light mb-1 flex items-center gap-1.5">
                <svg className="h-3 w-3 text-iris-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.904-4.467L21 21l-4.467-8.904t-8.904 4.467z" />
                </svg>
                <span>Yapay Zeka Hikaye Asistanı</span>
              </p>
              <h3 className="font-display text-xl italic text-bright mb-4">
                Anılarınızı Şiirsel Bir Mektuba Dönüştürün
              </h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="aiKeywords" className={FIELD_LABEL_CLASS}>
                    Anınızdan veya Aklınızdan Geçenler (İpucu/Kelime)
                  </label>
                  <textarea
                    id="aiKeywords"
                    rows={2}
                    value={aiKeywords}
                    onChange={(e) => setAiKeywords(e.target.value)}
                    placeholder="ör. Yağmurlu bir günde Kadıköy iskelesinde ilk karşılaşmamız, gözlerindeki heyecan..."
                    className={`${FIELD_CLASS} resize-none`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={FIELD_LABEL_CLASS}>Tarih</label>
                    <input
                      type="text"
                      disabled
                      value={date}
                      className={`${FIELD_CLASS} opacity-60 cursor-not-allowed`}
                    />
                  </div>
                  <div>
                    <label className={FIELD_LABEL_CLASS}>Konum</label>
                    <input
                      type="text"
                      disabled
                      value={place?.name || "Belirtilmedi"}
                      className={`${FIELD_CLASS} opacity-60 cursor-not-allowed`}
                    />
                  </div>
                </div>

                {aiError && (
                  <p className="text-xs text-red-400 font-mono">{aiError}</p>
                )}

                {aiResult && (
                  <div className="rounded-xl border border-iris/20 bg-iris/[0.03] p-4 flex flex-col gap-2">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-iris-light">Taslak Mektup</p>
                    <p className="font-display text-sm italic text-bright leading-relaxed">
                      &ldquo;{aiResult}&rdquo;
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  {aiResult ? (
                    <>
                      <button
                        type="button"
                        onClick={handleGenerateAiMessage}
                        disabled={isGeneratingAi}
                        className="flex-1 rounded-full border border-text/20 bg-text/[0.02] py-2.5 font-mono text-[10px] uppercase tracking-widest text-subtle transition-colors hover:border-iris hover:text-iris-light disabled:opacity-40"
                      >
                        {isGeneratingAi ? "Yazılıyor..." : "Yeniden Yaz"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setJournalLetterText(aiResult);
                          setShowAiModal(false);
                          setAiResult("");
                          setAiError(null);
                        }}
                        className="flex-1 rounded-full bg-iris py-2.5 font-mono text-[10px] uppercase tracking-widest text-white font-semibold transition-colors hover:bg-iris-light active:scale-95"
                      >
                        Mektubu Kullan
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGenerateAiMessage}
                      disabled={isGeneratingAi || !aiKeywords.trim()}
                      className="w-full rounded-full bg-iris py-2.5 font-mono text-[10px] uppercase tracking-widest text-white font-semibold transition-colors hover:bg-iris-light disabled:opacity-40 active:scale-95 flex items-center justify-center gap-2"
                    >
                      {isGeneratingAi ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                          </svg>
                          Yazılıyor...
                        </>
                      ) : (
                        "Şiirsel Mektup Yaz"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </form>
  );
}
