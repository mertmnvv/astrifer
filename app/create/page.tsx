import type { Metadata } from "next";
import { CreateForm } from "./CreateForm";
import { FALLBACK_TEMPLATES, type TemplateOption } from "@/lib/templates";
import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import type { TemplateDoc } from "@/types/firestore";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Haritanı Oluştur — Astrifer",
  description: "Tarih, saat ve konum gir; o anın gerçek gökyüzünü gör.",
};

async function loadTemplates(): Promise<TemplateOption[]> {
  if (!isFirebaseConfigured()) {
    return FALLBACK_TEMPLATES;
  }

  try {
    const { getDb } = await import("@/lib/firebase/admin");
    const snapshot = await getDb()
      .collection("templates")
      .where("isActive", "==", true)
      .orderBy("sortOrder")
      .get();

    if (snapshot.empty) {
      return FALLBACK_TEMPLATES;
    }

    return snapshot.docs.map((doc) => {
      const data = doc.data() as TemplateDoc;
      return {
        slug: data.slug,
        name: data.name,
        category: data.category,
        description: data.description ?? "",
        defaultMessage: data.defaultMessage ?? "",
      };
    });
  } catch {
    return FALLBACK_TEMPLATES;
  }
}

export default async function CreatePage() {
  const templates = await loadTemplates();

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col items-center text-center sm:mb-12">
          <Logo size={120} />
          <h1 className="mt-3 font-display text-3xl italic text-text sm:text-5xl">
            O anın gökyüzünü çiz.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-haze sm:text-base">
            Tarihi, saati ve konumu gir — gerçek astronomik verilerle o
            an gökyüzünde neler olduğunu anında gör.
          </p>
        </header>
        <CreateForm templates={templates} />
      </div>
    </main>
  );
}
