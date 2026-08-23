import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono, Manrope, Spectral, EB_Garamond, Cormorant_SC } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600"],
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

const bodyFont = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
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

const SITE_TITLE = "Hatırname — Kişiye Özel Canlı Gökyüzü ve Gökyüzü Cildi";
const SITE_DESCRIPTION =
  "Doğduğunuz, tanıştığınız ya da hayatınızı değiştiren o anın gökyüzünü, gerçek astronomik verilerle kişiye özel bir hediyeye dönüştürün. Kalıcı dijital sayfa ve el yapımı deri defter.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://astrifer.com"),
  title: {
    default: SITE_TITLE,
    template: "%s | Hatırname",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "yıldız haritası",
    "kişiye özel yıldız haritası",
    "zaman kapsülü",
    "doğum haritası hediyesi",
    "yıldönümü hediyesi",
    "sevgiliye özel hediye",
    "gökyüzü haritası hediye",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    siteName: "Hatırname",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
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
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
