import type { TemplateCategory } from "@/types/firestore";

export interface TemplateOption {
  slug: string;
  name: string;
  category: TemplateCategory;
  description: string;
  defaultMessage: string;
}

/**
 * Mirrors scripts/seed-firestore.mjs. Used whenever the Firestore
 * `templates` collection can't be reached (no project configured yet, or a
 * transient error) so /create still renders a full template picker.
 */
export const FALLBACK_TEMPLATES: TemplateOption[] = [
  {
    slug: "dogum",
    name: "Doğum",
    category: "dogum",
    description: "Bir hayatın başladığı anın gökyüzü.",
    defaultMessage: "Sen doğduğunda gökyüzü tam olarak böyleydi.",
  },
  {
    slug: "yildonumu",
    name: "Yıldönümü",
    category: "yildonumu",
    description: "Birlikte geçirdiğiniz o özel anın haritası.",
    defaultMessage: "O gece gökyüzü buydu.",
  },
  {
    slug: "teklif",
    name: "Evlilik Teklifi",
    category: "teklif",
    description: "Evet dediği anın gökyüzü.",
    defaultMessage: "Bana evet dediğin an, gökyüzü buydu.",
  },
  {
    slug: "mezuniyet",
    name: "Mezuniyet",
    category: "mezuniyet",
    description: "Bir başarının kutlandığı anın haritası.",
    defaultMessage: "Bu anın gökyüzü, senin başarının izi.",
  },
  {
    slug: "anma",
    name: "Anma",
    category: "anma",
    description: "Anılmaya değer bir anın gökyüzü.",
    defaultMessage: "Seni sonsuza dek bu gökyüzünde taşıyoruz.",
  },
];
