"use client";

import { useEffect, useState } from "react";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { TESTIMONIALS } from "@/lib/testimonials";

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || paused || TESTIMONIALS.length === 0) return;
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reducedMotion, paused]);

  if (TESTIMONIALS.length === 0) return null;

  const active = TESTIMONIALS[index];

  return (
    <section className="px-4 py-24 sm:px-8">
      <div
        className="mx-auto max-w-2xl text-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <RevealOnScroll>
          <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-amber">Sizden Gelenler</p>

          <div className="mx-auto mt-8 flex justify-center gap-1 text-amber" aria-hidden>
            {[...Array(5)].map((_, i) => (
              <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>

          <p className="mt-7 text-balance font-display text-xl italic leading-relaxed text-text sm:text-2xl">
            “{active.quote}”
          </p>

          <div className="mt-6">
            <p className="font-mono text-xs uppercase tracking-wider text-amber">{active.name}</p>
            <p className="mt-0.5 font-mono text-[10px] text-dim">
              {active.occasion} · {active.product}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {TESTIMONIALS.map((testimonial, dotIndex) => (
              <button
                key={testimonial.name}
                type="button"
                onClick={() => setIndex(dotIndex)}
                aria-label={`${testimonial.name} yorumunu göster`}
                aria-current={dotIndex === index}
                className={`h-1.5 w-1.5 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber ${
                  dotIndex === index ? "bg-amber" : "bg-amber/30 hover:bg-amber/60"
                }`}
              />
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
