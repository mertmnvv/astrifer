"use client";

import { motion } from "framer-motion";
import { PhotoSlot } from "@/components/journal/PhotoSlot";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import type { StarMapPhoto } from "@/lib/starmaps";
import { PHOTO_ROTATIONS } from "./Timeline";

export interface FirstMomentSectionProps {
  photos: StarMapPhoto[];
}

const cluster = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const photoItem = {
  hidden: { opacity: 0, y: 16, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

/**
 * The founding moment's own scene, between the Yıldız Anahtarı and the
 * growing Zaman Çizelgesi — separates "the photo(s) we started with" from
 * whatever gets added every six months after it, so the timeline below
 * reads purely as ongoing growth rather than a mix of founding + later.
 */
export function FirstMomentSection({ photos }: FirstMomentSectionProps) {
  const reducedMotion = usePrefersReducedMotion();
  if (photos.length === 0) return null;

  return (
    <div className="flex w-full flex-col items-center text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">İlk An</p>
      <p className="mt-3 max-w-sm font-display text-base italic leading-relaxed text-subtle">
        Her şey burada başladı.
      </p>
      <motion.div
        variants={cluster}
        initial={reducedMotion ? "show" : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-9 flex flex-wrap items-start justify-center gap-x-3 gap-y-8 sm:gap-x-5"
      >
        {photos.map((photo, index) => (
          <motion.div key={photo.url ?? index} variants={photoItem} className="w-28 sm:w-36">
            <PhotoSlot photo={photo} rotateDeg={PHOTO_ROTATIONS[index % PHOTO_ROTATIONS.length]} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
