import { NextRequest, NextResponse } from "next/server";
import tzLookup from "tz-lookup";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: { country?: string };
}

/**
 * Best-effort supplement to the built-in city list in lib/geocode/cities.ts.
 * Nominatim requires a descriptive User-Agent and no client-side calls per
 * its usage policy, hence this server-side proxy. Fails soft: any network or
 * upstream error just yields an empty result set instead of a 500, so the
 * built-in list still works standalone.
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(query)}`,
      {
        signal: controller.signal,
        headers: {
          "User-Agent": "Astrifer/0.1 (astrifer.com; contact@astrifer.com)",
          "Accept-Language": "tr,en",
        },
      },
    );
    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json({ results: [] });
    }

    const data: NominatimResult[] = await response.json();
    const results = data.map((item) => {
      const latitude = Number(item.lat);
      const longitude = Number(item.lon);
      let timezone = "UTC";
      try {
        timezone = tzLookup(latitude, longitude);
      } catch {
        // Ocean coordinates and similar edge cases: fall back to UTC.
      }
      return {
        name: item.display_name.split(",")[0],
        country: item.address?.country ?? "",
        latitude,
        longitude,
        timezone,
      };
    });

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
