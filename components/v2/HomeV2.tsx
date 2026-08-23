import Link from "next/link";
import { StarChart } from "@/components/astrolab/StarChart";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { formatTRY } from "@/lib/pricing";
import type { PricingConfig } from "@/lib/pricingConfig";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";

const DIGITAL_CONTENTS = [
  "Size özel, kalıcı paylaşım bağlantısı",
  "Tarih, saat ve konuma göre gerçek gökyüzü",
  "Kişisel mesaj, 4 fotoğraf, ses veya müzik",
  "Yıldızların gerçek adlarını gösteren Yıldız Anahtarı",
  "Her 6 ayda yeni bir an eklenen yaşayan zaman çizelgesi",
];

const JOURNAL_CONTENTS = [
  "Kişiye özel kapak ve 26 fiziksel sayfa",
  "İki sayfalık gerçek yıldız haritası",
  "4 anı sayfası ve 15 yazılabilir sayfa",
  "Dijital sayfaya açılan kalıcı QR bağlantısı",
  "Mühürlü Gelecek Mektubu ve yaldızlı kalem",
];

function Tick({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-6 text-current opacity-80">
      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#c79a52]" />
      <span>{children}</span>
    </li>
  );
}

export function HomeV2({ sky, pricing }: { sky: ComputeSkyResult; pricing: PricingConfig }) {
  const palette = getSkyPalette("gece-laciverti");
  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100svh-65px)] max-w-7xl items-center gap-12 px-4 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
        <div className="max-w-2xl">
          <p className="archive-kicker text-[#c79a52]">Bir link değil, yaşayan bir hatıra</p>
          <h1 className="mt-5 font-display text-5xl font-normal leading-[0.96] text-[#f2eee4] sm:text-7xl">
            O günün gökyüzü.<br />Sizin hikâyeniz.<br /><em className="text-[#c79a52]">Tek bir sayfada.</em>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-[#bcc1c5] sm:text-lg">
            Bir tarih, saat ve konum seçin. O anın gerçek yıldızlarını; fotoğraflarınız, mesajınız ve müziğinizle kalıcı bir dijital sayfaya dönüştürelim.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/create" className="archive-button-primary">Kendi sayfanı oluştur</Link>
            <Link href="/urun/dijital/ornek/gece-laciverti" className="archive-button-secondary">Örneği aç</Link>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 border-y border-white/10 py-4">
            <div><strong className="block font-display text-2xl text-white">1×</strong><span className="archive-kicker text-[#8f979d]">Tek ödeme</span></div>
            <div className="border-x border-white/10 px-4"><strong className="block font-display text-2xl text-white">Kalıcı</strong><span className="archive-kicker text-[#8f979d]">Kişisel link</span></div>
            <div className="pl-4"><strong className="block font-display text-2xl text-white">Gerçek</strong><span className="archive-kicker text-[#8f979d]">Astronomi</span></div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[650px]">
          <div className="archive-frame p-3 sm:p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 archive-kicker text-[#929aa0]">
              <span>Canlı ürün kesiti</span><span>astrifer.com/s/sizin-aniniz</span>
            </div>
            <div className="relative mt-3 aspect-[4/5] overflow-hidden bg-[#050910] sm:aspect-[5/4]">
              <StarChart sky={sky} palette={palette} showLabels label="Astrifer dijital sayfa örneği" className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#050910] to-transparent" />
              <div className="absolute inset-x-0 top-7 text-center">
                <p className="archive-kicker text-[#c79a52]">14 Eylül 2024 · İstanbul</p>
                <p className="mt-3 font-display text-4xl italic text-white">Deniz & Ege</p>
              </div>
              <div className="absolute inset-x-4 bottom-4 border border-white/15 bg-[#0b1118]/90 p-4 backdrop-blur">
                <p className="font-display text-xl italic text-[#f2eee4]">“Her şeyin başladığı gece, gökyüzü tam olarak böyleydi.”</p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center archive-kicker text-[#737d84]">Gördüğünüz yıldızlar dekoratif değil; astronomik olarak hesaplanır.</p>
        </div>
      </section>

      <section id="urunler" className="archive-paper px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="archive-kicker text-[#8b6331]">Sipariş sonunda elinizde ne olacak?</p>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">İki net ürün. Gizli paket yok, sürpriz ücret yok.</h2>
          </div>
          <div className="mt-12 grid gap-px bg-[#19212a]/20 lg:grid-cols-2">
            <article className="bg-[#f2eee4] p-7 sm:p-10">
              <div className="flex items-start justify-between gap-6">
                <div><p className="archive-kicker text-[#a64d3d]">01 · Dijital Sayfa</p><h3 className="mt-3 font-display text-4xl">Paylaşılabilen kişisel arşiv</h3></div>
                <p className="font-display text-3xl">{formatTRY(pricing.digitalPrice)}</p>
              </div>
              <p className="mt-5 text-sm leading-6 text-[#56606a]">Telefon ve bilgisayarda açılır. Kurulum gerektirmez. Hazır olduğunda size özel bağlantıyı paylaşmanız yeterlidir.</p>
              <ul className="mt-7 space-y-2">{DIGITAL_CONTENTS.map((x) => <Tick key={x}>{x}</Tick>)}</ul>
              <div className="mt-8 flex gap-3"><Link href="/urun/dijital" className="archive-button-secondary !border-[#19212a]/30 !text-[#19212a]">Detayları gör</Link><Link href="/create" className="archive-button-primary">Oluştur</Link></div>
            </article>
            <article className="bg-[#19212a] p-7 text-[#f2eee4] sm:p-10">
              <div className="flex items-start justify-between gap-6">
                <div><p className="archive-kicker text-[#c79a52]">02 · Deri Defter</p><h3 className="mt-3 font-display text-4xl">Elde tutulabilen zaman kapsülü</h3></div>
                <p className="font-display text-3xl">{formatTRY(pricing.journalPrice)}</p>
              </div>
              <p className="mt-5 text-sm leading-6 text-[#aeb5ba]">Premium vegan/suni deri kapak, baskıya özel sayfalar ve dijital sayfanızla birlikte hazırlanır.</p>
              <ul className="mt-7 space-y-2">{JOURNAL_CONTENTS.map((x) => <Tick key={x}>{x}</Tick>)}</ul>
              <div className="mt-8 flex gap-3"><Link href="/urun/defter" className="archive-button-secondary">Defteri incele</Link><Link href="/create" className="archive-button-primary">Tasarla</Link></div>
            </article>
          </div>
        </div>
      </section>

      <section id="ornek" className="px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
            <div>
              <p className="archive-kicker text-[#c79a52]">Para eden şey nedir?</p>
              <h2 className="mt-4 font-display text-4xl leading-tight sm:text-6xl">Bir gecede biten efekt değil. Yıllarca büyüyen bir kayıt.</h2>
              <p className="mt-6 text-base leading-7 text-[#aeb5ba]">Sayfa yalnızca yıldız haritası göstermez; o güne ait sesi, fotoğrafları ve yazıyı aynı anlatı içinde saklar. Altı ayda bir yeni an eklenir. Hediye, verildiği gün eskimez.</p>
            </div>
            <div className="grid gap-px bg-white/10 sm:grid-cols-2">
              {[
                ["Açılış", "İsimler, tarih ve konumla kişisel bir giriş"],
                ["Gökyüzü", "Döndürülebilen gerçek yıldız haritası ve Ay evresi"],
                ["Hikâye", "Mesaj, fotoğraflar, video, ses veya seçilen şarkı"],
                ["Gelecek", "Yeni anılarla büyüyen zaman çizelgesi ve defter QR'ı"],
              ].map(([title, body], i) => (
                <div key={title} className="min-h-52 bg-[#111b25] p-7">
                  <span className="archive-kicker text-[#69757e]">0{i + 1}</span>
                  <h3 className="mt-8 font-display text-3xl text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#aeb5ba]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#111b25] px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="archive-kicker text-[#c79a52]">Üç adımda hazır</p>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {[["01", "Anı seçin", "Tarih, saat, konum ve isimleri girin."], ["02", "İçeriği ekleyin", "Mesajınızı, fotoğrafları ve müziği seçin."], ["03", "Önce görün", "Ürünü satın almadan önce sayfanızı ve defterinizi inceleyin."]].map(([n, t, d]) => (
              <div key={n} className="border-l border-[#c79a52]/50 pl-5"><span className="archive-kicker text-[#c79a52]">{n}</span><h3 className="mt-3 font-display text-3xl">{t}</h3><p className="mt-2 text-sm text-[#aeb5ba]">{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="archive-paper px-4 py-20 text-center sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="archive-kicker text-[#8b6331]">Önce görün, sonra karar verin</p>
          <h2 className="mt-4 font-display text-5xl leading-tight sm:text-7xl">Sizin geceniz nasıl görünürdü?</h2>
          <p className="mx-auto mt-5 max-w-xl text-[#59636c]">Bilgilerinizi girin, gerçek gökyüzünüzü ve ürün önizlemelerini ücretsiz hazırlayın. Ödeme en son adımda.</p>
          <Link href="/create" className="archive-button-primary mt-8">Ücretsiz önizlemeyi başlat</Link>
        </div>
      </section>
    </main>
  );
}
