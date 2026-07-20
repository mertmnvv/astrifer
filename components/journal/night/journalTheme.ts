/**
 * Deri Defter'in renk seçenekleri.
 *
 * Üretimi basitleştirmek için yalnızca kapağın deri rengi değişir — iç
 * sayfalar (fon, yıldız haritası, yazı rengi, yaldız şeridi, arka kapak
 * mührü) her siparişte aynı sabit görünümü kullanır, tıpkı gerçek bir
 * ciltçinin tek bir kağıt/yaldız partisiyle çalışıp yalnızca dış deriyi
 * farklı renklerde tedarik etmesi gibi. `JOURNAL_INTERIOR` bu sabit
 * görünümü tutar; her `JournalTheme`, kendi `leather` alanı dışında
 * `JOURNAL_INTERIOR`'ı birebir paylaşır.
 */
export type JournalThemeId =
  | "navy-gold"
  | "warm-copper"
  | "plum-rose-gold"
  | "emerald-gold"
  | "crimson-copper"
  | "cosmic-purple-rose";

export interface JournalTheme {
  id: JournalThemeId;
  label: string;

  pageGround: string;
  edgeStripeGradient: string;

  leather: {
    gradientStops: [string, string, string, string];
    grainDark: string;
    grainLight: string;
    creaseStroke: string;
    sheenRgb: string;
    borderDashRgba: string;
  };

  starMap: {
    bgGradientStops: [string, string, string];
    dimStarColor: string;
    connectorLineRgba: string;
  };

  accentMetal: string;
  accentMetalDim: string;

  text: {
    body: string;
    bodyMuted: string;
    caption: string;
  };

  qrBacking: string;
  ruledLine: string;

  backCover: {
    borderDash: string;
    flapStroke: string;
    sealFill: string;
    sealStroke: string;
    sealCross: string;
    captionText: string;
  };
}

/** The single fixed interior look every cover color shares — sayfa içi, altın yaldız şeridi ve mühür her zaman bu. */
const JOURNAL_INTERIOR: Omit<JournalTheme, "id" | "label" | "leather"> = {
  pageGround: "#05060d",
  edgeStripeGradient: "linear-gradient(90deg,#a9832f,#fff3cf,#e8c974,#fff3cf,#a9832f)",
  starMap: {
    bgGradientStops: ["#152049", "#0d1533", "#080b20"],
    dimStarColor: "#cfd6ee",
    connectorLineRgba: "rgba(244,236,216,.18)",
  },
  accentMetal: "#e8c974",
  accentMetalDim: "#a9832f",
  text: { body: "#e9ecf6", bodyMuted: "#aab2d6", caption: "#f4ecd8" },
  qrBacking: "#f3ecda",
  ruledLine: "#212a4d",
  backCover: {
    borderDash: "#e6b877",
    flapStroke: "#a9832f",
    sealFill: "#e0a35c",
    sealStroke: "#c98a45",
    sealCross: "#2a2318",
    captionText: "#aab2d6",
  },
};

/** Only the deri (leather) color+grain per cover option — every other visual comes from JOURNAL_INTERIOR. */
const COVER_LEATHERS: Record<JournalThemeId, { label: string; leather: JournalTheme["leather"] }> = {
  "navy-gold": {
    label: "Gece Lacivert",
    leather: {
      gradientStops: ["#232c46", "#141a2c", "#0a0e1a", "#040609"],
      grainDark: "#000000",
      grainLight: "#3a4568",
      creaseStroke: "rgba(0,0,0,.18)",
      sheenRgb: "120,140,190",
      borderDashRgba: "rgba(232,201,116,.26)",
    },
  },
  "warm-copper": {
    label: "Kahve Kestane",
    leather: {
      gradientStops: ["#3d2a1a", "#22160c", "#120b06", "#070402"],
      grainDark: "#000000",
      grainLight: "#6b4a2c",
      creaseStroke: "rgba(0,0,0,.18)",
      sheenRgb: "200,150,90",
      borderDashRgba: "rgba(214,138,82,.28)",
    },
  },
  "plum-rose-gold": {
    label: "Mürdüm",
    leather: {
      gradientStops: ["#3a2230", "#1f121c", "#100910", "#070308"],
      grainDark: "#000000",
      grainLight: "#5a3548",
      creaseStroke: "rgba(0,0,0,.18)",
      sheenRgb: "190,130,150",
      borderDashRgba: "rgba(227,168,145,.28)",
    },
  },
  "emerald-gold": {
    label: "Zümrüt Yeşili",
    leather: {
      gradientStops: ["#0f3a2c", "#0a241b", "#05130d", "#020805"],
      grainDark: "#000000",
      grainLight: "#1c5c47",
      creaseStroke: "rgba(0,0,0,.18)",
      sheenRgb: "90,190,140",
      borderDashRgba: "rgba(34,197,94,.28)",
    },
  },
  "crimson-copper": {
    label: "Bordo",
    leather: {
      gradientStops: ["#451a1a", "#2b0f0f", "#170808", "#080202"],
      grainDark: "#000000",
      grainLight: "#6b2d2d",
      creaseStroke: "rgba(0,0,0,.18)",
      sheenRgb: "220,110,110",
      borderDashRgba: "rgba(239,68,68,.28)",
    },
  },
  "cosmic-purple-rose": {
    label: "Mor Kadife",
    leather: {
      gradientStops: ["#3b0764", "#220042", "#120024", "#07000e"],
      grainDark: "#000000",
      grainLight: "#5b21b6",
      creaseStroke: "rgba(0,0,0,.18)",
      sheenRgb: "180,100,220",
      borderDashRgba: "rgba(217,70,239,.28)",
    },
  },
};

export const JOURNAL_THEMES: Record<JournalThemeId, JournalTheme> = Object.fromEntries(
  (Object.keys(COVER_LEATHERS) as JournalThemeId[]).map((id) => [
    id,
    { id, label: COVER_LEATHERS[id].label, leather: COVER_LEATHERS[id].leather, ...JOURNAL_INTERIOR },
  ]),
) as Record<JournalThemeId, JournalTheme>;

export const PALETTE_TO_JOURNAL_THEME: Record<string, JournalThemeId> = {
  "gece-laciverti": "navy-gold",
  kehribar: "warm-copper",
  komur: "warm-copper",
  "gul-safagi": "plum-rose-gold",
  "gravur-atlas": "warm-copper",
  "kozmik-aurora": "emerald-gold",
  "kizil-bulut": "crimson-copper",
  "derin-mor": "cosmic-purple-rose",
};

export function getJournalTheme(themeOrPaletteId: string | null | undefined): JournalTheme {
  if (!themeOrPaletteId) return JOURNAL_THEMES["navy-gold"];
  if (themeOrPaletteId in JOURNAL_THEMES) {
    return JOURNAL_THEMES[themeOrPaletteId as JournalThemeId];
  }
  const themeId = PALETTE_TO_JOURNAL_THEME[themeOrPaletteId] ?? "navy-gold";
  return JOURNAL_THEMES[themeId];
}
