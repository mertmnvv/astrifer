import type { Metadata } from "next";
import Link from "next/link";
import { CrossSell } from "@/components/CrossSell";
import { JournalShowcase } from "@/components/journal/JournalShowcase";
import { AuroraHeader } from "@/components/home/AuroraHeader";
import { AuroraFooter } from "@/components/home/AuroraFooter";
import { AuroraField } from "@/components/home/AuroraField";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { AtlasPanel } from "@/components/atlas/AtlasPanel";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { LazyMount } from "@/components/ui/LazyMount";
import { BackCoverPage } from "@/components/journal/night/BackCoverPage";
import { LetterInsertPage } from "@/components/journal/night/LetterInsertPage";
import { NightCoverPage } from "@/components/journal/night/NightCoverPage";
import { QrPage } from "@/components/journal/night/QrPage";
import { getJournalTheme } from "@/components/journal/night/journalTheme";
import { JournalThemeProvider } from "@/components/journal/JournalThemeContext";
import { ScaledPreview } from "@/components/ScaledPreview";
import { computeSky } from "@/lib/astronomy/computeSky";
import { getSiteUrl } from "@/lib/siteUrl";
import { formatTRY } from "@/lib/pricing";
import { getPricingConfig } from "@/lib/pricingConfig";
import { DEMO_STAR_MAP } from "@/lib/starmaps";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deri Defter — Astrifer",
  description: "Kapağında adın, içinde o anın gerçek gökyüzü — premium suni deri ciltli, 26 sayfalık kişiye özel bir defter.",
};



const CTA_CLASS =
  "inline-block rounded-full bg-gradient-to-br from-iris to-flare px-7 py-3.5 text-center font-mono text-xs uppercase tracking-widest text-white shadow-[0_12px_40px_-14px_rgba(124,58,237,0.6)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-light";

const SAMPLE_LETTER_TEXT =
  "Bana evet dediğin an, gökyüzü buydu. Bu mektubu bugün yazıyorum ki yıllar sonra bu sayfayı açtığımızda o geceyi unutmayalım — seni o an ne kadar sevdiğimi hatırlaman için. İyi ki varsın.";

const SAMPLE_OPENING_DATE = new Date("2029-06-21T00:00:00.000Z");

const PROCESS_STEPS = [
  { n: "01", title: "Anınızı girin", body: "Tarih, saat, konum ve isimlerinizi /create'te girin." },
  { n: "02", title: "Gerçek gökyüzünüzü görün", body: "O anın gerçek astronomik gökyüzü hesaplanır." },
  { n: "03", title: "Ekleyip sipariş verin", body: "Deri Defter'i işaretleyip sepete ekleyin." },
];

const MATERIAL_FEATURES = [
  "Premium suni deri, el işçiliği ciltleme",
  "Özel gofre (sıcak baskı) kapak deseni",
  "Altın yaldızlı sayfa kenarı",
  "15 sayfa boş/çizgili, 26 sayfalık kitap",
  "Birlikte Anılarımız fotoğraf sayfası (4 foto)",
  "Gelecek Mektubu — ileri tarihe mühürlü mektup",
  "Hediye altın renkli kalem",
  "Gömülü akıllı QR kod bağlantısı",
];

const QR_BULLETS = [
  "Fotoğraf galerinize ve sesli mesajınıza ulaşın",
  "Zamanla yeni anılar ekleyin",
  "Bağlantı sizin adınıza, kalıcı",
];

const FAQ = [
  {
    q: "Nasıl sipariş veririm?",
    a: "Deri Defter ayrı bir sipariş değil — önce /create'te dijital sayfanızı oluşturursunuz, \"Bu anı fiziksel olarak da saklamak ister misiniz?\" adımında Deri Defter'i işaretler, Gelecek Mektubu metninizi ve açılış tarihini girersiniz. Tek sepette, tek siparişte ilerler.",
  },
  {
    q: "\"Suni deri\" ne demek?",
    a: "Kapak, hakiki deri değil premium vegan/suni deri ile kaplıdır — dokusu ve görünümü hakiki deriyi andırır.",
  },
  {
    q: "Gelecek Mektubu nasıl korunuyor?",
    a: "Yazdığınız mektup mühürlenip arka kapaktaki ayrı bir cebe yerleştirilir — kitabın kendi sayfalarında görünmez, yalnızca belirlediğiniz açılış tarihinde açılması beklenir.",
  },
  {
    q: "Kargo ve üretim süresi ne kadar?",
    a: "Üretim 5-7 iş günü sürer, kargo ücrete dahildir. Yanında altın renkli bir kalem hediye gönderilir.",
  },
];

function CheckListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-xs text-muted">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-iris-light"
      >
        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>{children}</span>
    </li>
  );
}

export default async function JournalProductPage() {
  const source = DEMO_STAR_MAP;

  const sky = computeSky({
    date: source.eventDateUtc,
    latitude: source.latitude,
    longitude: source.longitude,
  });

  const initialEntry = source.entries.find((entry) => entry.isInitial) ?? source.entries[0];
  const memoryPhotos = initialEntry?.photos ?? [];
  const qrUrl = `${getSiteUrl()}/s/${source.slug}`;
  const { journalPrice, journalOriginalPrice } = await getPricingConfig();
  const openingDateLabel = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(SAMPLE_OPENING_DATE);



  return (
    <>
      <AuroraHeader />
      <main className="relative min-h-screen px-4 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
        <AuroraField />
        <div className="mx-auto max-w-5xl">
          <JournalThemeProvider theme={getJournalTheme("gece-laciverti")}>
          <header className="mb-8 sm:mb-12">
            <div className="lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-iris-light">Deri Defter</p>
                <h1 className="mt-3.5 font-display text-3xl italic text-bright sm:text-5xl">
                  Kapağında adın, içinde o an.
                </h1>
                <div className="mx-auto mt-3 max-w-xl text-sm text-subtle sm:text-base lg:mx-0">
                  <span>
                    Premium suni deri ciltli, 26 sayfalık kişiye özel bir defter — kapakta gerçek
                    yıldız haritan, içinde anılarınız ve mühürlü bir gelecek mektubu.{" "}
                  </span>
                  {journalOriginalPrice > journalPrice ? (
                    <span className="flex items-center gap-1.5 inline-flex flex-wrap">
                      <span className="line-through text-dim">{formatTRY(journalOriginalPrice)}</span>
                      <span className="text-iris-light font-semibold">{formatTRY(journalPrice)}</span>
                      <span className="rounded bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-400">
                        %{Math.round(((journalOriginalPrice - journalPrice) / journalOriginalPrice) * 100)} İNDİRİM
                      </span>
                    </span>
                  ) : (
                    <span>{formatTRY(journalPrice)}</span>
                  )}
                </div>
                <div className="mt-7 flex flex-col items-center gap-3 lg:items-start">
                  <Link href="/create" className={CTA_CLASS}>
                    Yaşayan Sayfanızı Oluşturun →
                  </Link>
                  <a
                    href="#icindekiler"
                    className="font-mono text-[11px] uppercase tracking-widest text-dim transition-colors hover:text-iris-light"
                  >
                    26 sayfayı keşfedin ↓
                  </a>
                </div>
              </div>

              <div className="relative mx-auto mt-10 w-full max-w-[240px] sm:max-w-[300px] lg:mt-0 lg:max-w-[320px]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-8 -z-10 hidden rounded-full lg:block"
                  style={{ background: "radial-gradient(60% 60% at 50% 50%, rgba(230,184,119,0.16), transparent 70%)" }}
                />
                <NightCoverPage names={source.title} />
              </div>
            </div>
          </header>

          <div id="icindekiler" className="mb-10">
            <RevealOnScroll>
              <HomeSectionHeading eyebrow="Keşfedin" title="Defterin sayfalarını çevirerek inceleyin." />
            </RevealOnScroll>
            <RevealOnScroll delayMs={100}>
              <JournalShowcase
                sky={sky}
                title={source.title}
                memoryPhotos={memoryPhotos}
                journalPrice={journalPrice}
                journalOriginalPrice={journalOriginalPrice}
              />
            </RevealOnScroll>
          </div>

          <div className="mt-16 border-t border-text/10 pt-10">
            <RevealOnScroll>
              <HomeSectionHeading eyebrow="Gelecek Mektubu" title="Bugün yazılan, yıllarca beklenen." />
            </RevealOnScroll>
            <RevealOnScroll delayMs={100}>
              <AtlasPanel padding="lg" className="mx-auto mt-10 max-w-3xl">
                <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
                  <div className="mx-auto w-full max-w-[240px]">
                    <LazyMount placeholderClassName="aspect-[3/4] w-full">
                      <BackCoverPage />
                    </LazyMount>
                  </div>
                  <div className="mx-auto w-full max-w-[240px]">
                    <LazyMount placeholderClassName="aspect-[3/4] w-full">
                      <ScaledPreview designWidth={600} designHeight={800}>
                        <LetterInsertPage letterText={SAMPLE_LETTER_TEXT} openingDateLabel={openingDateLabel} widthPx={600} heightPx={800} />
                      </ScaledPreview>
                    </LazyMount>
                  </div>
                </div>
                <p className="mt-8 text-sm leading-relaxed text-subtle">
                  Kitabın arka kapağında mühürlü bir cep var — kendi Gelecek Mektubunuz buraya, kitabın kendi
                  sayfalarından ayrı ve kapalı olarak yerleştirilir. Belirlediğiniz açılış tarihine kadar kimse
                  okuyamaz. Krem renkli kart bilerek kitabın gece temasından farklı: bu sayfa kitaba hiç girmiyor,
                  yalnızca cebe konuyor.
                </p>
              </AtlasPanel>
            </RevealOnScroll>
          </div>

          <div className="mt-16 border-t border-text/10 pt-10">
            <RevealOnScroll>
              <HomeSectionHeading eyebrow="Dijital Bağlantı" title="Kapaktan ekrana, tek dokunuş." />
            </RevealOnScroll>
            <RevealOnScroll delayMs={100}>
              <AtlasPanel padding="lg" className="mx-auto mt-10 max-w-3xl">
                <div className="grid gap-6 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-center sm:gap-10">
                  <div className="mx-auto w-full max-w-[220px]">
                    <LazyMount placeholderClassName="aspect-[3/4] w-full">
                      <QrPage qrUrl={qrUrl} />
                    </LazyMount>
                  </div>
                  <ul className="space-y-3">
                    {QR_BULLETS.map((item) => (
                      <CheckListItem key={item}>{item}</CheckListItem>
                    ))}
                  </ul>
                </div>
              </AtlasPanel>
            </RevealOnScroll>
          </div>

          <div className="mt-16 border-t border-text/10 pt-10">
            <RevealOnScroll>
              <HomeSectionHeading eyebrow="Malzeme & İşçilik" title="Her ayrıntı, elle düşünüldü." />
            </RevealOnScroll>
            <RevealOnScroll delayMs={100}>
              <AtlasPanel padding="lg" className="mx-auto mt-10 max-w-3xl">
                <p className="text-sm leading-relaxed text-subtle">
                  Kapak, hakiki deri değil premium vegan/suni deri ile kaplıdır — dokusu ve görünümü hakiki deriyi
                  andırır. Kargo dahil, üretim süresi 5-7 iş günü.
                </p>
                <ul className="mt-6 grid gap-x-6 gap-y-2.5 border-t border-text/10 pt-5 sm:grid-cols-2">
                  {MATERIAL_FEATURES.map((feat) => (
                    <CheckListItem key={feat}>{feat}</CheckListItem>
                  ))}
                </ul>
              </AtlasPanel>
            </RevealOnScroll>
          </div>

          <div className="mt-16 border-t border-text/10 pt-10">
            <RevealOnScroll>
              <HomeSectionHeading eyebrow="Nasıl Çalışır" title="Üç adımda, elde tutulur bir an." />
            </RevealOnScroll>
            <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
              {PROCESS_STEPS.map((step, index) => (
                <RevealOnScroll key={step.n} delayMs={index * 100}>
                  <AtlasPanel padding="lg" className="h-full">
                    <p className="font-mono text-[11px] text-iris-light">{step.n}</p>
                    <p className="mt-2 font-display text-lg italic text-bright">{step.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-subtle">{step.body}</p>
                  </AtlasPanel>
                </RevealOnScroll>
              ))}
            </div>
          </div>

          <div className="mt-16 border-t border-text/10 pt-10">
            <RevealOnScroll>
              <HomeSectionHeading eyebrow="Destek" title="Sıkça Sorulan Sorular" />
            </RevealOnScroll>
            <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-4">
              {FAQ.map((item, index) => (
                <RevealOnScroll key={item.q} delayMs={index * 80}>
                  <AtlasPanel padding="lg">
                    <p className="font-display text-base italic text-bright">{item.q}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-subtle">{item.a}</p>
                  </AtlasPanel>
                </RevealOnScroll>
              ))}
            </div>
          </div>

          <div className="mt-14 flex justify-center">
            <Link href="/create" className={CTA_CLASS}>
              Yaşayan Sayfanızı Oluşturun →
            </Link>
          </div>
          </JournalThemeProvider>

          <CrossSell exclude={["journal"]} />
        </div>
      </main>
      <AuroraFooter />
    </>
  );
}
