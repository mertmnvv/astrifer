import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import { DEFAULT_SKY_PALETTE } from "@/components/astrolab/palettes";
import type { StarMapDoc } from "@/types/firestore";

export interface StarMapPhoto {
  /** Absent until a real upload pipeline exists — renders a placeholder slot instead of an <img>. */
  url?: string;
  caption?: string;
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
  /** Up to 4, optional. Empty for real records until Storage upload is wired up. */
  photos: StarMapPhoto[];
  /** Optional voice message. Absent for real records until Storage upload is wired up. */
  voiceNoteUrl: string | null;
  /** Sky color scheme id — see components/astrolab/palettes.ts. */
  palette: string;
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
  photos: [
    { caption: "İlk “Merhaba”" },
    { caption: "O Gece" },
    { caption: "Yüzük" },
    { caption: "Ailece" },
  ],
  // Left empty deliberately: we won't fabricate a fake/non-functional audio
  // file for the demo. Real behavior — section hidden until a real
  // recording exists — is exercised the same way it will be in production.
  voiceNoteUrl: null,
  palette: DEFAULT_SKY_PALETTE.id,
};

function docToRecord(slug: string, doc: StarMapDoc): StarMapRecord {
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
    photos: (doc.photoUrls ?? []).map((url) => ({ url })),
    voiceNoteUrl: doc.voiceNoteUrl,
    palette: doc.palette ?? DEFAULT_SKY_PALETTE.id,
  };
}

export async function getStarMapBySlug(slug: string): Promise<StarMapRecord | null> {
  if (!isFirebaseConfigured()) {
    return { ...DEMO_STAR_MAP, slug };
  }

  try {
    const { getDb } = await import("@/lib/firebase/admin");
    const snapshot = await getDb().collection("starMaps").doc(slug).get();
    if (!snapshot.exists) return null;

    const doc = snapshot.data() as StarMapDoc;
    if (!doc.isPublic) return null;

    return docToRecord(slug, doc);
  } catch {
    return null;
  }
}
