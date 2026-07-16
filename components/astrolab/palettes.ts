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
    id: "kehribar",
    name: "Kehribar",
    description: "Kehribar ve is siyahı — sıcak, aydınlık yıldızlar.",
    skyCenter: "#2a1c0e",
    skyEdge: "#0a0603",
    star: "#fff2df",
    starGlowRgb: "242,198,126",
    moonLit: "#ffe9c8",
    moonDark: "#241708",
    sun: "#e6b877",
    label: "#c2a077",
    meteor: "#f2c67e",
  },
  {
    id: "gul-safagi",
    name: "Gül Şafağı",
    description: "Gece morumsu-kızılı ve gül tonlu yıldızlar.",
    skyCenter: "#2c1518",
    skyEdge: "#0c0607",
    star: "#ffe9e4",
    starGlowRgb: "226,154,144",
    moonLit: "#ffd9d2",
    moonDark: "#2c1518",
    sun: "#ffd7a8",
    label: "#c78f86",
    meteor: "#f2b6ac",
  },
  {
    id: "gece-laciverti",
    name: "Gece Laciverti",
    description: "Derin lacivert-siyah, serin çelik-mavi yıldızlar.",
    skyCenter: "#161c33",
    skyEdge: "#07070d",
    star: "#eef1fb",
    starGlowRgb: "157,182,232",
    moonLit: "#e9edfa",
    moonDark: "#161c33",
    sun: "#ffd88f",
    label: "#8fa3d1",
    meteor: "#c7d6f5",
  },
  {
    id: "komur",
    name: "Kömür",
    description: "Sıcak is-siyahı, kırık-beyaz yıldızlar.",
    skyCenter: "#1f1c17",
    skyEdge: "#080706",
    star: "#f2efe8",
    starGlowRgb: "207,201,189",
    moonLit: "#e9e5db",
    moonDark: "#1f1c17",
    sun: "#f0d9a3",
    label: "#a39d90",
    meteor: "#e5e0d4",
  },
  {
    id: "gravur-atlas",
    name: "Gravür Atlas",
    description: "Eskitme kağıt ve siyah mürekkep tonlarında antik harita.",
    skyCenter: "#E4DFCD",
    skyEdge: "#E4DFCD",
    star: "#241F19",
    starGlowRgb: "36,31,25",
    moonLit: "#241F19",
    moonDark: "#DAD3BC",
    sun: "#8A5A3B",
    label: "#5C5646",
    meteor: "#8A5A3B",
  },
  {
    id: "kozmik-aurora",
    name: "Kozmik Aurora",
    description: "Yeşil-mavi aurora ışıkları ve zümrüt pırıltılı yıldızlar.",
    skyCenter: "#081d24",
    skyEdge: "#02070a",
    star: "#e2f9f3",
    starGlowRgb: "131,237,204",
    moonLit: "#e0fcf5",
    moonDark: "#081d24",
    sun: "#ffd88f",
    label: "#6bb0a2",
    meteor: "#83edcc",
  },
  {
    id: "kizil-bulut",
    name: "Kızıl Bulut",
    description: "Karanlık uzayda parıldayan kızıl bulutsular ve ateş tonlarında yıldızlar.",
    skyCenter: "#2b0a0a",
    skyEdge: "#0d0303",
    star: "#fff0f0",
    starGlowRgb: "239,68,68",
    moonLit: "#ffe4e4",
    moonDark: "#2b0a0a",
    sun: "#f97316",
    label: "#c76e6e",
    meteor: "#ef4444",
  },
  {
    id: "derin-mor",
    name: "Derin Mor",
    description: "Derin kozmik morluklar ve menekşe tonlarında yıldızlar.",
    skyCenter: "#20092c",
    skyEdge: "#08020d",
    star: "#fbf2ff",
    starGlowRgb: "168,85,247",
    moonLit: "#f5e6ff",
    moonDark: "#20092c",
    sun: "#ffd88f",
    label: "#a48cbd",
    meteor: "#a885f7",
  },
];

export const DEFAULT_SKY_PALETTE = SKY_PALETTES[0];

export function getSkyPalette(id: string | undefined): SkyPalette {
  return SKY_PALETTES.find((palette) => palette.id === id) ?? DEFAULT_SKY_PALETTE;
}

export function getTimedPalette(palette: SkyPalette, hour?: number): SkyPalette {
  if (palette.id === "gravur-atlas") {
    return palette; // Keep vintage paper style intact
  }

  const h = hour !== undefined ? hour : new Date().getHours();

  // 1. Morning (06:00 - 10:00) - Deep Sunrise Rose
  if (h >= 6 && h < 10) {
    return {
      ...palette,
      skyCenter: "#3c1825",
      skyEdge: "#11070e",
      star: "#ffeae4",
      starGlowRgb: "235,140,165",
      meteor: "#eb8ca5",
    };
  }
  // 2. Daytime (10:00 - 18:00) - Soft Sky Blue
  if (h >= 10 && h < 18) {
    return {
      ...palette,
      skyCenter: "#a2d2df",
      skyEdge: "#245070",
      star: "#ffffff",
      starGlowRgb: "255,255,255",
      moonLit: "#ffffff",
      moonDark: "#789da8",
      sun: "#fff2a3",
      label: "#eef8fa",
      meteor: "#ffffff",
    };
  }
  // 3. Evening/Sunset (18:00 - 21:00) - Sunset Violet-Amber
  if (h >= 18 && h < 21) {
    return {
      ...palette,
      skyCenter: "#2d0f28",
      skyEdge: "#0a030f",
      star: "#ffeedf",
      starGlowRgb: "242,166,126",
      meteor: "#f2a67e",
    };
  }
  // 4. Night (21:00 - 06:00) - Keep the original dark mode palette intact
  return palette;
}
