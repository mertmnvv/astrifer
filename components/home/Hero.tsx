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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const } },
};

/** Full-viewport hero: the live star chart as an ambient backdrop, the brand line, and the primary CTA. */
export function Hero({ sky }: HeroProps) {
  const reducedMotion = usePrefersReducedMotion();
  const palette = DEFAULT_SKY_PALETTE;

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-28 text-center sm:px-8 sm:pt-20">
      <div className="absolute inset-0">
        <StarChart
          sky={sky}
          label="Örnek bir zaman kapsülünün gökyüzü"
          palette={palette}
          showLabels={false}
          className="h-full w-full"
        />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(11,8,16,0.55)_66%,#0b0810_100%)]" />

      <motion.div
        variants={container}
        initial={reducedMotion ? "show" : "hidden"}
        animate="show"
        className="relative z-10 flex max-w-2xl flex-col items-center"
      >
        <motion.p variants={item} className="font-mono text-[9px] font-medium uppercase tracking-[0.4em] text-amber">
          Zaman Kapsülü
        </motion.p>
        <motion.h1 variants={item} className="mt-5 font-display text-3xl font-light italic leading-tight text-bright sm:text-4xl lg:text-5xl">
          Gökyüzü o an, sonsuza dek sizin.
        </motion.h1>
        <motion.p variants={item} className="mt-5 max-w-md text-xs leading-relaxed text-muted sm:text-sm">
          Doğduğunuz, aşık olduğunuz ya da hayatınızı değiştiren o anın gerçek gökyüzünü kaydedin. Kişisel bir
          sayfa ve kalıcı bir adres olarak, yıllar sonra bile aynı ışıkla karşınızda.
        </motion.p>
        <motion.div variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/create"
            className="rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-ink shadow-[0_10px_40px_-12px_rgba(230,163,92,0.6)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          >
            Zaman Kapsülünü Oluştur
          </Link>
          <Link
            href="/#nasil-calisir"
            className="rounded-full border border-amber/45 px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-amber transition-colors hover:bg-amber hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          >
            Nasıl Çalışır?
          </Link>
        </motion.div>
        <motion.div variants={item}>
          <ScrollCue />
        </motion.div>
      </motion.div>
    </section>
  );
}
