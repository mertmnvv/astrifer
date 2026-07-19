"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { LedgerRule } from "@/components/atlas/LedgerRule";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import type { SkyPalette } from "@/components/astrolab/palettes";

export interface TitleRevealProps {
  title: string;
  dateLabel: string;
  locationName: string;
  palette: SkyPalette;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const } },
};

/** Opening scene: just the name and the moment, before the sky itself comes into focus below. */
export function TitleReveal({ title, dateLabel, locationName, palette }: TitleRevealProps) {
  const reducedMotion = usePrefersReducedMotion();
  const sceneRef = useRef<HTMLDivElement>(null);
  const isGravur = palette.id === "gravur-atlas";

  // As the visitor scrolls past the hero, it slowly pulls back and fades —
  // reads as being drawn deeper into the sky below rather than a hard cut.
  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, reducedMotion ? 1 : 1.12]);
  const opacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 1, 0]);

  return (
    <div ref={sceneRef} className="flex min-h-[100svh] w-full max-w-2xl flex-col items-center justify-center text-center">
      <motion.div
        style={reducedMotion ? undefined : { scale, opacity }}
        variants={container}
        initial={reducedMotion ? "show" : "hidden"}
        animate="show"
        className="flex w-full flex-col items-center"
      >
        <motion.p
          variants={item}
          className={`font-mono text-[9px] font-medium uppercase tracking-[0.45em] sm:text-[10px] ${isGravur ? "text-gravur-ink-soft" : "text-dim"}`}
        >
          {locationName}
        </motion.p>
        <motion.h1
          variants={item}
          className={`mt-5 text-4xl font-light italic leading-[1.05] sm:text-6xl lg:text-7xl ${
            isGravur ? "font-gravur-serif text-gravur-ink" : "font-display text-bright"
          }`}
        >
          {title}
        </motion.h1>
        <motion.div variants={item}>
          <LedgerRule
            className="mx-auto mt-7 max-w-[8rem]"
            ruleClassName={isGravur ? "border-gravur-ink/15" : "border-text/10"}
            accentClassName={isGravur ? "text-gravur-copper" : "text-amber"}
          />
        </motion.div>
        <motion.p
          variants={item}
          className={`mt-6 font-mono text-[10.5px] font-medium uppercase tracking-[0.25em] ${isGravur ? "text-gravur-copper" : "text-amber"}`}
        >
          {dateLabel}
        </motion.p>
        <motion.div variants={item} className="mt-14">
          <ScrollCue />
        </motion.div>
      </motion.div>
    </div>
  );
}
