import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";

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
}

/**
 * Shown for any slug when Supabase isn't configured yet, so /s/[slug] is
 * demoable in local dev without a live project. Once Supabase is wired up,
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
};

function rowToRecord(row: {
  slug: string;
  title: string;
  message: string | null;
  event_date: string;
  timezone: string;
  latitude: number;
  longitude: number;
  location_name: string;
  music_url: string | null;
}): StarMapRecord {
  return {
    slug: row.slug,
    title: row.title,
    message: row.message,
    eventDateUtc: new Date(row.event_date),
    timezone: row.timezone,
    latitude: row.latitude,
    longitude: row.longitude,
    locationName: row.location_name,
    musicUrl: row.music_url,
  };
}

export async function getStarMapBySlug(slug: string): Promise<StarMapRecord | null> {
  if (!isSupabaseConfigured()) {
    return { ...DEMO_STAR_MAP, slug };
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("star_maps")
      .select("slug, title, message, event_date, timezone, latitude, longitude, location_name, music_url")
      .eq("slug", slug)
      .eq("is_public", true)
      .maybeSingle();

    if (error || !data) return null;
    return rowToRecord(data);
  } catch {
    return null;
  }
}
