import type { Metadata } from "next";
import { CreateForm } from "./CreateForm";
import { FALLBACK_TEMPLATES, type TemplateOption } from "@/lib/templates";
import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import { getPricingConfig } from "@/lib/pricingConfig";
import type { TemplateDoc } from "@/types/firestore";
import { AuroraHeader } from "@/components/home/AuroraHeader";
import { AuroraFooter } from "@/components/home/AuroraFooter";
import { AuroraField } from "@/components/home/AuroraField";
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
        exampleMessages: data.exampleMessages ?? [],
      };
    });
  } catch {
    return FALLBACK_TEMPLATES;
  }
}

export default async function CreatePage() {
  const [templates, pricing] = await Promise.all([loadTemplates(), getPricingConfig()]);

  return (
    <>
      <AuroraHeader links={[{ href: "/", label: "Ana Sayfa" }]} cta={null} />
      <main className="relative min-h-screen px-4 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
        <AuroraField />
        <div className="mx-auto max-w-6xl">
          <RevealOnScroll className="mb-10 flex flex-col items-center text-center sm:mb-14">
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-iris-light">Zaman Kapsülü Oluştur</p>
            <h1 className="mt-3.5 font-display text-3xl italic leading-tight text-bright sm:text-5xl">
              O anı seçin, gökyüzünü çizelim.
            </h1>
          </RevealOnScroll>
          <RevealOnScroll delayMs={120}>
            <CreateForm templates={templates} pricing={pricing} />
          </RevealOnScroll>
        </div>
      </main>
      <AuroraFooter />
    </>
  );
}
