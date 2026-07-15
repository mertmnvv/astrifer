"use client";

import { motion } from "framer-motion";
import { LedgerRule } from "@/components/atlas/LedgerRule";
import { ScrollCue } from "@/components/ui/ScrollCue";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

export interface TitleRevealProps {
  title: string;
  dateLabel: string;
  locationName: string;
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
export function TitleReveal({ title, dateLabel, locationName }: TitleRevealProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      variants={container}
      initial={reducedMotion ? "show" : "hidden"}
      animate="show"
      className="flex min-h-screen w-full max-w-2xl flex-col items-center justify-center text-center"
    >
      <motion.p variants={item} className="font-mono text-[9px] font-medium uppercase tracking-[0.4em] text-dim">
        {locationName}
      </motion.p>
      <motion.h1 variants={item} className="mt-5 font-display text-3xl font-light italic leading-tight text-bright sm:text-4xl lg:text-5xl">
        {title}
      </motion.h1>
      <motion.div variants={item}>
        <LedgerRule className="mx-auto mt-6 max-w-[8rem]" />
      </motion.div>
      <motion.p variants={item} className="mt-6 font-mono text-[10.5px] font-medium uppercase tracking-[0.25em] text-amber">
        {dateLabel}
      </motion.p>
      <motion.div variants={item} className="mt-12">
        <ScrollCue />
      </motion.div>
    </motion.div>
  );
}
