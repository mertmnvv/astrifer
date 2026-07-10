"use client";

import { PhotoSlot } from "./PhotoSlot";
import type { StarMapPhoto } from "@/lib/starmaps";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { useInViewOnce } from "@/lib/hooks/useInViewOnce";

const PHOTO_ROTATIONS = [-2.5, 2, 1.5, -2];

export interface MemoriesGalleryProps {
  photos: StarMapPhoto[];
}

/** Photo grid where each polaroid settles in with a slight stagger, instead of the whole panel fading at once. */
export function MemoriesGallery({ photos }: MemoriesGalleryProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = reducedMotion || inView;

  return (
    <div ref={ref}>
      <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Anılarımız</p>
      <div className="mt-5 grid grid-cols-4 gap-3">
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
