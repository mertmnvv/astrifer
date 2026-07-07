"use client";

import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { useInViewOnce } from "@/lib/hooks/useInViewOnce";

export interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
}

/** Fades/slides a section in as it enters the viewport; skipped entirely under prefers-reduced-motion. */
export function RevealOnScroll({ children, className }: RevealOnScrollProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>();
  const revealed = reducedMotion || inView;

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        revealed ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
