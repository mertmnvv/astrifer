// Mirrors the parchment/leather/brass tokens in tailwind.config.ts —
// duplicated because <canvas> drawing can't read Tailwind utility classes.
export const ATLAS_THEME = {
  parchment: "#f3ecda",
  parchmentDim: "#e8dfc7",
  ink: "#2a2318",
  brass: "#c9a86a",
  brassDim: "#8a7644",
  leather: "#3a2417",
  leatherDk: "#241609",
  leatherLt: "#4d3120",
} as const;
