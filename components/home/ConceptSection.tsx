import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { AuroraField } from "@/components/home/AuroraField";

const CONCEPT_ITEMS = [
  {
    title: "Gerçek Gökyüzü",
    description:
      "O gün, o saat, o konumdaki gökyüzü — gerçek astronomik verilerle, olduğu gibi hesaplanır. Dekoratif bir çizim değil.",
  },
  {
    title: "Ona Özel, Sonsuza Dek",
    description:
      "Kişiye özel kayıtlı, yıllar sonra bile aynı yerde duran kalıcı bir sayfa ve bağlantı — her açtığında aynı anı bulur.",
  },
  {
    title: "Yeniden Yaşayın",
    description:
      "Fotoğraf, sesli mesaj ve satırlarınızla o ana istediğiniz an, istediğiniz kadar geri dönün.",
  },
];

const ACCENTS = ["from-iris to-iris-light", "from-flare to-flare-light", "from-glow to-glow-light"];

export function ConceptSection() {
  return (
    <section className="px-4 py-28 sm:px-8 select-none relative overflow-hidden bg-nebula">
      <AuroraField className="opacity-60" />

      <div className="mx-auto max-w-5xl">
        <RevealOnScroll>
          <div className="mb-14 text-center">
            <HomeSectionHeading eyebrow="Neden Astrifer" title="Unutulmayacak bir hediye fikri." />
            <div className="mt-4 flex items-center justify-center gap-3" aria-hidden>
              <span className="h-px w-8 bg-iris/30" />
              <span className="text-sm text-flare-light">✦</span>
              <span className="h-px w-8 bg-flare/30" />
            </div>
          </div>
        </RevealOnScroll>

        <div className="grid gap-6 sm:grid-cols-3">
          {CONCEPT_ITEMS.map((concept, index) => (
            <RevealOnScroll key={concept.title} delayMs={index * 120}>
              <div className="relative h-full rounded-2xl border border-iris/10 bg-panel/50 p-6 backdrop-blur-md transition-all duration-500 hover:border-iris/30 hover:scale-[1.02] hover:shadow-[0_20px_50px_rgba(167,139,250,0.08)] group flex flex-col justify-between">
                <div className="absolute top-3 left-3 w-2 h-2 border-t border-l border-iris/30 opacity-40 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 right-3 w-2 h-2 border-t border-r border-flare/30 opacity-40 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-flare/30 opacity-40 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-iris/30 opacity-40 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className={`font-mono text-xs font-bold tracking-[0.2em] bg-gradient-to-r ${ACCENTS[index % ACCENTS.length]} bg-clip-text text-transparent`}>
                      0{index + 1}
                    </span>
                    <span className="text-iris-light/40 font-serif text-sm group-hover:text-flare-light transition-colors">✦</span>
                  </div>

                  <h3 className="font-display text-xl italic text-bright mb-3 group-hover:text-iris-light transition-colors">
                    {concept.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-subtle">
                    {concept.description}
                  </p>
                </div>

                <div className="w-full h-px bg-gradient-to-r from-iris/20 via-flare/10 to-transparent mt-6 group-hover:from-iris/40 transition-colors" />
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
