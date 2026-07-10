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
        void: "#041a40",
        "panel-navy": "#0c1445",
        brass: "#ffdb00",
        "brass-dim": "#cca000",
        parchment: "#f3ecda",
        "parchment-dim": "#e8dfc7",
        ink: "#2a2318",
        haze: "#87ceeb",
        text: "#ffffff",
        leather: "#3a2417",
        "leather-dk": "#241609",
        "leather-lt": "#4d3120",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
        body: ["var(--font-body)", "sans-serif"],
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
        "qr-glow": {
          "0%, 100%": { boxShadow: "0 0 0 rgba(201,168,106,0)" },
          "50%": { boxShadow: "0 0 22px rgba(201,168,106,0.45)" },
        },
        "bounce-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
        "voice-bar": {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        twinkle: "twinkle 4s ease-in-out infinite",
        "cover-in": "cover-in 900ms ease-out both",
        "qr-glow": "qr-glow 3.2s ease-in-out infinite",
        "bounce-y": "bounce-y 1.6s ease-in-out infinite",
        "voice-bar": "voice-bar 0.9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
