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
];

export const DEFAULT_SKY_PALETTE = SKY_PALETTES[0];

export function getSkyPalette(id: string | undefined): SkyPalette {
  return SKY_PALETTES.find((palette) => palette.id === id) ?? DEFAULT_SKY_PALETTE;
}
