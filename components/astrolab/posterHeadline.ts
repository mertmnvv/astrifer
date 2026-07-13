import type { TemplateCategory } from "@/types/firestore";

/** Small-caps poster band headline, per memory type — purely presentational copy. */
export const POSTER_HEADLINE_BY_TEMPLATE: Record<TemplateCategory, string> = {
  dogum: "Dünyaya Geldiğin An",
  yildonumu: "Yıllardır Aynı Gökyüzü",
  teklif: "Evet Dediğin Gece",
  mezuniyet: "Zirveye Çıktığın An",
  anma: "Sonsuza Dek Anımsanan",
};

export function resolvePosterHeadline(templateCategory: TemplateCategory | null | undefined): string {
  if (templateCategory) return POSTER_HEADLINE_BY_TEMPLATE[templateCategory];
  return "O Anın Gökyüzü";
}
