import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/atlas/SectionHeading";

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
    <section className="px-4 py-28 sm:px-8 select-none relative overflow-hidden bg-void">
      {/* Decorative background nebulas */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-amber/5 blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-5xl">
        <RevealOnScroll>
          <div className="mb-14 text-center">
            <SectionHeading eyebrow="Ne İnşa Ediyoruz" title="Bir zaman kapsülü, dijital olarak." />
            <div className="mt-4 flex items-center justify-center gap-3 text-amber" aria-hidden>
              <span className="h-px w-8 bg-amber/30" />
              <span className="text-sm">✦</span>
              <span className="h-px w-8 bg-amber/30" />
            </div>
          </div>
        </RevealOnScroll>

        <div className="grid gap-6 sm:grid-cols-3">
          {CONCEPT_ITEMS.map((concept, index) => (
            <RevealOnScroll key={concept.title} delayMs={index * 120}>
              <div className="relative h-full rounded-2xl border border-amber/10 bg-void/45 p-6 backdrop-blur-md transition-all duration-500 hover:border-amber/30 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(230,163,92,0.05)] group flex flex-col justify-between">
                
                {/* Subtle card brackets */}
                <div className="absolute top-3 left-3 w-2 h-2 border-t border-l border-amber/25 opacity-40 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 right-3 w-2 h-2 border-t border-r border-amber/25 opacity-40 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-amber/25 opacity-40 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-amber/25 opacity-40 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Top section with index number & star */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs font-bold tracking-[0.2em] text-amber">
                      0{index + 1}
                    </span>
                    <span className="text-amber/40 font-serif text-sm group-hover:text-amber transition-colors">✦</span>
                  </div>

                  {/* Title & description */}
                  <h3 className="font-display text-xl italic text-bright mb-3 group-hover:text-amber transition-colors">
                    {concept.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-subtle">
                    {concept.description}
                  </p>
                </div>

                {/* Subtle underline detail */}
                <div className="w-full h-px bg-gradient-to-r from-amber/15 to-transparent mt-6 group-hover:from-amber/35 transition-colors" />
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
