"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { StarChart } from "@/components/astrolab/StarChart";
import { DEFAULT_SKY_PALETTE } from "@/components/astrolab/palettes";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";

export interface HeroProps {
  sky: ComputeSkyResult;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Hero({ sky }: HeroProps) {
  const reducedMotion = usePrefersReducedMotion();
  const palette = DEFAULT_SKY_PALETTE;

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-12 pt-28 text-center sm:px-8 select-none bg-void">
      <style>{`
        @keyframes spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-ccw {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-cw {
          animation: spin-cw 180s linear infinite;
        }
        .animate-spin-ccw {
          animation: spin-ccw 240s linear infinite;
        }
        .animate-spin-ccw-slow {
          animation: spin-ccw 360s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-spin-cw, .animate-spin-ccw, .animate-spin-ccw-slow {
            animation: none !important;
          }
        }
      `}</style>
      
      {/* BACKGROUND ASTROLABE ASSEMBLY */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden -z-10">
        <div className="relative flex items-center justify-center w-[340px] h-[340px] sm:w-[540px] sm:h-[540px] lg:w-[640px] lg:h-[640px]">
          
          {/* Radial Ambient Glow Behind Astrolabe */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber/5 via-amber/[0.02] to-transparent blur-3xl" />

          {/* 1. StarChart Medallion (Centerpiece, Interactive if hovered or clicked) */}
          <div className="absolute w-[240px] h-[240px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px] rounded-full overflow-hidden border border-amber/15 shadow-[0_0_60px_rgba(230,163,92,0.08)] pointer-events-auto bg-void/90">
            <StarChart
              sky={sky}
              label="Örnek gökyüzü haritası"
              palette={palette}
              showLabels={false}
              interactive={true}
              showControls={false}
              className="h-full w-full opacity-65 scale-[1.03]"
            />
          </div>

          {/* 2. Outer Astrolabe Ring (Dotted scales, Rotates CCW slowly) */}
          <div className="absolute w-full h-full flex items-center justify-center animate-spin-ccw">
            <svg viewBox="0 0 100 100" className="w-[330px] h-[330px] sm:w-[525px] sm:h-[525px] lg:w-[620px] lg:h-[620px]">
              <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(230,163,92,0.14)" strokeWidth="0.4" strokeDasharray="1.5 2.5" />
              <circle cx="50" cy="50" r="47.8" fill="none" stroke="rgba(230,163,92,0.06)" strokeWidth="0.2" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(230,163,92,0.08)" strokeWidth="0.4" strokeDasharray="0.3 6" />
            </svg>
          </div>

          {/* 3. Middle Astrolabe Ring (Pills, Degrees & Compass Points, Rotates CW) */}
          <div className="absolute w-full h-full flex items-center justify-center animate-spin-cw">
            <svg viewBox="0 0 100 100" className="w-[290px] h-[290px] sm:w-[460px] sm:h-[460px] lg:w-[540px] lg:h-[540px]">
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(230,163,92,0.22)" strokeWidth="0.8" strokeDasharray="4 20" />
              <circle cx="50" cy="50" r="47.2" fill="none" stroke="rgba(230,163,92,0.12)" strokeWidth="0.2" />
              
              {/* Compass Directions */}
              <text x="50" y="6.2" textAnchor="middle" className="fill-amber/60 font-mono text-[3.8px] font-bold tracking-widest uppercase">N</text>
              <text x="94" y="51.3" textAnchor="middle" className="fill-amber/60 font-mono text-[3.8px] font-bold tracking-widest uppercase">E</text>
              <text x="50" y="96.5" textAnchor="middle" className="fill-amber/60 font-mono text-[3.8px] font-bold tracking-widest uppercase">S</text>
              <text x="6" y="51.3" textAnchor="middle" className="fill-amber/60 font-mono text-[3.8px] font-bold tracking-widest uppercase">W</text>
              
              {/* Subtle Degree Markers */}
              <text x="72" y="16.5" textAnchor="middle" className="fill-amber/25 font-mono text-[2.2px] rotate-[45deg] origin-[50px_50px]">45°</text>
              <text x="83.5" y="73.5" textAnchor="middle" className="fill-amber/25 font-mono text-[2.2px] rotate-[135deg] origin-[50px_50px]">135°</text>
              <text x="28" y="83.5" textAnchor="middle" className="fill-amber/25 font-mono text-[2.2px] rotate-[225deg] origin-[50px_50px]">225°</text>
              <text x="16.5" y="28" textAnchor="middle" className="fill-amber/25 font-mono text-[2.2px] rotate-[315deg] origin-[50px_50px]">315°</text>
            </svg>
          </div>

          {/* 4. Inner Fine Ring (Tick lines, Rotates CCW very slowly) */}
          <div className="absolute w-full h-full flex items-center justify-center animate-spin-ccw-slow">
            <svg viewBox="0 0 100 100" className="w-[260px] h-[260px] sm:w-[415px] sm:h-[415px] lg:w-[480px] lg:h-[480px]">
              <circle cx="50" cy="50" r="49.2" fill="none" stroke="rgba(230,163,92,0.35)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(230,163,92,0.05)" strokeWidth="2.5" />
            </svg>
          </div>

        </div>
      </div>

      {/* Ambient Gradient overlay to darken edges */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(11,8,16,0.35)_0%,rgba(11,8,16,0.7)_60%,#0b0810_100%)] pointer-events-none" />

      {/* FLOATING ASTRONOMICAL COORDINATES */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute left-[8%] top-[22%] font-mono text-[9px] tracking-[0.25em] text-dim select-none">
          RA 14h 15m 39.7s <br />
          DEC +19° 10′ 56″
        </div>
        <div className="absolute right-[8%] top-[25%] font-mono text-[9px] tracking-[0.25em] text-dim text-right select-none">
          ALT +42.15° <br />
          AZ 198.34° (SSW)
        </div>
        <div className="absolute left-[10%] bottom-[20%] font-mono text-[9px] tracking-[0.25em] text-dim select-none">
          LAT 41.0082° N <br />
          LON 28.9784° E
        </div>
        <div className="absolute right-[10%] bottom-[22%] font-mono text-[9px] tracking-[0.25em] text-dim text-right select-none">
          JD 2461238.29 <br />
          EPOCH J2000.0
        </div>
      </div>

      {/* GLASSMORPHIC OVERLAY CONTENT CARD */}
      <motion.div
        variants={containerVariants}
        initial={reducedMotion ? "show" : "hidden"}
        animate="show"
        className="relative z-10 w-full max-w-[92%] sm:max-w-[440px] lg:max-w-[480px] rounded-3xl border border-amber/15 bg-void/50 px-6 py-8 sm:px-10 sm:py-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl flex flex-col items-center group hover:border-amber/25 transition-colors duration-500"
      >
        {/* Subtle decorative corners inside the glass card */}
        <div className="absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t border-l border-amber/30 pointer-events-none" />
        <div className="absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t border-r border-amber/30 pointer-events-none" />
        <div className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b border-l border-amber/30 pointer-events-none" />
        <div className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b border-r border-amber/30 pointer-events-none" />

        {/* Small Brand Pill */}
        <motion.div 
          variants={itemVariants} 
          className="rounded-full border border-amber/20 bg-amber/[0.04] px-4 py-1 flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] text-amber">
            ASTRİFER · GÖKYÜZÜ ZAMAN KAPSÜLÜ
          </span>
        </motion.div>

        {/* Cinematic Header */}
        <motion.h1 
          variants={itemVariants} 
          className="mt-6 font-display text-3xl font-light italic leading-tight text-bright sm:text-4xl lg:text-[44px]"
        >
          Gökyüzü o an,<br className="hidden sm:block" /> sonsuza dek sizin.
        </motion.h1>

        {/* Description */}
        <motion.p 
          variants={itemVariants} 
          className="mt-5 text-xs sm:text-[13px] leading-relaxed text-muted max-w-sm"
        >
          Doğduğunuz, aşık olduğunuz ya da hayatınızı değiştiren o anın gerçek astronomik gökyüzünü dondurun. Canlı bir dijital sayfa ve el yapımı suni deri defterle geleceğe saklayın.
        </motion.p>

        {/* Interactive CTA Buttons */}
        <motion.div 
          variants={itemVariants} 
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
        >
          <Link
            href="/create"
            className="w-full sm:w-auto relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-amber to-amber-deep px-8 py-3.5 font-mono text-[10px] uppercase tracking-widest text-ink transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_12px_40px_-14px_rgba(230,163,92,0.65)] font-bold group"
          >
            {/* Button Glint */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="relative">Kapsülünü Tasarla</span>
          </Link>
          <Link
            href="/#nasil-calisir"
            className="w-full sm:w-auto rounded-full border border-amber/40 bg-void/35 px-8 py-3.5 font-mono text-[10px] uppercase tracking-widest text-amber transition-all hover:bg-amber hover:text-ink hover:border-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber active:scale-[0.98]"
          >
            Nasıl Çalışır?
          </Link>
        </motion.div>

        {/* Scroll Cue Inside Card */}
        <motion.div variants={itemVariants} className="mt-6 flex items-center justify-center">
          <ScrollCue />
        </motion.div>
      </motion.div>

    </section>
  );
}
