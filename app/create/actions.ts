"use server";

import { createStarMap, type CreateStarMapResult } from "@/lib/starmaps";

export interface CreateStarMapActionInput {
  title: string;
  message: string;
  locationName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  eventDateIso: string;
  templateSlug: string;
  paletteId: string;
  photoUrls: string[];
  voiceNoteUrl: string | null;
}

/**
 * Called directly (not via <form action>) from CreateForm's handleSubmit so
 * the client can read back {slug, ownerToken} before deciding where to
 * navigate next — see app/s/[slug]/claim/route.ts for how ownerToken gets
 * turned into a lasting cookie.
 */
export async function createStarMapAction(input: CreateStarMapActionInput): Promise<CreateStarMapResult> {
  if (!input.title.trim()) {
    throw new Error("Başlık gerekli.");
  }
  if (Number.isNaN(new Date(input.eventDateIso).getTime())) {
    throw new Error("Geçersiz tarih.");
  }

  return createStarMap({
    title: input.title.trim(),
    message: input.message.trim() || null,
    locationName: input.locationName,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
    eventDateIso: input.eventDateIso,
    templateSlug: input.templateSlug || null,
    paletteId: input.paletteId || null,
    photoUrls: input.photoUrls,
    voiceNoteUrl: input.voiceNoteUrl,
  });
}
