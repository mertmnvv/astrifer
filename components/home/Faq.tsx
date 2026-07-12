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
    answer: "Dijital Sayfa, size özel kalıcı bir web adresi ve paylaşılabilir bir zaman kapsülü sayfasıdır. Poster ve Deri Defter ise bu dijital sayfanın fiziksel bir uzantısıdır — her ikisinde de dijital sayfanıza götüren bir QR kod bulunur, yani fiziksel ürünü alanlar dijital deneyimi de otomatik olarak elde eder.",
  },
  {
    question: "Kargo süresi nedir?",
    answer: "Poster siparişleri 3-5 iş günü, Deri Defter siparişleri 5-7 iş günü içinde kargoya verilir. Kargo ücreti fiyata dahildir.",
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
    <section className="px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <RevealOnScroll>
          <SectionHeading eyebrow="Destek" title="Sıkça Sorulan Sorular" />
        </RevealOnScroll>

        <div className="mt-14">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <RevealOnScroll key={index} delayMs={index * 80}>
                <div className={`border-b border-text/10 ${index === 0 ? "border-t" : ""}`}>
                  <button
                    onClick={() => toggleItem(index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-4 py-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
                  >
                    <span className="font-mono text-xs font-bold tracking-wider text-amber">
                      {`Q0${index + 1}`}
                    </span>
                    <span className="flex-1 font-display text-lg italic text-text">{item.question}</span>
                    <span className="ml-4 shrink-0 text-amber">
                      <motion.svg
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
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
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="pb-6 pl-[3.25rem] text-sm leading-relaxed text-subtle">{item.answer}</div>
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
