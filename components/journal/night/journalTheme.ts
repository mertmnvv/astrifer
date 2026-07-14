/**
 * Deri Defter'in 3 sabit renk teması — /create'te seçilen Gökyüzü Rengi'ne
 * (components/astrolab/palettes.ts) göre otomatik eşlenir, ayrıca
 * saklanmaz. "navy-gold" bugüne kadarki tek sabit tasarımın ("Modern
 * Gece + Altın") ta kendisi — değerleri hiç değişmedi.
 */
export type JournalThemeId = "navy-gold" | "warm-copper" | "plum-rose-gold";

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
};

const PALETTE_TO_JOURNAL_THEME: Record<string, JournalThemeId> = {
  "gece-laciverti": "navy-gold",
  kehribar: "warm-copper",
  komur: "warm-copper",
  "gul-safagi": "plum-rose-gold",
};

export function getJournalTheme(paletteId: string | null | undefined): JournalTheme {
  const themeId = PALETTE_TO_JOURNAL_THEME[paletteId ?? ""] ?? "navy-gold";
  return JOURNAL_THEMES[themeId];
}
