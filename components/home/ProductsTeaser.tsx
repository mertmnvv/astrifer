"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { formatTRY } from "@/lib/pricing";
import type { PricingConfig } from "@/lib/pricingConfig";

// Original Components
import { StarChart } from "@/components/astrolab/StarChart";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { computeSky } from "@/lib/astronomy/computeSky";
import { NightCoverPage } from "@/components/journal/night/NightCoverPage";
import { JournalThemeProvider } from "@/components/journal/JournalThemeContext";
import { getJournalTheme } from "@/components/journal/night/journalTheme";

interface ProductFeature {
  text: string;
  iconKey: string;
}

interface ProductItem {
  id: "digital" | "journal";
  title: string;
  description: string;
  price: string;
  features: ProductFeature[];
  href: string;
  cta: string;
  badge?: string;
}

// Define PRODUCTS inside the component using pricing

const DIGITAL_STARS = [
  { top: "15%", left: "20%", size: 1.5, delay: "0.2s" },
  { top: "10%", left: "75%", size: 2, delay: "1.5s" },
  { top: "25%", left: "45%", size: 1, delay: "0.8s" },
  { top: "35%", left: "80%", size: 1.8, delay: "2.1s" },
  { top: "40%", left: "15%", size: 2.2, delay: "0.5s" },
  { top: "50%", left: "60%", size: 1.2, delay: "1.2s" },
  { top: "65%", left: "30%", size: 2, delay: "2.7s" },
  { top: "70%", left: "85%", size: 1.5, delay: "0.4s" },
  { top: "80%", left: "40%", size: 2.5, delay: "1.9s" },
  { top: "20%", left: "60%", size: 1.2, delay: "3.1s" },
];

function FeatureIcon({ iconKey }: { iconKey: string }) {
  const baseClass = "h-4 w-4 text-iris-light shrink-0";
  
  switch (iconKey) {
    case "web":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClass}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M2 12h20" />
        </svg>
      );
    case "mic":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClass}>
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      );
    case "music":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClass}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case "stars":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClass}>
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          <circle cx="18" cy="6" r="0.75" fill="currentColor" />
          <circle cx="6" cy="18" r="0.75" fill="currentColor" />
        </svg>
      );
    case "leather":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClass}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 6v11" />
        </svg>
      );
    case "gofre":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClass}>
          <circle cx="12" cy="12" r="7" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2.5 2.5M16.5 16.5L19 19M19 5l-2.5 2.5M7.5 16.5L5 19" />
        </svg>
      );
    case "gold":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClass}>
          <path d="m12 3-1.2 3.6L7.2 7.2l3.6 1.2L12 12l1.2-3.6 3.6-1.2-3.6-1.2L12 3Z" />
          <path d="M5 21h14M5 17h14M5 13h14" />
        </svg>
      );
    case "pages":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClass}>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      );
    case "gallery":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClass}>
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      );
    case "letter":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClass}>
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      );
    case "pen":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClass}>
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          <path d="M17 3l4 4" />
        </svg>
      );
    case "qr":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={baseClass}>
          <rect width="5" height="5" x="3" y="3" rx="1" />
          <rect width="5" height="5" x="16" y="3" rx="1" />
          <rect width="5" height="5" x="3" y="16" rx="1" />
          <path d="M21 16h-3a1 1 0 0 0-1 1v3" />
          <path d="M12 3h.01M12 12h.01M16 12h.01M21 12h.01M12 16h.01M12 21h.01" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={baseClass}>
          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

