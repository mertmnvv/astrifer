import type { TemplateCategory } from "@/types/firestore";

export type NebulaMood = "warm" | "cool" | "neutral";

/** Default nebula hue mood per memory type — user can always override in the configurator. */
export const DEFAULT_MOOD_BY_TEMPLATE: Record<TemplateCategory, NebulaMood> = {
  teklif: "warm",
  yildonumu: "warm",
  dogum: "neutral",
  anma: "neutral",
  mezuniyet: "cool",
};

export function resolveNebulaMood(
  templateCategory: TemplateCategory | null | undefined,
  override: NebulaMood | null | undefined,
): NebulaMood {
  if (override) return override;
  if (templateCategory) return DEFAULT_MOOD_BY_TEMPLATE[templateCategory];
  return "warm";
}
