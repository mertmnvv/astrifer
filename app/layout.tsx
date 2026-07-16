import type { Metadata } from "next";
import { Instrument_Serif, JetBrains_Mono, Hanken_Grotesk, Spectral, EB_Garamond, Cormorant_SC } from "next/font/google";
import "./globals.css";

const displayFont = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const bodyFont = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const logoFont = Spectral({
  subsets: ["latin", "latin-ext"],
  weight: "500",
  style: ["normal", "italic"],
  variable: "--font-logo",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const cormorantSC = Cormorant_SC({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600"],
  variable: "--font-cormorant-sc",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://astrifer.com"),
  title: "Astrifer — Kişiye Özel Yıldız Haritası",
  description:
    "Doğduğunuz, tanıştığınız ya da hayatınızı değiştiren o anın gökyüzünü, gerçek astronomik verilerle kişiye özel bir yıldız haritasına dönüştürün.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${displayFont.variable} ${monoFont.variable} ${bodyFont.variable} ${logoFont.variable} ${ebGaramond.variable} ${cormorantSC.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-void text-text font-body antialiased">
        {children}
      </body>
    </html>
  );
}
