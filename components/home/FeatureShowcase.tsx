import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const FEATURES = [
  {
    title: "3D Gök Küresi",
    description: "Yıldızları, gezegenleri ve Ay'ı gerçek koordinatlarıyla döndürüp yakınlaştırın.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.2" className="h-5 w-5">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" />
        <ellipse cx="12" cy="12" rx="8.5" ry="3.4" stroke="currentColor" />
        <path d="M12 3.5v17" stroke="currentColor" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Müzik Görselleştirici",
    description: "Seçtiğiniz şarkının ritmine göre yıldızlar ve takımyıldızlar canlanır.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.2" className="h-5 w-5">
        <path d="M4 15V9l16-2v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="17" r="2" stroke="currentColor" />
        <circle cx="18" cy="15" r="2" stroke="currentColor" />
      </svg>
    ),
  },
  {
    title: "AI Hikaye Asistanı",
    description: "Birkaç ipucundan, o ana özel romantik bir mektup taslağı yazdırın.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.2" className="h-5 w-5">
        <path d="M12 3.5l1.8 4.4 4.4 1.8-4.4 1.8-1.8 4.4-1.8-4.4-4.4-1.8 4.4-1.8L12 3.5z" stroke="currentColor" strokeLinejoin="round" />
        <path d="M19 15.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9z" stroke="currentColor" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Gece/Gündüz Döngüsü",
    description: "Sayfa, ziyaretçinin saatine göre sabah, gündüz, akşam ve gece tonlarına bürünür.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.2" className="h-5 w-5">
        <path d="M12 3.5v2M12 18.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3.5 12h2M18.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke="currentColor" strokeLinecap="round" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" />
      </svg>
    ),
  },
  {
    title: "Kozmik Olay Senkronu",
    description: "O günün Ay evresini ve varsa meteor yağmurunu sayfanıza otomatik işler.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.2" className="h-5 w-5">
        <path d="M14.5 3.8a8 8 0 100 16.4 6.4 6.4 0 010-16.4z" stroke="currentColor" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const ICON_ACCENTS = ["text-iris-light", "text-flare-light", "text-glow-light", "text-iris-light", "text-flare-light"];

export function FeatureShowcase() {
  return (
    <section className="relative px-4 py-16 sm:px-8 select-none bg-nebula overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-[70%] bg-gradient-to-r from-transparent via-iris/30 to-transparent" />

      <div className="mx-auto max-w-5xl">
        <RevealOnScroll>
          <div className="mb-8 flex items-center justify-center gap-3 text-iris-light/80" aria-hidden>
            <span className="h-px w-8 bg-iris/30" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em]">Sayfanızda Sizi Bekleyenler</span>
            <span className="h-px w-8 bg-flare/30" />
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
          {FEATURES.map((feature, index) => (
            <RevealOnScroll key={feature.title} delayMs={index * 90}>
              <div className="group relative flex h-full flex-col items-center gap-2.5 rounded-2xl border border-iris/10 bg-panel/40 px-3 py-5 text-center backdrop-blur-md transition-all duration-500 hover:border-iris/30 hover:bg-iris/[0.04]">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full border border-iris/20 ${ICON_ACCENTS[index % ICON_ACCENTS.length]} opacity-80 transition-colors group-hover:opacity-100 group-hover:border-iris/40`}>
                  {feature.icon}
                </div>
                <h3 className="font-display text-[13px] italic text-bright leading-snug">
                  {feature.title}
                </h3>
                <p className="text-[10.5px] leading-relaxed text-subtle">
                  {feature.description}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
