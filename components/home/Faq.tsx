"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { FAQ_ITEMS } from "@/components/home/faqData";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="sss" className="scroll-mt-20 px-4 py-28 sm:px-8 select-none relative overflow-hidden bg-nebula">
      {/* Ambient background light */}
      <div className="absolute bottom-0 right-10 w-96 h-96 rounded-full bg-flare/[0.03] blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-2xl">
        <RevealOnScroll>
          <HomeSectionHeading eyebrow="Destek" title="Sıkça Sorulan Sorular" />
        </RevealOnScroll>

        <div className="mt-14 space-y-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <RevealOnScroll key={index} delayMs={index * 85}>
                <div 
                  className={`overflow-hidden rounded-2xl border transition-all duration-500 backdrop-blur-md ${
                    isOpen
                      ? "border-iris/40 bg-nebula/50 shadow-[0_0_20px_rgba(167,139,250,0.08)]"
                      : "border-text/10 bg-nebula/25 hover:border-text/20"
                  }`}
                >
                  <button
                    onClick={() => toggleItem(index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center gap-4 px-6 py-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-light group"
                  >
                    <span className="font-mono text-xs font-bold tracking-widest text-iris-light">
                      {`Q0${index + 1}`}
                    </span>
                    <span className="flex-1 font-display text-[16px] sm:text-lg italic text-bright group-hover:text-flare-light transition-colors duration-300">
                      {item.question}
                    </span>
                    <span className="ml-4 shrink-0 text-iris-light/60 group-hover:text-iris-light transition-colors">
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
