import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#020711",
        panel: "#071426",
        amber: "#5eead4",
        "amber-light": "#79f3df",
        "amber-deep": "#38bfae",
        rose: "#9a8cf0",
        parchment: "#eaf4ff",
        "parchment-dim": "#c7d8e8",
        ink: "#04101f",
        muted: "#b3c6da",
        subtle: "#9fb4ca",
        dim: "#7890a8",
        faint: "#536b82",
        text: "#edf7ff",
        bright: "#ffffff",
        leather: "#2b1e15",
        "leather-dk": "#150d07",
        "leather-lt": "#5a3c22",
        // Aurora / nebula theme (homepage-only redesign)
        nebula: "#020711",
        "nebula-soft": "#071426",
        "nebula-deep": "#01040b",
        iris: "#5eead4",
        "iris-light": "#79f3df",
        "iris-deep": "#38bfae",
        flare: "#9a8cf0",
        "flare-light": "#b6adff",
        glow: "#4ea8de",
        "glow-light": "#9dd2ff",
        // Gravur theme
        "gravur-paper": "#E4DFCD",
        "gravur-paper-dim": "#DAD3BC",
        "gravur-ink": "#241F19",
        "gravur-ink-soft": "#5C5646",
        "gravur-copper": "#8A5A3B",
        "gravur-verdigris": "#5C7A6B",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
        body: ["var(--font-body)", "sans-serif"],
        logo: ["var(--font-logo)", "serif"],
        "gravur-serif": ["var(--font-eb-garamond)", "serif"],
        "gravur-sc": ["var(--font-cormorant-sc)", "serif"],
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "1" },
        },
        "cover-in": {
          "0%": { opacity: "0", transform: "scale(0.96) translateY(10px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "bounce-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
        "voice-bar": {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "auto-scroll": {
          "0%, 12%": { transform: "translateY(0)" },
          "88%, 100%": { transform: "translateY(var(--auto-scroll-distance, -40%))" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "aurora-drift": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(4%, -6%) scale(1.08)" },
          "66%": { transform: "translate(-3%, 4%) scale(0.96)" },
        },
        "aurora-drift-slow": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-5%, 5%) scale(1.05)" },
        },
      },
      animation: {
        twinkle: "twinkle 4s ease-in-out infinite",
        "cover-in": "cover-in 900ms ease-out both",
        "bounce-y": "bounce-y 1.6s ease-in-out infinite",
        "voice-bar": "voice-bar 0.9s ease-in-out infinite",
        "logo-spin": "spin 14s linear infinite",
        "logo-spin-slow": "spin 16s linear infinite",
        "auto-scroll": "auto-scroll 18s ease-in-out infinite",
        "glow-pulse": "glow-pulse 6s ease-in-out infinite",
        "aurora-drift": "aurora-drift 22s ease-in-out infinite",
        "aurora-drift-slow": "aurora-drift-slow 30s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
