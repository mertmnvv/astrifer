export interface SkyPalette {
  id: string;
  name: string;
  description: string;
  /** Background radial gradient: brighter center fading to the edge. Never pure black — kept soft on purpose. */
  skyCenter: string;
  skyEdge: string;
  star: string;
  /** "r,g,b" — interpolated into rgba(...) for the glow halo around bright stars. */
  starGlowRgb: string;
  moonLit: string;
  moonDark: string;
  sun: string;
  label: string;
  meteor: string;
}

export const SKY_PALETTES: SkyPalette[] = [
  {
    id: "gece-mavisi",
    name: "Gece Mavisi",
    description: "Koyu lacivert ve derin uzay renkleri.",
    skyCenter: "#0C1445",
    skyEdge: "#041A40",
    star: "#FFFFFF",
    starGlowRgb: "255,219,0",
    moonLit: "#FFFFFF",
    moonDark: "#0C1445",
    sun: "#FFDB00",
    label: "#87CEEB",
    meteor: "#FFFFFF",
  },
  {
    id: "murekkep-siyahi",
    name: "Mürekkep Siyahı",
    description: "Neredeyse gri-siyah, serin beyaz yıldızlar.",
    skyCenter: "#1c1f24",
    skyEdge: "#030304",
    star: "#f5f5f5",
    starGlowRgb: "255,255,255",
    moonLit: "#f0f0f0",
    moonDark: "#1c1f24",
    sun: "#ffe9b8",
    label: "#c9c9ce",
    meteor: "#ffffff",
  },
  {
    id: "ametist-alacakaranlik",
    name: "Ametist Alacakaranlık",
    description: "Mor-siyah, hafif sıcak beyaz yıldızlar.",
    skyCenter: "#2b1f4d",
    skyEdge: "#0a0714",
    star: "#f3ecff",
    starGlowRgb: "196,168,255",
    moonLit: "#efe4ff",
    moonDark: "#241a3d",
    sun: "#ffcf9e",
    label: "#cbb9ec",
    meteor: "#e6d6ff",
  },
  {
    id: "samanyolu-altini",
    name: "Samanyolu Altını",
    description: "Kehribar-siyah, altın-beyaz yıldızlar.",
    skyCenter: "#2a1f0e",
    skyEdge: "#08060a",
    star: "#fff3da",
    starGlowRgb: "255,214,140",
    moonLit: "#ffe9c2",
    moonDark: "#241a0c",
    sun: "#ffcf6b",
    label: "#d8b97c",
    meteor: "#ffd98a",
  },
];

export const DEFAULT_SKY_PALETTE = SKY_PALETTES[0];

export function getSkyPalette(id: string | undefined): SkyPalette {
  return SKY_PALETTES.find((palette) => palette.id === id) ?? DEFAULT_SKY_PALETTE;
}
