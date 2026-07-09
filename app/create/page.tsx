import type { Metadata } from "next";
import { CreateForm } from "./CreateForm";
import { FALLBACK_TEMPLATES, type TemplateOption } from "@/lib/templates";
import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import type { TemplateDoc } from "@/types/firestore";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

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
    <>
      <SiteHeader />
      <main className="min-h-screen px-4 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll className="mb-10 flex flex-col items-center text-center sm:mb-14">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-brass">
              Zaman Kapsülü
            </p>
            <h1 className="mt-4 font-display text-3xl italic leading-tight text-text sm:text-5xl">
              O anın gökyüzünü çiz.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-haze sm:text-base">
              Tarihi, saati ve konumu gir — gerçek astronomik verilerle o an
              gökyüzünde neler olduğunu anında gör.
            </p>
          </RevealOnScroll>
          <RevealOnScroll delayMs={120}>
            <CreateForm templates={templates} />
          </RevealOnScroll>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
