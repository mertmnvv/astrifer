"use client";

import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { useInViewOnce } from "@/lib/hooks/useInViewOnce";

export interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  /** Extra transition-delay in ms, for staggering a row/grid of siblings. */
  delayMs?: number;
  /** Transition duration in ms; defaults to 700 for the usual brisk fade, higher for a slower unfold. */
  durationMs?: number;
}

/** Fades/slides a section in as it enters the viewport; skipped entirely under prefers-reduced-motion. */
export function RevealOnScroll({ children, className, delayMs = 0, durationMs = 700 }: RevealOnScrollProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = reducedMotion || inView;

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: delayMs ? `${delayMs}ms` : undefined,
        transitionDuration: `${durationMs}ms`,
      }}
      className={`transition-all ease-out ${
        revealed ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
