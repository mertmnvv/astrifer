import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/atlas/SectionHeading";
import { LedgerEntry } from "@/components/atlas/LedgerEntry";

const STEPS = [
  {
    number: "01",
    title: "Anı Seçin",
    description: "Doğum, ilk buluşma, evlilik teklifi... Sizin için özel olan o benzersiz anı seçin.",
  },
  {
    number: "02",
    title: "Gökyüzünü Hesaplayalım",
    description: "Girdiğiniz tarih, saat ve konumdaki gerçek gökyüzünü astronomik verilerle anında çizelim.",
  },
  {
    number: "03",
    title: "Kişiselleştirin",
    description: "Zaman kapsülünüze fotoğraflar, sesli bir mesaj ve kendi kişisel satırlarınızı ekleyin.",
  },
  {
    number: "04",
    title: "Sonsuza Dek Saklayın",
    description: "Kalıcı dijital sayfanız hazır — dilerseniz poster veya deri defter ürünüyle taçlandırın.",
  },
];

export function HowItWorks() {
  return (
    <section id="nasil-calisir" className="scroll-mt-20 bg-parchment px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <RevealOnScroll>
          <SectionHeading eyebrow="Nasıl Çalışır" title="Dört adımda, kalıcı bir an." />
        </RevealOnScroll>

        <div className="mt-16">
          {STEPS.map((step, index) => (
            <RevealOnScroll key={step.number} delayMs={index * 100}>
              <LedgerEntry
                number={step.number}
                title={step.title}
                description={step.description}
                isLast={index === STEPS.length - 1}
              />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
