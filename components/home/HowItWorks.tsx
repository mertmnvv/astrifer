import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";

const STEPS = [
  {
    number: "01",
    title: "Anı Seçin",
    description: "Doğum, ilk buluşma, evlilik teklifi... Sizin veya sevdiğiniz biri için özel olan o anı seçin.",
  },
  {
    number: "02",
    title: "Gökyüzünü Hesaplayalım",
    description: "Girdiğiniz tarih, saat ve konumdaki gerçek gökyüzünü astronomik verilerle anında çizelim.",
  },
  {
    number: "03",
    title: "Kişiselleştirin",
    description: "Fotoğraflar, sesli bir mesaj ve kendi satırlarınızla o ana kendi imzanızı atın.",
  },
  {
    number: "04",
    title: "Sonsuza Dek Saklayın",
    description: "Kalıcı dijital sayfanız hazır — dilerseniz el yapımı deri defter ürünüyle taçlandırın.",
  },
];

export function HowItWorks() {
  return (
    <section id="nasil-calisir" className="scroll-mt-20 px-4 py-28 sm:px-8 select-none relative overflow-hidden bg-nebula">
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-glow/[0.05] blur-3xl pointer-events-none -z-10" />

      <div className="mx-auto max-w-5xl">
        <RevealOnScroll>
          <HomeSectionHeading eyebrow="Nasıl Çalışır" title="Üç dakikada başlar, ömür boyu sürer." />
        </RevealOnScroll>

        <div className="relative mt-16">
          <div
            aria-hidden
            className="hidden sm:block absolute top-0 left-[12%] right-[12%] h-[1.5px] pointer-events-none -z-10"
            style={{ backgroundImage: 'linear-gradient(to right, rgba(167,139,250,0) 0%, rgba(167,139,250,0.4) 15%, rgba(244,114,182,0.4) 85%, rgba(244,114,182,0) 100%)', backgroundSize: 'cover' }}
          />

          <div className="grid gap-7 sm:grid-cols-4">
            {STEPS.map((step, index) => (
              <RevealOnScroll key={step.number} delayMs={index * 100}>
                <div className="relative h-full rounded-2xl border border-iris/15 bg-panel/50 p-6 pt-8 backdrop-blur-md transition-all duration-500 hover:scale-[1.03] hover:border-iris/30 hover:shadow-[0_15px_35px_rgba(167,139,250,0.1)] group flex flex-col justify-between">
                  <div className="absolute top-3 left-3 w-1.5 h-1.5 border-t border-l border-iris/25 group-hover:border-iris/50 transition-colors" />
                  <div className="absolute top-3 right-3 w-1.5 h-1.5 border-t border-r border-flare/25 group-hover:border-flare/50 transition-colors" />

                  <div className="absolute -top-3 left-6 px-3.5 py-0.5 rounded-full border border-iris/30 bg-nebula font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-iris-light shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                    {step.number}
                  </div>

                  <div>
                    <div className="text-[11px] font-mono text-iris-light/50 group-hover:text-iris-light transition-colors mb-4">
                      STEP {step.number}
                    </div>

                    <h3 className="font-display text-lg italic text-bright mb-2.5 group-hover:text-flare-light transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-subtle">
                      {step.description}
                    </p>
                  </div>

                  <div className="hidden sm:block absolute -top-[4px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-iris/40 bg-nebula group-hover:bg-gradient-to-r group-hover:from-iris group-hover:to-flare transition-colors duration-300" />
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
