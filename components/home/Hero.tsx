"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { StarChart } from "@/components/astrolab/StarChart";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { AuroraField } from "@/components/home/AuroraField";
import { MusicProvider } from "@/components/journal/MusicContext";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";

export interface HeroProps {
  sky: ComputeSkyResult;
}

/** Three.js is ~600KB+ min — keep it out of the initial bundle and only fetch it once the hero mounts client-side. */
const CelestialGlobe3D = dynamic(
  () => import("@/components/starmap/CelestialGlobe3D").then((mod) => mod.CelestialGlobe3D),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse rounded-full bg-nebula/60" /> },
);

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const } },
};

/** Ticks every second so the hero badge reads as "this instant," not a cached render. */
function LiveClockBadge() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const format = () =>
      new Date().toLocaleTimeString("tr-TR", {
        timeZone: "Europe/Istanbul",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    setLabel(format());
    const id = setInterval(() => setLabel(format()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-none flex flex-col items-center gap-1">
      <span className="rounded-full border border-iris/25 bg-nebula/70 px-3.5 py-1 font-mono text-[9px] tracking-[0.2em] text-bright backdrop-blur-sm">
        ŞU AN İSTANBUL GÖKYÜZÜ
      </span>
      <span className="font-mono text-[8px] tracking-[0.2em] text-dim tabular-nums">
        {label ?? "--:--:--"}
      </span>
    </div>
  );
}

export function Hero({ sky }: HeroProps) {
  const reducedMotion = usePrefersReducedMotion();
  const palette = getSkyPalette("derin-mor");

  return (
    <section className="relative flex min-h-screen flex-col items-center overflow-hidden bg-nebula px-4 pb-14 pt-28 text-center sm:px-8 select-none">
      {/* Ambient drifting nebula clouds */}
      <AuroraField />

      {/* Full-bleed slowly-drifting ambient StarChart background */}
      <div className="absolute inset-0 z-0 opacity-[0.3] pointer-events-none mix-blend-screen">
        <StarChart
          sky={sky}
          label="Şu anın gerçek gökyüzü, arka plan dokusu"
          palette={palette}
          showLabels={false}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Darken edges for text contrast, tinted with nebula colors */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(167,139,250,0.10)_0%,rgba(7,5,15,0.7)_55%,#07050f_100%)] pointer-events-none z-0" />

      {/* Floating astronomical coordinates */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block z-10">
        <div className="absolute left-[6%] top-[18%] font-mono text-[9px] tracking-[0.25em] text-dim select-none">
          RA 14h 15m 39.7s <br />
          DEC +19° 10′ 56″
        </div>
        <div className="absolute right-[6%] top-[18%] font-mono text-[9px] tracking-[0.25em] text-dim text-right select-none">
          ALT +42.15° <br />
          AZ 198.34° (SSW)
        </div>
        <div className="absolute left-[7%] bottom-[8%] font-mono text-[9px] tracking-[0.25em] text-dim select-none">
          LAT 41.0082° N <br />
          LON 28.9784° E
        </div>
        <div className="absolute right-[7%] bottom-[8%] font-mono text-[9px] tracking-[0.25em] text-dim text-right select-none">
          JD 2461238.29 <br />
          EPOCH J2000.0
        </div>
      </div>

      {/* Text block — sits above the globe, never overlaps it */}
      <motion.div
        variants={containerVariants}
        initial={reducedMotion ? "show" : "hidden"}
        animate="show"
        className="relative z-20 flex w-full max-w-xl flex-col items-center"
      >
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
          className="mt-6 font-display text-3xl font-light italic leading-tight text-bright sm:text-4xl lg:text-[46px]"
        >
          O anın gerçek gökyüzü,<br className="hidden sm:block" /> sonsuza dek saklanacak bir hediye.
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-5 text-xs sm:text-sm leading-relaxed text-muted max-w-md"
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
      </motion.div>

      {/* Centerpiece: interactive 3D celestial globe, always the live sky —
          its own row below the text, so nothing ever covers it. */}
      <motion.div
        variants={itemVariants}
        initial={reducedMotion ? "show" : "hidden"}
        animate="show"
        className="relative z-20 mt-10 sm:mt-12 flex items-center justify-center"
      >
        <div className="relative flex items-center justify-center w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] lg:w-[440px] lg:h-[440px]">
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_90deg,rgba(167,139,250,0.18),rgba(244,114,182,0.14),rgba(96,165,250,0.14),rgba(167,139,250,0.18))] blur-3xl animate-aurora-drift-slow" />

          <div className="absolute w-[260px] h-[260px] sm:w-[350px] sm:h-[350px] lg:w-[400px] lg:h-[400px] rounded-full overflow-hidden border border-iris/25 shadow-[0_0_70px_rgba(167,139,250,0.15)] bg-nebula/90">
            <MusicProvider src={null}>
              <CelestialGlobe3D sky={sky} palette={palette} className="h-full w-full" />
            </MusicProvider>
          </div>

          <div className="absolute w-full h-full flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(167,139,250,0.2)" strokeWidth="0.4" strokeDasharray="1.5 2.5" />
              <circle cx="50" cy="50" r="47.8" fill="none" stroke="rgba(244,114,182,0.1)" strokeWidth="0.2" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(96,165,250,0.12)" strokeWidth="0.4" strokeDasharray="0.3 6" />
            </svg>
          </div>

          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2">
            <LiveClockBadge />
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        initial={reducedMotion ? "show" : "hidden"}
        animate="show"
        className="relative z-20 mt-14 flex items-center justify-center"
      >
        <ScrollCue />
      </motion.div>
    </section>
  );
}
