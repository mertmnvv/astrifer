"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PhotoSlot } from "@/components/journal/PhotoSlot";
import { Lightbox } from "@/components/ui/Lightbox";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import type { StarMapPhoto } from "@/lib/starmaps";
import { PHOTO_ROTATIONS } from "./Timeline";

export interface FirstMomentSectionProps {
  photos: StarMapPhoto[];
  isPreviewMode?: boolean;
  editHref?: string;
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
export function FirstMomentSection({ photos, isPreviewMode = false, editHref }: FirstMomentSectionProps) {
  const [activePhoto, setActivePhoto] = useState<{ url: string; caption: string } | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  if (photos.length === 0) {
    if (isPreviewMode) {
      return (
        <div className="flex w-full flex-col items-center text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">İlk An</p>
          <p className="mt-3 max-w-sm font-display text-base italic leading-relaxed text-subtle">
            Her şey burada başladı.
          </p>
          <div className="mt-9 flex flex-col items-center gap-y-4">
            <Link
              href={editHref ?? "/create"}
              className="relative w-44 sm:w-56 aspect-[3/4] rounded-2xl border border-dashed border-amber/30 bg-amber/[0.02] flex flex-col items-center justify-center p-6 text-center hover:bg-amber/[0.04] transition-colors group"
            >
              <svg
                className="h-8 w-8 text-amber/40 mb-3 group-hover:text-amber/60 transition-colors"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              <p className="font-mono text-[9px] uppercase tracking-wider text-amber font-bold">Fotoğraf Eklenmedi</p>
              <p className="mt-2 text-[11px] text-subtle leading-normal">
                İlk anınıza ait fotoğraflar eklemek ister misiniz?
              </p>
            </Link>
          </div>
        </div>
      );
    }
    return null;
  }

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
        className="mt-9 flex flex-col items-center gap-y-8"
      >
        {Array.from({ length: 4 }).map((_, index) => {
          const photo = photos[index];

          if (photo) {
            return (
              <motion.div key={photo.url ?? index} variants={photoItem} className="w-44 sm:w-56">
                <PhotoSlot
                  photo={photo}
                  rotateDeg={PHOTO_ROTATIONS[index % PHOTO_ROTATIONS.length]}
                  isPreviewMode={isPreviewMode}
                  onImageClick={(url, caption) => setActivePhoto({ url, caption })}
                />
              </motion.div>
            );
          }

          // Empty slot placeholder
          return (
            <motion.div key={`empty-${index}`} variants={photoItem} className="w-44 sm:w-56">
              <div 
                className="relative aspect-[3/4] rounded-2xl border border-dashed border-amber/30 bg-[#fdfaf1]/[0.03] flex flex-col items-center justify-center p-6 text-center shadow-lg opacity-70"
                style={{ transform: `rotate(${PHOTO_ROTATIONS[index % PHOTO_ROTATIONS.length]}deg)` }}
              >
                <span
                  aria-hidden
                  className="absolute -top-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full shadow bg-gradient-to-r from-amber-light to-amber-deep opacity-60"
                />
                <svg className="h-6 w-6 text-amber/40 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
                <p className="font-mono text-[9px] uppercase tracking-wider text-amber/70 font-bold">Boş Alan {index + 1}/4</p>
                <p className="mt-1 text-[9px] text-dim leading-normal">
                  {isPreviewMode ? "Daha sonra fotoğraf ekleyebilirsiniz." : "Daha sonra panelden eklenebilir."}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <Lightbox
        url={activePhoto?.url ?? null}
        caption={activePhoto?.caption}
        onClose={() => setActivePhoto(null)}
      />
    </div>
  );
}
