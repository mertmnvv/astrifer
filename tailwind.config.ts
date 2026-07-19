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
        void: "#0b0810",
        panel: "#15101a",
        amber: "#e6b877",
        "amber-light": "#f2c67e",
        "amber-deep": "#e0a35c",
        rose: "#e29a90",
        parchment: "#f3ecda",
        "parchment-dim": "#e8dfc7",
        ink: "#2a2318",
        muted: "#c8bcae",
        subtle: "#a99e92",
        dim: "#8a7f72",
        faint: "#6f665d",
        text: "#f4ede3",
        bright: "#fbf6ee",
        leather: "#2b1e15",
        "leather-dk": "#150d07",
        "leather-lt": "#5a3c22",
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
      },
      animation: {
        twinkle: "twinkle 4s ease-in-out infinite",
        "cover-in": "cover-in 900ms ease-out both",
        "bounce-y": "bounce-y 1.6s ease-in-out infinite",
        "voice-bar": "voice-bar 0.9s ease-in-out infinite",
        "logo-spin": "spin 14s linear infinite",
        "logo-spin-slow": "spin 16s linear infinite",
        "auto-scroll": "auto-scroll 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
