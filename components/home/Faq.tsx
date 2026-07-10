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
    answer: "Yıldız haritalarımız, gök cisimlerinin konumlarını hassasiyetle hesaplayan profesyonel astronomik hesaplama motorunu kullanır. Seçtiğiniz tarih, saat ve konumdaki gökyüzü tamamen gerçekçi ve bilimsel doğruluktadır.",
  },
  {
    question: "Dijital ve fiziksel ürün arasındaki fark nedir?",
    answer: "Dijital ürün satın aldığınızda, size özel hazırlanan ve müzik eşliğinde anılarınızı (fotoğraf, ses kaydı, kişisel mesaj) saklayabileceğiniz kalıcı bir web adresi alırsınız. Fiziksel ürünlerde ise yüksek kaliteli (300 DPI) baskı adresinize kargolanır ve üzerinde dijital sayfanıza yönlendiren şık bir QR kod yer alır.",
  },
  {
    question: "Kargo süresi nedir?",
    answer: "Fiziksel siparişleriniz (Poster ve Deri Defter) 2 iş günü içerisinde hazırlanarak kargoya teslim edilir. Dijital sayfalar ise ödeme onaylandığı an anında oluşturulur ve hemen erişilebilir olur.",
  },
  {
    question: "Fotoğraf ve ses kaydı eklemek zorunlu mu?",
    answer: "Hayır, tamamen isteğe bağlıdır. Zaman kapsülünüzü sadece yıldız haritası ve kişisel bir mesajla oluşturabileceğiniz gibi fotoğraf ve ses kayıtlarıyla da zenginleştirebilirsiniz.",
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
