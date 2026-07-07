"use client";

import { PhotoSlot } from "./PhotoSlot";
import type { StarMapPhoto } from "@/lib/starmaps";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { useInViewOnce } from "@/lib/hooks/useInViewOnce";

const PHOTO_ROTATIONS = [-2.5, 2, 1.5, -2];

export interface MemoriesGalleryProps {
  title: string;
  photos: StarMapPhoto[];
}

/** Photo grid where each polaroid settles in with a slight stagger, instead of the whole panel fading at once. */
export function MemoriesGallery({ title, photos }: MemoriesGalleryProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = reducedMotion || inView;

  return (
    <div
      ref={ref}
      className="relative rounded-md bg-parchment px-6 py-10 shadow-2xl shadow-black/50 sm:px-10"
    >
      <p className="text-center font-mono text-[10px] uppercase tracking-[0.26em] text-leather-lt opacity-85">
        Birlikte Anılarımız
      </p>
      <h2 className="mt-1 text-center font-display text-xl italic text-ink">{title}</h2>
      <div className="mt-6 grid grid-cols-2 gap-4">
        {photos.map((photo, index) => (
          <div
            key={index}
            className={`transition-all duration-500 ease-out ${
              revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: revealed ? `${index * 120}ms` : "0ms" }}
          >
            <PhotoSlot photo={photo} rotateDeg={PHOTO_ROTATIONS[index % PHOTO_ROTATIONS.length]} />
          </div>
        ))}
      </div>
    </div>
  );
}
