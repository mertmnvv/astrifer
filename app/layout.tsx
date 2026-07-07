import type { Metadata } from "next";
import { Cormorant_Garamond, Space_Mono, Inter } from "next/font/google";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const monoFont = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
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
    <html lang="tr" className={`${displayFont.variable} ${monoFont.variable} ${bodyFont.variable}`}>
      <body className="bg-void text-text font-body antialiased">
        {children}
      </body>
    </html>
  );
}
