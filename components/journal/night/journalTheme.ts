/**
 * Deri Defter'in renk temaları — /create'te seçilen Gökyüzü Rengi'ne
 * (components/astrolab/palettes.ts) göre otomatik eşlenir, ayrıca kullanıcı
 * tarafından serbestçe özelleştirilebilir.
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

export const JOURNAL_THEMES: Record<JournalThemeId, JournalTheme> = {
  "navy-gold": {
    id: "navy-gold",
    label: "Modern Gece + Altın",
    pageGround: "#05060d",
    edgeStripeGradient: "linear-gradient(90deg,#a9832f,#fff3cf,#e8c974,#fff3cf,#a9832f)",
    leather: {
      gradientStops: ["#232c46", "#141a2c", "#0a0e1a", "#040609"],
      grainDark: "#000000",
      grainLight: "#3a4568",
      creaseStroke: "rgba(0,0,0,.18)",
      sheenRgb: "120,140,190",
      borderDashRgba: "rgba(232,201,116,.26)",
    },
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
  },
  "warm-copper": {
    id: "warm-copper",
    label: "Sıcak Gece + Bakır",
    pageGround: "#0c0705",
    edgeStripeGradient: "linear-gradient(90deg,#8a5326,#fbe4c4,#d68a52,#fbe4c4,#8a5326)",
    leather: {
      gradientStops: ["#3d2a1a", "#22160c", "#120b06", "#070402"],
      grainDark: "#000000",
      grainLight: "#6b4a2c",
      creaseStroke: "rgba(0,0,0,.18)",
      sheenRgb: "200,150,90",
      borderDashRgba: "rgba(214,138,82,.28)",
    },
    starMap: {
      bgGradientStops: ["#2a2013", "#1a140b", "#0a0705"],
      dimStarColor: "#f0e4d2",
      connectorLineRgba: "rgba(244,236,216,.18)",
    },
    accentMetal: "#d68a52",
    accentMetalDim: "#8a5326",
    text: { body: "#f2ece2", bodyMuted: "#c9b8a0", caption: "#f5e6d0" },
    qrBacking: "#f0e2c8",
    ruledLine: "#2e2013",
    backCover: {
      borderDash: "#d68a52",
      flapStroke: "#8a5326",
      sealFill: "#c97a3f",
      sealStroke: "#a8632f",
      sealCross: "#241a10",
      captionText: "#c9b8a0",
    },
  },
  "plum-rose-gold": {
    id: "plum-rose-gold",
    label: "Mürdüm Gece + Gül Altını",
    pageGround: "#0c0508",
    edgeStripeGradient: "linear-gradient(90deg,#a66b5c,#fbe0e0,#e3a891,#fbe0e0,#a66b5c)",
    leather: {
      gradientStops: ["#3a2230", "#1f121c", "#100910", "#070308"],
      grainDark: "#000000",
      grainLight: "#5a3548",
      creaseStroke: "rgba(0,0,0,.18)",
      sheenRgb: "190,130,150",
      borderDashRgba: "rgba(227,168,145,.28)",
    },
    starMap: {
      bgGradientStops: ["#3a1722", "#210f16", "#0f0609"],
      dimStarColor: "#f5dcdb",
      connectorLineRgba: "rgba(244,236,216,.18)",
    },
    accentMetal: "#e3a891",
    accentMetalDim: "#a66b5c",
    text: { body: "#f5e9e6", bodyMuted: "#c9a8ac", caption: "#f5e0dc" },
    qrBacking: "#f2e2de",
    ruledLine: "#2e1a20",
    backCover: {
      borderDash: "#e3a891",
      flapStroke: "#a66b5c",
      sealFill: "#d68f8a",
      sealStroke: "#b06f68",
      sealCross: "#241014",
      captionText: "#c9a8ac",
    },
  },
  "emerald-gold": {
    id: "emerald-gold",
    label: "Zümrüt Gece + Yeşil Altın",
    pageGround: "#030807",
    edgeStripeGradient: "linear-gradient(90deg,#15803d,#bbf7d0,#22c55e,#bbf7d0,#15803d)",
    leather: {
      gradientStops: ["#0f3a2c", "#0a241b", "#05130d", "#020805"],
      grainDark: "#000000",
      grainLight: "#1c5c47",
      creaseStroke: "rgba(0,0,0,.18)",
      sheenRgb: "90,190,140",
      borderDashRgba: "rgba(34,197,94,.28)",
    },
    starMap: {
      bgGradientStops: ["#0f3026", "#0a2019", "#05100c"],
      dimStarColor: "#d1fae5",
      connectorLineRgba: "rgba(209,250,229,.18)",
    },
    accentMetal: "#22c55e",
    accentMetalDim: "#15803d",
    text: { body: "#ecfdf5", bodyMuted: "#a7f3d0", caption: "#d1fae5" },
    qrBacking: "#e6fcf4",
    ruledLine: "#0f3026",
    backCover: {
      borderDash: "#22c55e",
      flapStroke: "#15803d",
      sealFill: "#16a34a",
      sealStroke: "#14532d",
      sealCross: "#05130d",
      captionText: "#a7f3d0",
    },
  },
  "crimson-copper": {
    id: "crimson-copper",
    label: "Kızıl Gece + Antik Bakır",
    pageGround: "#0a0303",
    edgeStripeGradient: "linear-gradient(90deg,#991b1b,#fecaca,#ef4444,#fecaca,#991b1b)",
    leather: {
      gradientStops: ["#451a1a", "#2b0f0f", "#170808", "#080202"],
      grainDark: "#000000",
      grainLight: "#6b2d2d",
      creaseStroke: "rgba(0,0,0,.18)",
      sheenRgb: "220,110,110",
      borderDashRgba: "rgba(239,68,68,.28)",
    },
    starMap: {
      bgGradientStops: ["#3b1111", "#240b0b", "#120505"],
      dimStarColor: "#fee2e2",
      connectorLineRgba: "rgba(254,226,226,.18)",
    },
    accentMetal: "#ef4444",
    accentMetalDim: "#991b1b",
    text: { body: "#fef2f2", bodyMuted: "#fca5a5", caption: "#fee2e2" },
    qrBacking: "#fdeeed",
    ruledLine: "#3b1111",
    backCover: {
      borderDash: "#ef4444",
      flapStroke: "#991b1b",
      sealFill: "#dc2626",
      sealStroke: "#7f1d1d",
      sealCross: "#170808",
      captionText: "#fca5a5",
    },
  },
  "cosmic-purple-rose": {
    id: "cosmic-purple-rose",
    label: "Kozmik Mor + Gül Altını",
    pageGround: "#07030a",
    edgeStripeGradient: "linear-gradient(90deg,#701a75,#f5d0f9,#d946ef,#f5d0f9,#701a75)",
    leather: {
      gradientStops: ["#3b0764", "#220042", "#120024", "#07000e"],
      grainDark: "#000000",
      grainLight: "#5b21b6",
      creaseStroke: "rgba(0,0,0,.18)",
      sheenRgb: "180,100,220",
      borderDashRgba: "rgba(217,70,239,.28)",
    },
    starMap: {
      bgGradientStops: ["#32074f", "#1c042e", "#0e0217"],
      dimStarColor: "#f5e3fc",
      connectorLineRgba: "rgba(245,227,252,.18)",
    },
    accentMetal: "#d946ef",
    accentMetalDim: "#701a75",
    text: { body: "#faf5ff", bodyMuted: "#e9d5ff", caption: "#f5e3fc" },
    qrBacking: "#f7effc",
    ruledLine: "#32074f",
    backCover: {
      borderDash: "#d946ef",
      flapStroke: "#701a75",
      sealFill: "#c084fc",
      sealStroke: "#581c87",
      sealCross: "#120024",
      captionText: "#e9d5ff",
    },
  },
};

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
