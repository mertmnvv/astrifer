"use client";

import { useState } from "react";
import { PhotoSlot } from "@/components/journal/PhotoSlot";
import { useInViewOnce } from "@/lib/hooks/useInViewOnce";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import type { TimelineEntry } from "@/lib/starmaps";
import { isAddWindowOpen } from "@/lib/starmapTimeline";
import { AddEntryForm } from "./AddEntryForm";

export const PHOTO_ROTATIONS = [-2.5, 2, 1.5, -2];

export interface TimelineProps {
  slug: string;
  createdAt: Date;
  entries: TimelineEntry[];
  /** True only when a valid owner cookie was verified server-side — visitors with just the share link never see add controls. */
  isOwner: boolean;
}

function formatEntryDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(date);
}

/** Growing photo timeline for the digital page — supersedes the old static MemoriesGallery. */
export function Timeline({ slug, createdAt, entries, isOwner }: TimelineProps) {
  const [showForm, setShowForm] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = reducedMotion || inView;
  const windowOpen = isOwner && isAddWindowOpen(createdAt, entries);

  if (entries.length === 0 && !isOwner) return null;

  return (
    <div ref={ref}>
      <p className="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Zaman Çizelgesi</p>

      {isOwner && (
        <div className="mt-5 flex flex-col items-center gap-3">
          {windowOpen && !showForm && (
            <div className="flex items-center gap-2.5 rounded-full border border-amber/40 bg-amber/10 px-4 py-2">
              <span
                aria-hidden
                className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-amber motion-reduce:animate-none"
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-amber">
                Yeni bir an eklemenin zamanı geldi
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className="rounded-full border border-amber/40 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-amber transition-colors hover:bg-amber hover:text-ink"
          >
            {showForm ? "Vazgeç" : "+ Yeni An Ekle"}
          </button>
          {showForm && (
            <div className="w-full max-w-sm">
              <AddEntryForm slug={slug} onDone={() => setShowForm(false)} />
            </div>
          )}
        </div>
      )}

      <div className="mt-8 space-y-8">
        {entries.map((entry, entryIndex) => (
          <div
            key={entry.id}
            className={`transition-all duration-500 ease-out ${
              revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: revealed ? `${entryIndex * 120}ms` : "0ms" }}
          >
            <p className="text-center font-mono text-[9px] uppercase tracking-[0.25em] text-amber">
              {formatEntryDate(entry.date)}
            </p>
            {entry.note && (
              <p className="mx-auto mt-2 max-w-md text-center font-display text-sm italic leading-relaxed text-subtle">
                &ldquo;{entry.note}&rdquo;
              </p>
            )}
            {entry.photos.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {entry.photos.map((photo, photoIndex) => (
                  <div key={photo.url ?? `${entry.id}-${photoIndex}`}>
                    <PhotoSlot photo={photo} rotateDeg={PHOTO_ROTATIONS[photoIndex % PHOTO_ROTATIONS.length]} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
