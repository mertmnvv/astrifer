"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ownerCookieName, verifyOwnerToken } from "@/lib/starmapOwnerToken";

export interface AddTimelineEntryInput {
  slug: string;
  dateIso: string;
  photoUrls: string[];
  note: string | null;
}

/**
 * Re-verifies the owner cookie server-side — the client only hides the "+
 * Yeni An Ekle" UI from non-owners, it never gets to decide who's allowed
 * to write.
 */
export async function addTimelineEntryAction(input: AddTimelineEntryInput): Promise<void> {
  const token = cookies().get(ownerCookieName(input.slug))?.value;
  const isOwner = await verifyOwnerToken(input.slug, token);
  if (!isOwner) {
    throw new Error("Bu sayfayı düzenleme yetkiniz yok.");
  }

  const date = new Date(input.dateIso);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Geçersiz tarih.");
  }
  if (input.photoUrls.length === 0) {
    throw new Error("En az bir fotoğraf gerekli.");
  }
  if (input.photoUrls.length > 4) {
    throw new Error("En fazla 4 fotoğraf ekleyebilirsiniz.");
  }

  const { getStarMapBySlug } = await import("@/lib/starmaps");
  const { isAddWindowOpen } = await import("@/lib/starmapTimeline");

  const starMap = await getStarMapBySlug(input.slug);
  if (!starMap) {
    throw new Error("Yıldız haritası bulunamadı.");
  }

  if (!isAddWindowOpen(starMap.createdAt, starMap.entries)) {
    throw new Error("Yeni bir an eklemek için henüz zamanı gelmedi (Ayda bir kez ekleyebilirsiniz).");
  }

  const { getDb } = await import("@/lib/firebase/admin");
  const now = new Date();
  await getDb().collection("starMaps").doc(input.slug).collection("entries").add({
    date,
    photoUrls: input.photoUrls,
    note: input.note,
    isInitial: false,
    createdAt: now,
  });

  revalidatePath(`/s/${input.slug}`);
}
