import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/atlas/SectionHeading";
import { LedgerEntry } from "@/components/atlas/LedgerEntry";

const CONCEPT_ITEMS = [
  {
    title: "Gerçek Gökyüzü",
    description:
      "O gün, o saat, o konumdaki gökyüzü — gerçek astronomik verilerle, olduğu gibi hesaplanır.",
  },
  {
    title: "Kalıcı Bir Adres",
    description:
      "Sizin adınıza kayıtlı, yıllar sonra bile aynı yerde duran kişisel bir sayfa ve bağlantı.",
  },
  {
    title: "Yeniden Yaşayın",
    description:
      "Fotoğraf, sesli mesaj ve satırlarınızla o ana istediğiniz an, istediğiniz kadar geri dönün.",
  },
];

export function ConceptSection() {
  return (
    <section className="px-4 py-28 sm:px-8">
      <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
        <RevealOnScroll>
          <SectionHeading eyebrow="Ne İnşa Ediyoruz" title="Bir zaman kapsülü, dijital olarak." align="left" />
          <div className="mt-8 flex items-center gap-3 text-amber" aria-hidden>
            <span className="h-px w-10 bg-amber/50" />
            <span className="text-lg">✦</span>
          </div>
        </RevealOnScroll>

        <div className="lg:pt-1">
          {CONCEPT_ITEMS.map((concept, index) => (
            <RevealOnScroll key={concept.title} delayMs={index * 120}>
              <LedgerEntry
                number={`0${index + 1}`}
                title={concept.title}
                description={concept.description}
                isLast={index === CONCEPT_ITEMS.length - 1}
              />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
