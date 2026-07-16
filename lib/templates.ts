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
      "Hayatımızın en parlak yıldızı doğduğunda, gökyüzünün eşsiz tablosu buydu.",
      "Gelişinle dünyamızı aydınlattığın o ilk mucizevi anın gökyüzü.",
      "Yeryüzüne bir melek indiğinde, yukarıda parıldayan yıldızlar bunlardı.",
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
      "Sonsuzluğa giden yolculuğumuzun başladığı o büyülü gece gökyüzü.",
      "Kalbimin kalbine düğümlendiği, zamanın durduğu o eşsiz anın haritası.",
      "Seninle geçen her güne şükrederek, aşkımızın başladığı o gecenin yıldızları.",
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
      "Hayatımı hayatına kattığın o mucizevi evet fısıltısında gökyüzü.",
      "İki ruhun tek bir geleceğe söz verdiği o heyecan dolu saniyelerin haritası.",
      "Yollarımızı resmen birleştirdiğimiz o sonsuz imzadan önceki gökyüzü.",
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
      "Uykusuz gecelerin, verilen emeklerin ve ulaşılan o büyük zaferin gecesi.",
      "Yeni bir başlangıca adım atarken, geleceğinin parladığı o anın gökyüzü.",
      "Kendi hikayeni yazmaya başladığın o gurur dolu mezuniyet gününün yıldızları.",
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
      "Aramızdan ayrılan güzel ruhunun gökyüzündeki ebedi izi.",
      "Seni her özlediğimizde yukarı bakıp bulduğumuz o dingin gökyüzü.",
      "Bizimle bıraktığın sevgi dolu hatıraların göklerde parıldayan yansıması.",
    ],
  },
  {
    slug: "dugun",
    name: "Düğün",
    category: "dugun",
    description: "Hayatlarınızı birleştirdiğiniz o özel günün haritası.",
    exampleMessages: [
      "Hayatlarimizi birleştirdiğimiz, 'biz' olduğumuz o unutulmaz düğün günümüz.",
      "Bir ömür sürecek mutluluğumuza adım atarken üzerimizdeki gökyüzü buydu.",
      "Aşkımızın ve birlikteliğimizin tüm sevdiklerimiz önünde ilan edildiği o büyülü gece.",
      "Ruhlarımızın sonsuza dek mühürlendiği o ilk dansın gökyüzü haritası.",
      "Bir elmanın iki yarısı gibi, hayatlarımızı tek bir yolda birleştirdiğimiz o günün yıldızları.",
      "Sonsuz bir aşkla 'Evet' dediğimiz o kutlu anın gökyüzü.",
    ],
  },
];
