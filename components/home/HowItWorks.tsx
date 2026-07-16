import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { SectionHeading } from "@/components/atlas/SectionHeading";

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
    description: "Zaman kapsülüne fotoğraflar, sesli bir mesaj ve kendi kişisel satırlarınızı ekleyin.",
  },
  {
    number: "04",
    title: "Sonsuza Dek Saklayın",
    description: "Kalıcı dijital sayfanız hazır — dilerseniz el yapımı deri defter ürünüyle taçlandırın.",
  },
];

export function HowItWorks() {
  return (
    <section id="nasil-calisir" className="scroll-mt-20 px-4 py-28 sm:px-8 select-none relative overflow-hidden bg-void">
      {/* Decorative ambient light */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber/[0.02] blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-5xl">
        <RevealOnScroll>
          <SectionHeading eyebrow="Nasıl Çalışır" title="Dört adımda, kalıcı bir an." />
        </RevealOnScroll>

        <div className="relative mt-16">
          {/* Horizontal celestial timeline connector line (Only on desktop) */}
          <div 
            aria-hidden
            className="hidden sm:block absolute top-0 left-[12%] right-[12%] h-[1.5px] bg-gradient-to-r from-transparent via-amber/35 to-transparent pointer-events-none -z-10"
            style={{ backgroundImage: 'linear-gradient(to right, rgba(230,163,92,0) 0%, rgba(230,163,92,0.4) 15%, rgba(230,163,92,0.4) 85%, rgba(230,163,92,0) 100%)', backgroundSize: 'cover' }}
          />

          <div className="grid gap-7 sm:grid-cols-4">
            {STEPS.map((step, index) => (
              <RevealOnScroll key={step.number} delayMs={index * 100}>
                <div className="relative h-full rounded-2xl border border-amber/15 bg-void/50 p-6 pt-8 backdrop-blur-md transition-all duration-500 hover:scale-[1.03] hover:border-amber/30 hover:shadow-[0_15px_35px_rgba(230,163,92,0.06)] group flex flex-col justify-between">
                  
                  {/* Decorative card bracket details */}
                  <div className="absolute top-3 left-3 w-1.5 h-1.5 border-t border-l border-amber/20 group-hover:border-amber/40 transition-colors" />
                  <div className="absolute top-3 right-3 w-1.5 h-1.5 border-t border-r border-amber/20 group-hover:border-amber/40 transition-colors" />

                  {/* Absolute Badge for Step Number (Breaks the top border elegantly) */}
                  <div className="absolute -top-3 left-6 px-3.5 py-0.5 rounded-full border border-amber/25 bg-void font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-amber shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                    {step.number}
                  </div>

                  <div>
                    {/* Step Icon */}
                    <div className="text-[11px] font-mono text-amber/45 group-hover:text-amber transition-colors mb-4">
                      STEP {step.number}
                    </div>

                    {/* Step Title & Description */}
                    <h3 className="font-display text-lg italic text-bright mb-2.5 group-hover:text-amber transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-subtle">
                      {step.description}
                    </p>
                  </div>

                  {/* Dot timeline anchor at the top-center (aligned with the timeline connector) */}
                  <div className="hidden sm:block absolute -top-[4px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-amber/40 bg-void group-hover:bg-amber transition-colors duration-300" />
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
