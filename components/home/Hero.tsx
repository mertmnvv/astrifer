"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { StarChart } from "@/components/astrolab/StarChart";
import { DEFAULT_SKY_PALETTE } from "@/components/astrolab/palettes";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { AuroraField } from "@/components/home/AuroraField";
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
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-nebula px-4 pb-12 pt-28 text-center sm:px-8 select-none">
      {/* Ambient drifting nebula clouds */}
      <AuroraField />

      {/* Full-bleed slowly-drifting ambient StarChart background */}
      <div className="absolute inset-0 z-0 opacity-[0.3] pointer-events-none mix-blend-screen">
        <StarChart
          sky={sky}
          label="Örnek bir zaman kapsülünün arka plan gökyüzü"
          palette={palette}
          showLabels={false}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Darken edges for text contrast, tinted with nebula colors */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(167,139,250,0.10)_0%,rgba(7,5,15,0.7)_55%,#07050f_100%)] pointer-events-none z-0" />

      {/* Centerpiece: star medallion with a violet-to-rose aurora ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-10">
        <div className="relative flex items-center justify-center w-[300px] h-[300px] sm:w-[480px] sm:h-[480px] lg:w-[560px] lg:h-[560px]">
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_90deg,rgba(167,139,250,0.18),rgba(244,114,182,0.14),rgba(96,165,250,0.14),rgba(167,139,250,0.18))] blur-3xl animate-aurora-drift-slow" />

          <div className="absolute w-[220px] h-[220px] sm:w-[340px] sm:h-[340px] lg:w-[400px] lg:h-[400px] rounded-full overflow-hidden border border-iris/25 shadow-[0_0_70px_rgba(167,139,250,0.15)] pointer-events-auto bg-nebula/90">
            <StarChart
              sky={sky}
              label="Örnek gökyüzü haritası"
              palette={palette}
              showLabels={false}
              interactive={true}
              showControls={false}
              className="h-full w-full opacity-70 scale-[1.03]"
            />
          </div>

          <div className="absolute w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-[300px] h-[300px] sm:w-[480px] sm:h-[480px] lg:w-[560px] lg:h-[560px]">
              <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(167,139,250,0.2)" strokeWidth="0.4" strokeDasharray="1.5 2.5" />
              <circle cx="50" cy="50" r="47.8" fill="none" stroke="rgba(244,114,182,0.1)" strokeWidth="0.2" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(96,165,250,0.12)" strokeWidth="0.4" strokeDasharray="0.3 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Floating astronomical coordinates */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block z-10">
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

      {/* Glassmorphic overlay content card */}
      <motion.div
        variants={containerVariants}
        initial={reducedMotion ? "show" : "hidden"}
        animate="show"
        className="relative z-20 w-full max-w-[92%] sm:max-w-[440px] lg:max-w-[480px] rounded-3xl border border-iris/20 bg-nebula/50 px-6 py-8 sm:px-10 sm:py-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl flex flex-col items-center group hover:border-iris/35 transition-colors duration-500"
      >
        <div className="absolute top-3.5 left-3.5 w-3.5 h-3.5 border-t border-l border-iris/35 pointer-events-none" />
        <div className="absolute top-3.5 right-3.5 w-3.5 h-3.5 border-t border-r border-flare/35 pointer-events-none" />
        <div className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 border-b border-l border-flare/35 pointer-events-none" />
        <div className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 border-b border-r border-iris/35 pointer-events-none" />

        <motion.div
          variants={itemVariants}
          className="rounded-full border border-iris/25 bg-iris/[0.06] px-4 py-1 flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-iris to-flare animate-pulse" />
          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.25em] bg-gradient-to-r from-iris-light to-flare-light bg-clip-text text-transparent">
            ASTRİFER · GÖKYÜZÜ ZAMAN KAPSÜLÜ
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="mt-6 font-display text-3xl font-light italic leading-tight text-bright sm:text-4xl lg:text-[44px]"
        >
          O anın gerçek gökyüzü,<br className="hidden sm:block" /> sonsuza dek saklanacak bir hediye.
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-5 text-xs sm:text-[13px] leading-relaxed text-muted max-w-sm"
        >
          Doğum, ilk buluşma ya da evlilik teklifi... O anın gerçek astronomik gökyüzünü hesaplayıp kalıcı bir dijital sayfaya ve dilerseniz el yapımı suni deri bir deftere dönüştürün.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto"
        >
          <Link
            href="/create"
            className="w-full sm:w-auto relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-iris to-flare px-8 py-3.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_12px_40px_-14px_rgba(167,139,250,0.65)] group"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <span className="relative">Hediyeni Tasarla</span>
          </Link>
          <Link
            href="/#nasil-calisir"
            className="w-full sm:w-auto rounded-full border border-iris/40 bg-nebula/35 px-8 py-3.5 font-mono text-[10px] uppercase tracking-widest text-iris-light transition-all hover:bg-iris hover:text-white hover:border-iris focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris active:scale-[0.98]"
          >
            Nasıl Çalışır?
          </Link>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mt-4 font-mono text-[9px] uppercase tracking-widest text-dim"
        >
          299₺&apos;den başlayan fiyatlarla · Güvenli ödeme (PayTR)
        </motion.p>

        <motion.div variants={itemVariants} className="mt-6 flex items-center justify-center">
          <ScrollCue />
        </motion.div>
      </motion.div>
    </section>
  );
}
