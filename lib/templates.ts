import type { TemplateCategory } from "@/types/firestore";

export interface TemplateOption {
  slug: string;
  name: string;
  category: TemplateCategory;
  description: string;
  /** Up to 3 example personal messages offered when this template is selected — see CreateForm.tsx. */
  exampleMessages: string[];
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
    exampleMessages: [
      "Sen doğduğunda gökyüzü tam olarak böyleydi.",
      "Dünyaya geldiğin an, yıldızlar da seninle doğdu.",
      "Bu gökyüzü, senin ilk nefesine tanıklık etti.",
    ],
  },
  {
    slug: "yildonumu",
    name: "Yıldönümü",
    category: "yildonumu",
    description: "Birlikte geçirdiğiniz o özel anın haritası.",
    exampleMessages: [
      "O gece gökyüzü buydu.",
      "Yıllar geçse de gökyüzü hep o geceyi hatırlıyor.",
      "Birlikte geçirdiğimiz o an, gökyüzüne böyle yazıldı.",
    ],
  },
  {
    slug: "teklif",
    name: "Evlilik Teklifi",
    category: "teklif",
    description: "Evet dediği anın gökyüzü.",
    exampleMessages: [
      "Bana evet dediğin an, gökyüzü buydu.",
      "Evet dediğin o saniye, gökyüzü de kutluyordu.",
      "O gece gökyüzü de bizimle birlikte evet dedi.",
    ],
  },
  {
    slug: "mezuniyet",
    name: "Mezuniyet",
    category: "mezuniyet",
    description: "Bir başarının kutlandığı anın haritası.",
    exampleMessages: [
      "Bu anın gökyüzü, senin başarının izi.",
      "Emeğinin karşılığını aldığın an, gökyüzü buydu.",
      "Bu gökyüzü, bugüne kadarki her adımının tanığı.",
    ],
  },
  {
    slug: "anma",
    name: "Anma",
    category: "anma",
    description: "Anılmaya değer bir anın gökyüzü.",
    exampleMessages: [
      "Seni sonsuza dek bu gökyüzünde taşıyoruz.",
      "Bu gökyüzü, seni hatırladığımız her an burada.",
      "Işığın, bu gökyüzündeki yıldızlar kadar kalıcı.",
    ],
  },
];
