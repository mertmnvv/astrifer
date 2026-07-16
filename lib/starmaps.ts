import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import { DEFAULT_SKY_PALETTE } from "@/components/astrolab/palettes";
import { slugify } from "@/lib/slug";
import type { StarMapDoc, TimelineEntryDoc } from "@/types/firestore";

export interface StarMapPhoto {
  /** Absent until a real upload pipeline exists — renders a placeholder slot instead of an <img>. */
  url?: string;
  caption?: string;
}

/** One dated entry in the page's growing photo timeline — see TimelineEntryDoc. */
export interface TimelineEntry {
  id: string;
  date: Date;
  photos: StarMapPhoto[];
  note: string | null;
  /** True only for the entry written alongside the page itself. */
  isInitial: boolean;
}

export interface StarMapRecord {
  slug: string;
  title: string;
  message: string | null;
  eventDateUtc: Date;
  timezone: string;
  latitude: number;
  longitude: number;
  locationName: string;
  musicUrl: string | null;
  /** Optional voice message. Absent for real records until Storage upload is wired up. */
  voiceNoteUrl: string | null;
  videoUrl: string | null;
  /** Sky color scheme id — see components/astrolab/palettes.ts. */
  palette: string;
  /** Custom leather notebook theme id — see components/journal/night/journalTheme.ts. */
  journalThemeId?: string | null;
  /** When the page itself was created — anchors the 6-month timeline-entry schedule (see lib/starmapTimeline.ts). */
  createdAt: Date;
  /** Newest first. */
  entries: TimelineEntry[];
}

/**
 * Shown for any slug when Firebase isn't configured yet, so /s/[slug] is
 * demoable in local dev without a live project. Once Firebase is wired up,
 * an unmatched slug falls through to notFound() instead — see getStarMapBySlug.
 */
export const DEMO_STAR_MAP: StarMapRecord = {
  slug: "ornek",
  title: "Elif & Kaan",
  message: "Bana evet dediğin an, gökyüzü buydu.",
  eventDateUtc: new Date("2024-06-21T18:45:00.000Z"),
  timezone: "Europe/Istanbul",
  latitude: 41.0082,
  longitude: 28.9784,
  locationName: "İstanbul",
  musicUrl: null,
  // Left empty deliberately: we won't fabricate a fake/non-functional audio
  // file for the demo. Real behavior — section hidden until a real
  // recording exists — is exercised the same way it will be in production.
  voiceNoteUrl: null,
  videoUrl: null,
  palette: DEFAULT_SKY_PALETTE.id,
  journalThemeId: null,
  createdAt: new Date("2024-06-21T18:45:00.000Z"),
  entries: [
    {
      id: "demo-initial",
      date: new Date("2024-06-21T18:45:00.000Z"),
      photos: [
        { caption: "İlk “Merhaba”" },
        { caption: "O Gece" },
        { caption: "Yüzük" },
        { caption: "Ailece" },
      ],
      note: null,
      isInitial: true,
    },
    {
      id: "demo-periodic",
      date: new Date("2024-12-21T18:45:00.000Z"),
      photos: [{ caption: "Altı Ay Sonra" }],
      note: "İlk yıl dönümümüze doğru güzel bir akşamdı.",
      isInitial: false,
    },
  ],
};

function docToRecord(slug: string, doc: StarMapDoc, entries: TimelineEntry[]): StarMapRecord {
  return {
    slug,
    title: doc.title,
    message: doc.message,
    eventDateUtc: doc.eventDate.toDate(),
    timezone: doc.timezone,
    latitude: doc.latitude,
    longitude: doc.longitude,
    locationName: doc.locationName,
    musicUrl: doc.musicUrl,
    voiceNoteUrl: doc.voiceNoteUrl,
    videoUrl: doc.videoUrl ?? null,
    palette: doc.palette ?? DEFAULT_SKY_PALETTE.id,
    journalThemeId: doc.journalThemeId ?? null,
    createdAt: doc.createdAt.toDate(),
    entries,
  };
}

export async function getStarMapBySlug(slug: string): Promise<StarMapRecord | null> {
  if (!isFirebaseConfigured()) {
    return { ...DEMO_STAR_MAP, slug };
  }

  try {
    const { getDb } = await import("@/lib/firebase/admin");
    const db = getDb();
    const snapshot = await db.collection("starMaps").doc(slug).get();
    if (!snapshot.exists) return null;

    const doc = snapshot.data() as StarMapDoc;
    if (!doc.isPublic) return null;

    const entriesSnapshot = await db
      .collection("starMaps")
      .doc(slug)
      .collection("entries")
      .orderBy("date", "desc")
      .get();
    const entries: TimelineEntry[] = entriesSnapshot.docs.map((entryDoc) => {
      const data = entryDoc.data() as TimelineEntryDoc;
      return {
        id: entryDoc.id,
        date: data.date.toDate(),
        photos: data.photoUrls.map((url) => ({ url })),
        note: data.note,
        isInitial: data.isInitial,
      };
    });

    return docToRecord(slug, doc, entries);
  } catch {
    return null;
  }
}

export interface CreateStarMapInput {
  title: string;
  message: string | null;
  locationName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  eventDateIso: string;
  templateSlug: string | null;
  paletteId: string | null;
  journalThemeId: string | null;
  photoUrls: string[];
  voiceNoteUrl: string | null;
  videoUrl: string | null;
  musicUrl: string | null;
}

export interface CreateStarMapResult {
  slug: string;
  ownerToken: string;
}

/**
 * Writes the `starMaps/{slug}` doc plus its initial `entries` doc, and mints
 * the owner's edit token in the same call — see lib/starmapOwnerToken.ts.
 * The digital page goes live here, independent of the (still-stubbed)
 * physical-product checkout/payment flow.
 */
export async function createStarMap(input: CreateStarMapInput): Promise<CreateStarMapResult> {
  if (input.photoUrls.length > 4) {
    throw new Error("En fazla 4 fotoğraf ekleyebilirsiniz.");
  }

  const { getDb } = await import("@/lib/firebase/admin");
  const { createOwnerToken } = await import("@/lib/starmapOwnerToken");
  const db = getDb();

  const base = slugify(input.title) || "sayfa";
  // 8 karakterlik URL-safe rastgele token — tahmin edilemez
  const randomToken = () =>
    Buffer.from(
      Array.from({ length: 6 }, () => Math.floor(Math.random() * 256))
    )
      .toString("base64url")
      .slice(0, 8);
  let slug = `${base}-${randomToken()}`;
  for (let attempt = 0; attempt < 6; attempt++) {
    const existing = await db.collection("starMaps").doc(slug).get();
    if (!existing.exists) break;
    slug = `${base}-${randomToken()}`;
  }

  const now = new Date();
  const eventDate = new Date(input.eventDateIso);

  await db
    .collection("starMaps")
    .doc(slug)
    .set({
      slug,
      templateSlug: input.templateSlug,
      title: input.title,
      message: input.message || null,
      eventDate,
      timezone: input.timezone,
      latitude: input.latitude,
      longitude: input.longitude,
      locationName: input.locationName,
      musicUrl: input.musicUrl,
      voiceNoteUrl: input.voiceNoteUrl,
      videoUrl: input.videoUrl,
      palette: input.paletteId,
      journalThemeId: input.journalThemeId || null,
      isPublic: true,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
    });

  await db.collection("starMaps").doc(slug).collection("entries").add({
    date: eventDate,
    photoUrls: input.photoUrls,
    note: null,
    isInitial: true,
    createdAt: now,
  });

  const ownerToken = await createOwnerToken(slug);
  return { slug, ownerToken };
}
