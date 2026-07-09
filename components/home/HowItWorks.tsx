import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const STEPS = [
  { number: "01", title: "Anı Seçin", description: "Doğum, ilk buluşma, evlilik teklifi... sizin için özel olan o an." },
  { number: "02", title: "Gökyüzünü Hesaplıyoruz", description: "O gün, o saat, o konumdaki gerçek gökyüzünü astronomik verilerle çiziyoruz." },
  { number: "03", title: "Kişiselleştirin", description: "Fotoğraf, sesli mesaj ve kendi satırlarınızı ekleyin." },
  { number: "04", title: "Sonsuza Dek Sizin", description: "Kalıcı sayfanız ve adresiniz hazır — dilerseniz posterde ya da deri defterde." },
];

export function HowItWorks() {
  return (
    <section id="nasil-calisir" className="scroll-mt-20 border-y border-brass-dim/15 bg-panel-navy/30 px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <RevealOnScroll className="mx-auto max-w-xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-brass-dim">Nasıl Çalışır</p>
          <h2 className="mt-4 font-display text-3xl italic text-text sm:text-4xl">Dört adımda, kalıcı bir an.</h2>
        </RevealOnScroll>

        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <RevealOnScroll key={step.number} delayMs={index * 100}>
              <p className="font-mono text-2xl italic text-brass-dim">{step.number}</p>
              <h3 className="mt-3 font-display text-lg italic text-text">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-haze">{step.description}</p>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
