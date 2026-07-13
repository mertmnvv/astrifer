"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/firebase/admin";
import type { TemplateCategory } from "@/types/firestore";

const VALID_CATEGORIES: TemplateCategory[] = ["dogum", "yildonumu", "teklif", "mezuniyet", "anma"];

export async function toggleTemplateActiveAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const isActive = String(formData.get("isActive")) === "true";
  if (!slug) throw new Error("Geçersiz şablon.");

  await getDb().collection("templates").doc(slug).update({ isActive: !isActive });
  revalidatePath("/admin/templates");
}

export async function createTemplateAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const exampleMessages = [
    String(formData.get("exampleMessage1") ?? "").trim(),
    String(formData.get("exampleMessage2") ?? "").trim(),
    String(formData.get("exampleMessage3") ?? "").trim(),
  ].filter(Boolean);

  if (!slug || !name || !VALID_CATEGORIES.includes(category as TemplateCategory)) {
    throw new Error("Geçersiz şablon bilgisi.");
  }

  const db = getDb();
  const existing = await db.collection("templates").doc(slug).get();
  if (existing.exists) {
    throw new Error(`"${slug}" slug'ı zaten kullanılıyor.`);
  }

  const countSnapshot = await db.collection("templates").count().get();

  await db
    .collection("templates")
    .doc(slug)
    .set({
      slug,
      name,
      category,
      description: description || null,
      exampleMessages,
      sortOrder: countSnapshot.data().count,
      isActive: true,
      createdAt: new Date(),
    });

  revalidatePath("/admin/templates");
}
