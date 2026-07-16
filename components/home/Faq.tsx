"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/atlas/SectionHeading";

interface FaqItemData {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItemData[] = [
  {
    question: "Yıldız haritaları ne kadar doğru?",
    answer: "Astronomik olarak tam doğru. Girdiğiniz tarih, saat ve konuma göre o anın gerçek yıldız, gezegen ve Ay konumları hesaplanır — tahmini ya da dekoratif bir çizim değildir.",
  },
  {
    question: "Dijital ve fiziksel ürün arasındaki fark nedir?",
    answer: "Dijital Sayfa, size özel kalıcı bir web adresi ve paylaşılabilir bir zaman kapsülü sayfasıdır. Deri Defter ise bu dijital sayfanın fiziksel bir uzantısıdır — dijital sayfanıza götüren bir QR kod içerir, yani Deri Defter'i alanlar dijital deneyimi de otomatik olarak elde eder.",
  },
  {
    question: "Kargo süresi nedir?",
    answer: "Deri Defter siparişleri 5-7 iş günü içinde kargoya verilir. Kargo ücreti fiyata dahildir.",
  },
  {
    question: "Fotoğraf ve ses kaydı eklemek zorunlu mu?",
    answer: "Hayır, tamamen opsiyoneldir. Yalnızca tarih, saat ve konum bilgisiyle de eksiksiz bir zaman kapsülü oluşturabilirsiniz; fotoğraf ve sesli mesaj isteğe bağlı bir zenginleştirmedir.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="px-4 py-28 sm:px-8 select-none relative overflow-hidden bg-void">
      {/* Ambient background light */}
      <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-amber/[0.01] blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-2xl">
        <RevealOnScroll>
          <SectionHeading eyebrow="Destek" title="Sıkça Sorulan Sorular" />
        </RevealOnScroll>

        <div className="mt-14 space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <RevealOnScroll key={index} delayMs={index * 85}>
                <div 
                  className={`overflow-hidden rounded-2xl border transition-all duration-500 backdrop-blur-md ${
                    isOpen
                      ? "border-amber/40 bg-void/50 shadow-[0_0_20px_rgba(230,163,92,0.06)]"
                      : "border-text/10 bg-void/25 hover:border-text/20"
                  }`}
                >
                  <button
                    onClick={() => toggleItem(index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-4 px-6 py-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber group"
                  >
                    <span className="font-mono text-xs font-bold tracking-widest text-amber">
                      {`Q0${index + 1}`}
                    </span>
                    <span className="flex-1 font-display text-[16px] sm:text-lg italic text-bright group-hover:text-amber transition-colors duration-300">
                      {item.question}
                    </span>
                    <span className="ml-4 shrink-0 text-amber/60 group-hover:text-amber transition-colors">
                      <motion.svg
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="h-4.5 w-4.5"
                      >
                        <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                      </motion.svg>
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="pb-6 pl-14 pr-6 text-xs sm:text-sm leading-relaxed text-subtle border-t border-text/[0.04] pt-4">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
