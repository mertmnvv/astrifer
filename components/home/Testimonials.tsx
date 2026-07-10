"use client";

import { useEffect, useState } from "react";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/atlas/SectionHeading";
import { AtlasPanel } from "@/components/atlas/AtlasPanel";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  product: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Eşime evlilik teklif ettiğim gecenin gökyüzünü hediye ettim. Deri defterin kapak kalitesi ve üzerindeki yıldız haritası tek kelimeyle harikaydı.",
    author: "Emre K.",
    role: "Yıldönümü Hediyesi",
    product: "Deri Defter",
  },
  {
    quote: "Kızımın doğduğu anın gökyüzünü çerçeveli poster olarak salonumuza astık. Hem astronomik olarak doğru olması hem de tasarımı muazzam.",
    author: "Selin A.",
    role: "Doğum Günü Hediyesi",
    product: "Çerçeveli Poster",
  },
  {
    quote: "Dijital zaman kapsülü fikri harika! Yıldönümümüzde hem ses kaydı hem de fotoğraflarımızla eşimle paylaştım, çok duygusal bir an oldu.",
    author: "Caner T.",
    role: "Yıldönümü Anısı",
    product: "Dijital Sayfa",
  },
];

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || paused) return;
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reducedMotion, paused]);

  const active = TESTIMONIALS[index];

  return (
    <section className="bg-leather px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <RevealOnScroll>
          <SectionHeading eyebrow="Müşteri Yorumları" title="Sizden Gelenler" tone="parchment" />
        </RevealOnScroll>

        <RevealOnScroll delayMs={120} className="mt-14">
          <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <AtlasPanel tone="leather" padding="lg" className="text-center">
            <div className="mx-auto flex gap-1 text-brass" aria-hidden>
              {[...Array(5)].map((_, i) => (
                <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>

            <p className="mt-6 font-display text-xl italic leading-relaxed text-parchment sm:text-2xl">
              “{active.quote}”
            </p>

            <div className="mt-8">
              <p className="font-mono text-xs uppercase tracking-wider text-brass">{active.author}</p>
              <p className="mt-0.5 font-mono text-[10px] text-parchment/60">
                {active.role} · <span className="text-brass-dim">{active.product}</span>
              </p>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2">
              {TESTIMONIALS.map((testimonial, dotIndex) => (
                <button
                  key={testimonial.author}
                  type="button"
                  onClick={() => setIndex(dotIndex)}
                  aria-label={`${testimonial.author} yorumunu göster`}
                  aria-current={dotIndex === index}
                  className={`h-1.5 w-1.5 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass ${
                    dotIndex === index ? "bg-brass" : "bg-brass-dim/40 hover:bg-brass-dim/70"
                  }`}
                />
              ))}
            </div>
          </AtlasPanel>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
