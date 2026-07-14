"use client";

import type { ReactNode } from "react";
import { useInViewOnce } from "@/lib/hooks/useInViewOnce";

export interface LazyMountProps {
  children: ReactNode;
  className?: string;
  /** Applied to the placeholder shown before the element has scrolled into view, so layout doesn't jump. */
  placeholderClassName?: string;
}

/**
 * Defers mounting expensive children (e.g. procedural canvas art) until the
 * wrapper scrolls near the viewport, so a page with many independent canvas
 * previews doesn't compute all of them on first paint.
 */
export function LazyMount({ children, className, placeholderClassName }: LazyMountProps) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0);

  return (
    <div ref={ref} className={className}>
      {inView ? children : <div className={`animate-pulse bg-text/[0.04] ${placeholderClassName ?? "aspect-square w-full"}`} />}
    </div>
  );
}
