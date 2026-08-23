import type { Metadata } from "next";
import { CreateFormV2 } from "./CreateFormV2";
import { FALLBACK_TEMPLATES, type TemplateOption } from "@/lib/templates";
import { isFirebaseConfigured } from "@/lib/firebase/isConfigured";
import { getPricingConfig } from "@/lib/pricingConfig";
import type { TemplateDoc } from "@/types/firestore";
import { ArchiveHeader, ArchiveFooter } from "@/components/v2/ArchiveChrome";

export const metadata: Metadata = {
  title: "Haritanı Oluştur — Hatırname",
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
      <ArchiveHeader compact />
      <main className="archive-shell min-h-screen px-4 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl sm:mb-14">
            <p className="archive-kicker text-[#5eead4]">Hatırname gece oluşturucu</p>
            <h1 className="archive-display-balanced mt-5 text-5xl leading-[0.92] text-white sm:text-7xl">Önce anınızı anlatın.<br /><em className="font-medium text-[#79f3df]">Gökyüzünü biz canlandıralım.</em></h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#9fb4ca]">Bilgileriniz kaybolmaz; her adımda geri dönebilir, satın almadan önce gerçek 3D sayfanızı yeni sekmede inceleyebilirsiniz.</p>
          </div>
          <CreateFormV2 templates={templates} pricing={pricing} />
        </div>
      </main>
      <ArchiveFooter />
    </>
  );
}
