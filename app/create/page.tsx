import type { Metadata } from "next";
import { CreateForm } from "./CreateForm";
import { FALLBACK_TEMPLATES, type TemplateOption } from "@/lib/templates";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";

export const metadata: Metadata = {
  title: "Haritanı Oluştur — Astrifer",
  description: "Tarih, saat ve konum gir; o anın gerçek gökyüzünü gör.",
};

async function loadTemplates(): Promise<TemplateOption[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_TEMPLATES;
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("templates")
      .select("slug, name, category, description, default_message")
      .eq("is_active", true)
      .order("sort_order");

    if (error || !data || data.length === 0) {
      return FALLBACK_TEMPLATES;
    }

    return data.map((row) => ({
      slug: row.slug,
      name: row.name,
      category: row.category,
      description: row.description ?? "",
      defaultMessage: row.default_message ?? "",
    }));
  } catch {
    return FALLBACK_TEMPLATES;
  }
}

export default async function CreatePage() {
  const templates = await loadTemplates();

  return (
    <main className="min-h-screen px-4 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 text-center sm:mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brass">Astrifer</p>
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
