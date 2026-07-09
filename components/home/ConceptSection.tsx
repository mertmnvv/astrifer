import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const CONCEPT_ITEMS = [
  {
    title: "Gerçek Gökyüzü",
    description: "O gün, o saat, o konumdaki gökyüzü — gerçek astronomik verilerle, olduğu gibi hesaplanır.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-6 w-6">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" strokeLinecap="round" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: "Kalıcı Bir Adres",
    description: "Sizin adınıza kayıtlı, yıllar sonra bile aynı yerde duran kişisel bir sayfa ve bağlantı.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-6 w-6">
        <path d="M9 15l6-6M10 6.5l1-1a3.5 3.5 0 015 5l-1 1M14 17.5l-1 1a3.5 3.5 0 01-5-5l1-1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Yeniden Yaşayın",
    description: "Fotoğraf, sesli mesaj ve satırlarınızla o ana istediğiniz an, istediğiniz kadar geri dönün.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="h-6 w-6">
        <path
          d="M12 20.2c-.5 0-1-.15-1.4-.46C6.9 17 3.6 13.9 3.6 10.2 3.6 7.3 5.85 5 8.7 5c1.28 0 2.5.5 3.3 1.4C12.8 5.5 14 5 15.3 5c2.85 0 5.1 2.3 5.1 5.2 0 3.7-3.3 6.8-7 9.54-.4.31-.9.46-1.4.46z"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export function ConceptSection() {
  return (
    <section className="px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <RevealOnScroll className="mx-auto max-w-xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-brass-dim">Ne İnşa Ediyoruz</p>
          <h2 className="mt-4 font-display text-3xl italic text-text sm:text-4xl">Bir zaman kapsülü, dijital olarak.</h2>
        </RevealOnScroll>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {CONCEPT_ITEMS.map((concept, index) => (
            <RevealOnScroll key={concept.title} delayMs={index * 120} className="rounded-lg bg-panel-navy/60 p-7 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-brass-dim/50 text-brass">
                {concept.icon}
              </div>
              <h3 className="mt-5 font-display text-xl italic text-text">{concept.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-haze">{concept.description}</p>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
