import { notFound } from "next/navigation";
import { StarMapView } from "@/components/starmap/StarMapView";
import { DEFAULT_SKY_PALETTE } from "@/components/astrolab/palettes";
import type { StarMapRecord } from "@/lib/starmaps";

export default async function CreatePreviewPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const get = (key: string) => {
    const value = searchParams[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const title = get("title");
  const location = get("location");
  const lat = get("lat");
  const lon = get("lon");
  const date = get("date");
  const timezone = get("timezone");

  if (!title || !location || !lat || !lon || !date || !timezone) notFound();

  const eventDateUtc = new Date(date);
  if (Number.isNaN(eventDateUtc.getTime())) notFound();

  const photosParam = get("photos");
  const photoUrls = photosParam ? photosParam.split(",").filter(Boolean) : [];

  const starMap: StarMapRecord = {
    slug: get("slug") ?? "onizleme",
    title,
    message: get("message") ?? null,
    eventDateUtc,
    timezone,
    latitude: Number(lat),
    longitude: Number(lon),
    locationName: location,
    musicUrl: null,
    voiceNoteUrl: get("voice") ?? null,
    videoUrl: get("video") ?? null,
    palette: get("palette") ?? DEFAULT_SKY_PALETTE.id,
    // No real doc exists yet at preview time — synthesize the one entry
    // that /create's setup photos will become once submitted.
    createdAt: eventDateUtc,
    entries: [
      {
        id: "preview",
        date: eventDateUtc,
        photos: photoUrls.map((url) => ({ url })),
        note: null,
        isInitial: true,
      },
    ],
  };

  const step = get("step");
  const furthestStep = get("furthestStep");

  return (
    <StarMapView
      starMap={starMap}
      isPreview
      step={step ? Number(step) : undefined}
      furthestStep={furthestStep ? Number(furthestStep) : undefined}
    />
  );
}