export function ProductsTeaser({ pricing }: { pricing: PricingConfig }) {
  const [activeTab, setActiveTab] = useState<"digital" | "journal">("digital");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const products: ProductItem[] = [
    {
      id: "digital",
      title: "Dijital Sayfa",
      description: "Kalıcı bağlantınız ve paylaşılabilir interaktif zaman kapsülü sayfanız.",
      price: formatTRY(pricing.digitalPrice),
      features: [
        { text: "Ömür boyu kalıcı web bağlantısı", iconKey: "web" },
        { text: "Ses kaydı & fotoğraf galerisi", iconKey: "mic" },
        { text: "Arka plan müzik desteği", iconKey: "music" },
        { text: "Canlı yıldız haritası simülasyonu", iconKey: "stars" },
      ],
      href: "/urun/dijital",
      cta: "Detayları Gör",
    },
    {
      id: "journal",
      title: "Deri Defter",
      description: "Kapağında size özel yıldız haritası, içinde anılarınız ve sizin satırlarınız.",
      price: formatTRY(pricing.journalPrice),
      features: [
        { text: "Premium suni deri, el işçiliği ciltleme", iconKey: "leather" },
        { text: "Özel gofre (sıcak baskı) kapak deseni", iconKey: "gofre" },
        { text: "Altın yaldızlı sayfa kenarı", iconKey: "gold" },
        { text: "15 sayfa boş/çizgili, 27 sayfalık kitap", iconKey: "pages" },
        { text: "Birlikte Anılarımız fotoğraf sayfası (4 foto)", iconKey: "gallery" },
        { text: "Gelecek Mektubu — ileri tarihe mühürlü mektup", iconKey: "letter" },
        { text: "Hediye altın renkli kalem", iconKey: "pen" },
        { text: "Gömülü akıllı QR kod bağlantısı", iconKey: "qr" },
      ],
      href: "/urun/defter",
      cta: "Detayları Gör",
      badge: "Popüler",
    },
  ];

  // Demo sky configuration matching /urun/dijital "Kehribar" theme
  const sky = computeSky({
    date: new Date("2024-02-14T21:00:00.000Z"),
    latitude: 41.0082,
    longitude: 28.9784,
  });
  const activePalette = getSkyPalette("kehribar");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = e.clientX - rect.left - width / 2;
    const y = e.clientY - rect.top - height / 2;
    
    // Max tilt angles
    const maxRotate = 12;
    const rotateX = -(y / (height / 2)) * maxRotate;
    const rotateY = (x / (width / 2)) * maxRotate;
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const selectedProduct = products.find((p) => p.id === activeTab)!;

  return (
    <section id="urunler" className="scroll-mt-20 px-4 py-24 sm:px-8 bg-nebula relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-iris/10 to-flare/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-5xl">
        <RevealOnScroll>
          <HomeSectionHeading eyebrow="Koleksiyon" title="Dijital, ya da elle tutulur." />
        </RevealOnScroll>

        <div className="mt-16 grid gap-12 lg:grid-cols-12 items-center">
          
          {/* LEFT PANEL: Interactive Product Preview (5 columns) */}
          <div className="lg:col-span-5 flex items-center justify-center min-h-[480px] relative select-none">
            <AnimatePresence mode="wait">
              {activeTab === "digital" ? (
                <motion.div
                  key="digital"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -15 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="relative"
                >
                  {/* Glowing background behind card */}
                  <div
                    className="absolute -inset-4 rounded-[40px] blur-xl -z-10"
                    style={{
                      background: `radial-gradient(circle, ${activePalette.skyCenter}40 0%, transparent 70%)`,
                    }}
                  />

                  {/* Page Preview Card (no device chrome) */}
                  <div className="relative w-[260px] h-[520px] rounded-[28px] border border-iris/25 bg-[#0b0810] shadow-[0_20px_50px_rgba(0,0,0,0.8)] ring-1 ring-white/10 flex flex-col overflow-hidden">

                    {/* Plaque header instead of a notch */}
                    <div className="absolute top-0 left-0 right-0 h-8 z-30 flex items-center justify-center gap-2 pointer-events-none">
                      <span className="h-px w-6 bg-iris/30" />
                      <span className="font-mono text-[6px] uppercase tracking-[0.3em] text-iris-light/70">
                        Dijital Sayfa
                      </span>
                      <span className="h-px w-6 bg-flare/30" />
                    </div>

                    {/* Fixed Background Layer inside card */}
                    <div className="absolute inset-0 -z-10 pointer-events-none">
                      {/* Background Star Chart */}
                      <div aria-hidden className="absolute inset-0 opacity-95 pointer-events-none">
                        <StarChart
                          sky={sky}
                          label=""
                          className="h-full w-full object-cover"
                          palette={activePalette}
                          showLabels={false}
                        />
                      </div>
                      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(11,8,16,0.15)_0%,rgba(11,8,16,0.65)_70%,#0b0810_100%)]" />
                      
                      {/* Twinkling stars */}
                      {DIGITAL_STARS.map((star, idx) => (
                        <div
                          key={idx}
                          className="absolute rounded-full bg-bright animate-twinkle"
                          style={{
                            top: star.top,
                            left: star.left,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                            animationDelay: star.delay,
                            animationDuration: "3.5s"
                          }}
                        />
                      ))}
                      {/* Shooting stars */}
                      <div className="absolute top-[-10px] right-[-10px] w-[1.5px] h-[60px] bg-gradient-to-b from-bright to-transparent animate-shooting-1 opacity-0 pointer-events-none" />
                      <div className="absolute top-[80px] right-[-40px] w-[1.5px] h-[50px] bg-gradient-to-b from-bright to-transparent animate-shooting-2 opacity-0 pointer-events-none" />
                    </div>

                    {/* Auto-scrolling content — no click/scroll needed to see it */}
                    <div className="flex-1 overflow-hidden pt-10 pb-4 px-3 relative text-left bg-transparent">
                    <div
                      className="space-y-6 select-none animate-auto-scroll"
                      style={{ "--auto-scroll-distance": "-42%" } as React.CSSProperties}
                    >

                      {/* Title block */}
                      <div className="text-center pt-2 flex flex-col items-center">
                        <span className="h-0.5 w-5 rounded bg-amber/50" />
                        <h3 className="mt-2.5 font-display text-sm italic text-bright leading-tight max-w-[170px] mx-auto">
                          Elif & Kaan
                        </h3>
                        <p className="mt-1 font-mono text-[7px] uppercase tracking-widest text-amber">
                          14 Şubat 2024 · 21:00
                        </p>
                        <p className="mt-0.5 font-mono text-[6px] text-dim">
                          İSTANBUL, TÜRKİYE
                        </p>
                      </div>

                      {/* Star Medallion */}
                      <div className="flex flex-col items-center">
                        <div className="relative aspect-square w-40 rounded-full p-1 bg-void/50 backdrop-blur-sm border border-amber/30 shadow-[0_0_20px_rgba(230,184,119,0.15)]">
                          <div className="h-full w-full rounded-full overflow-hidden relative">
                            <StarChart
                              sky={sky}
                              label=""
                              className="h-full w-full"
                              palette={activePalette}
                              showLabels={false}
                            />
                          </div>
                        </div>
                        <div className="mt-3 text-center px-2 max-w-[180px]">
                          <p className="font-display text-[9px] italic leading-relaxed text-subtle">
                            &ldquo;Yıllar geçse de gökyüzü hep o geceyi hatırlıyor. Seni çok seviyorum.&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* Star Key Legend */}
                      <div className="mx-1 p-2.5 rounded-xl bg-void/75 backdrop-blur-sm text-center border border-amber/20">
                        <h5 className="font-mono text-[6px] uppercase tracking-widest text-amber">
                          Yıldız Anahtarı
                        </h5>
                        <div className="mt-1.5 space-y-1 text-left max-w-[140px] mx-auto text-[6px] font-mono text-muted">
                          <div className="flex justify-between border-b border-text/5 pb-0.5">
                            <span>01. Sirius (Akyıldız)</span>
                            <span className="text-amber">★ -1.46 mag</span>
                          </div>
                          <div className="flex justify-between border-b border-text/5 pb-0.5">
                            <span>02. Vega</span>
                            <span className="text-amber">★ 0.03 mag</span>
                          </div>
                          <div className="flex justify-between">
                            <span>03. Altair</span>
                            <span className="text-amber">★ 0.76 mag</span>
                          </div>
                        </div>
                      </div>

                      {/* First Moment Photo */}
                      <div className="flex flex-col items-center">
                        <div className="w-28 overflow-hidden bg-[#fdfaf1] p-1 pb-2 shadow-lg shadow-black/40 rotate-[1.5deg]">
                          <div className="w-full aspect-square bg-[#eceae1] overflow-hidden rounded-sm relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&auto=format&fit=crop&q=80"
                              alt="Örnek anı"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="mt-1 text-center font-display text-[7px] italic text-ink">
                            O Özel An
                          </p>
                        </div>
                      </div>

                      {/* Voice Record player box */}
                      <div className="mx-1 p-2 rounded-xl bg-void/75 backdrop-blur-sm flex items-center justify-between border border-amber/20">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full flex items-center justify-center bg-amber/10 text-amber">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-2.5 w-2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                            </svg>
                          </div>
                          <div className="text-[6.5px] font-mono text-muted">Sesli_Kapsul.mp3</div>
                        </div>
                        <div className="text-[6.5px] font-mono text-amber">0:45</div>
                      </div>

                    </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="journal"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -15 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="flex items-center justify-center w-full"
                >
                  {/* Mouse interaction zone */}
                  <div
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onMouseEnter={() => setIsHovered(true)}
                    className="relative cursor-pointer py-10 px-8"
                  >
                    
                    {/* 3D Journal Book Wrapper */}
                    <div
                      className="w-[260px] h-[370px] relative rounded-r-[18px] select-none shadow-[10px_15px_35px_rgba(0,0,0,0.7)] overflow-hidden"
                      style={{
                        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`,
                        transition: isHovered ? "transform 0.05s ease-out" : "transform 0.5s ease-out",
                        transformStyle: "preserve-3d",
                      }}
                    >
                      {/* Original NightCoverPage canvas and leather texture */}
                      <JournalThemeProvider theme={getJournalTheme("gece-laciverti")}>
                        <NightCoverPage names="Elif & Kaan" widthPx={260} heightPx={370} />
                      </JournalThemeProvider>

                      {/* Golden Pages Block Highlight (Right Side Edge) */}
                      <div className="absolute right-0 top-[4px] bottom-[4px] w-[5px] bg-gradient-to-r from-[#ffe4be] via-[#e6b877] to-[#8d622a] rounded-r-sm border-l border-amber/15 shadow-md z-20 pointer-events-none" />

                      {/* Silk Bookmark Ribbon */}
                      <div className="w-2.5 h-14 bg-gradient-to-b from-amber-deep to-amber/80 absolute bottom-0 right-7 shadow-md rounded-b-sm border-t border-black/10 z-20 pointer-events-none" />
                      
                      {/* Moving Glint Light Highlight */}
                      <div
                        className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-30"
                        style={{
                          background: `radial-gradient(circle 120px at ${tilt.y * -3 + 130}px ${tilt.x * 3 + 185}px, rgba(251, 246, 238, 0.1) 0%, rgba(251, 246, 238, 0) 80%)`,
                          opacity: isHovered ? 1 : 0,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT PANEL: Product Selector & Dynamic Details (7 columns) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            
            {/* Tab/Segment Control */}
            <div className="flex bg-text/[0.03] border border-text/10 rounded-full p-1 max-w-[270px] self-center lg:self-start mb-6 select-none relative">
              {products.map((product) => {
                const isSelected = activeTab === product.id;
                return (
                  <button
                    key={product.id}
                    onClick={() => setActiveTab(product.id)}
                    className={`relative px-5 py-2.5 rounded-full font-mono text-[9px] uppercase tracking-widest transition-colors duration-300 z-10 flex-1 text-center ${
                      isSelected ? "text-white font-bold" : "text-subtle hover:text-text"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeProductTab"
                        className="absolute inset-0 bg-gradient-to-br from-iris to-flare rounded-full -z-10 shadow-sm"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    {product.title}
                  </button>
                );
              })}
            </div>

            {/* Product Details Area with Transitions */}
            <div className="min-h-[360px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex-1 flex flex-col justify-between"
                >
                  <div>
                    {/* Badge & Title */}
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-3xl sm:text-4xl italic text-text">{selectedProduct.title}</h3>
                      {selectedProduct.badge && (
                        <span className="rounded-full bg-gradient-to-br from-iris to-flare px-2.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-widest text-white select-none">
                          {selectedProduct.badge}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="mt-4 text-xs sm:text-[13px] leading-relaxed text-subtle max-w-xl">
                      {selectedProduct.description}
                    </p>

                    {/* Features Grid (2 Columns) */}
                    <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 border-t border-text/10 pt-6">
                      {selectedProduct.features.map((feat) => (
                        <li
                          key={feat.text}
                          className="flex items-start gap-3 text-xs sm:text-[13px] text-muted leading-snug group"
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-text/[0.03] border border-text/5 group-hover:border-amber/30 transition-colors duration-300">
                            <FeatureIcon iconKey={feat.iconKey} />
                          </div>
                          <span className="mt-0.5">{feat.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price & CTA Panel Footer */}
                  <div className="mt-8 flex flex-row items-center justify-between bg-text/[0.02] border border-text/10 rounded-2xl p-4 sm:p-5 select-none shadow-lg">
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim">Fiyat</span>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        {activeTab === "digital" ? (
                          pricing.digitalOriginalPrice > pricing.digitalPrice ? (
                            <>
                              <span className="font-mono text-xs line-through text-dim">
                                {formatTRY(pricing.digitalOriginalPrice)}
                              </span>
                              <span className="font-mono text-lg sm:text-xl font-medium text-iris-light font-semibold">
                                {formatTRY(pricing.digitalPrice)}
                              </span>
                              <span className="rounded bg-green-500/10 px-1.5 py-0.5 font-mono text-[8px] font-bold text-green-400">
                                %{Math.round(((pricing.digitalOriginalPrice - pricing.digitalPrice) / pricing.digitalOriginalPrice) * 100)} İNDİRİM
                              </span>
                            </>
                          ) : (
                            <span className="font-mono text-lg sm:text-xl font-medium text-iris-light font-semibold">
                              {formatTRY(pricing.digitalPrice)}
                            </span>
                          )
                        ) : (
                          pricing.journalOriginalPrice > pricing.journalPrice ? (
                            <>
                              <span className="font-mono text-xs line-through text-dim">
                                {formatTRY(pricing.journalOriginalPrice)}
                              </span>
                              <span className="font-mono text-lg sm:text-xl font-medium text-iris-light font-semibold">
                                {formatTRY(pricing.journalPrice)}
                              </span>
                              <span className="rounded bg-green-500/10 px-1.5 py-0.5 font-mono text-[8px] font-bold text-green-400">
                                %{Math.round(((pricing.journalOriginalPrice - pricing.journalPrice) / pricing.journalOriginalPrice) * 100)} İNDİRİM
                              </span>
                            </>
                          ) : (
                            <span className="font-mono text-lg sm:text-xl font-medium text-iris-light font-semibold">
                              {formatTRY(pricing.journalPrice)}
                            </span>
                          )
                        )}
                      </div>
                    </div>

                    <Link
                      href={selectedProduct.href}
                      className="relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-iris to-flare px-6 sm:px-8 py-3 sm:py-3.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-white transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-md group font-bold"
                    >
                      {/* Button glint */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                      <span className="relative">{selectedProduct.cta}</span>
                    </Link>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
