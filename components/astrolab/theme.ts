// Mirrors tailwind.config.ts. Duplicated here because <canvas> drawing can't
// read Tailwind utility classes — keep the two in sync if tokens change.
export const ASTROLAB_THEME = {
  void: "#05060d",
  panelNavy: "#0d1330",
  brass: "#c9a86a",
  brassDim: "#8a7644",
  parchment: "#f3ecda",
  ink: "#2a2318",
  haze: "#8b93b8",
  text: "#e9ecf6",
} as const;
