import Link from "next/link";
import { CelestialGlobe3D } from "@/components/starmap/CelestialGlobe3D";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { formatTRY } from "@/lib/pricing";
import type { PricingConfig } from "@/lib/pricingConfig";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";

const DIGITAL_CONTENTS = [
  "Kalıcı, size özel paylaşım bağlantısı",
  "Gerçek tarih, saat ve konum gökyüzü",
  "4 fotoğraf, mesaj, ses, video veya müzik",
  "Etkileşimli 3D küre ve Yıldız Anahtarı",
  "Her 6 ayda büyüyen anı zaman çizelgesi",
];

const JOURNAL_CONTENTS = [
  "Premium vegan/suni deri kapak",
  "26 kişiselleştirilmiş fiziksel sayfa",
  "İki sayfalık gerçek yıldız haritası",
  "Dijital sayfanıza açılan kalıcı QR",
  "Mühürlü Gelecek Mektubu ve yaldızlı kalem",
];

function FeatureList({ items }: { items: string[] }) {
  return <ul className="mt-7 space-y-3">{items.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-[#b3c6da]"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5eead4] shadow-[0_0_12px_#5eead4]" />{item}</li>)}</ul>;
}

export function HomeV2({ sky, pricing }: { sky: ComputeSkyResult; pricing: PricingConfig }) {
  const palette = getSkyPalette("gece-laciverti");
  return (
    <main>
      <section className="relative mx-auto grid min-h-[calc(100svh-65px)] max-w-[1500px] items-center gap-12 overflow-hidden px-4 py-14 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:py-20">
        <div className="relative z-10 max-w-2xl">
          <p className="archive-kicker night-glow-text">Bir link değil · yaşayan bir gece</p>
          <h1 className="archive-display-balanced mt-6 text-6xl leading-[0.88] text-white sm:text-8xl lg:text-[7rem]">
            O gece gökyüzü<br /><em className="font-medium text-[#79f3df]">yalnızca size aitti.</em>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-8 text-[#b3c6da] sm:text-lg">
            Seçtiğiniz anın gerçek astronomik göğünü; 3D yıldız küresi, fotoğraflarınız, sesiniz ve hikâyenizle kalıcı bir dijital deneyime dönüştürün.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/create" className="archive-button-primary">Ücretsiz önizlemeyi başlat</Link>
            <Link href="/urun/dijital/ornek/gece-laciverti" className="archive-button-secondary">Canlı örneğe gir</Link>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 border-y border-[#9dd2ff]/10 py-5">
            <div><strong className="block font-display text-3xl text-white">1×</strong><span className="archive-kicker text-[#7890a8]">Tek ödeme</span></div>
            <div className="border-x border-[#9dd2ff]/10 px-4"><strong className="block font-display text-3xl text-white">Kalıcı</strong><span className="archive-kicker text-[#7890a8]">Kişisel link</span></div>
            <div className="pl-4"><strong className="block font-display text-3xl text-white">Gerçek</strong><span className="archive-kicker text-[#7890a8]">Astronomi</span></div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[760px]">
          <div className="absolute -inset-16 -z-10 rounded-full bg-[#1d5f9e]/20 blur-[100px]" />
          <div className="archive-globe-frame p-2 sm:p-3">
            <CelestialGlobe3D sky={sky} palette={palette} label="Şu anki gerçek gökyüzü" className="aspect-square min-h-[430px] sm:aspect-[6/5] lg:min-h-[650px]" />
          </div>
          <div className="flex items-center justify-between border-x border-b border-[#9dd2ff]/10 bg-[#030b19]/90 px-4 py-4 archive-kicker text-[#7890a8]">
            <span>Şu an · İstanbul göğü</span><span className="text-[#5eead4]">Canlı hesaplama</span>
          </div>
        </div>
      </section>

      <section id="urunler" className="archive-paper px-4 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl"><p className="archive-kicker text-[#5eead4]">Sipariş sonunda ne alacaksınız?</p><h2 className="archive-display-balanced mt-5 text-5xl leading-[0.95] text-white sm:text-7xl">İki ürün. İkisi de sizin gecenizden üretilir.</h2></div>
          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            <article className="night-surface relative overflow-hidden p-7 sm:p-10">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#1d5f9e]/20 blur-3xl" />
              <div className="relative flex items-start justify-between gap-6"><div><p className="archive-kicker text-[#5eead4]">01 · Dijital Sayfa</p><h3 className="mt-4 font-display text-5xl font-semibold text-white">Gökyüzüne açılan kişisel portal</h3></div><p className="font-display text-4xl text-white">{formatTRY(pricing.digitalPrice)}</p></div>
              <p className="relative mt-6 max-w-xl text-sm leading-7 text-[#9fb4ca]">Telefon ve bilgisayarda açılan, uygulama gerektirmeyen; yıldızları gerçekten hareket ettirebildiğiniz kalıcı sayfa.</p>
              <FeatureList items={DIGITAL_CONTENTS} />
              <div className="relative mt-9 flex flex-wrap gap-3"><Link href="/urun/dijital" className="archive-button-secondary">Detayları gör</Link><Link href="/create" className="archive-button-primary">Oluştur</Link></div>
            </article>
            <article className="night-surface relative overflow-hidden p-7 sm:p-10">
              <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#9a8cf0]/15 blur-3xl" />
              <div className="relative flex items-start justify-between gap-6"><div><p className="archive-kicker text-[#9a8cf0]">02 · Deri Defter</p><h3 className="mt-4 font-display text-5xl font-semibold text-white">Gecenin elde tutulan hali</h3></div><p className="font-display text-4xl text-white">{formatTRY(pricing.journalPrice)}</p></div>
              <p className="relative mt-6 max-w-xl text-sm leading-7 text-[#9fb4ca]">Premium vegan/suni deri, gece tonlu kişisel baskılar ve dijital deneyiminize bağlanan fiziksel zaman kapsülü.</p>
              <FeatureList items={JOURNAL_CONTENTS} />
              <div className="relative mt-9 flex flex-wrap gap-3"><Link href="/urun/defter" className="archive-button-secondary">Defteri incele</Link><Link href="/create" className="archive-button-primary">Tasarla</Link></div>
            </article>
          </div>
        </div>
      </section>

      <section id="ornek" className="px-4 py-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div><p className="archive-kicker text-[#5eead4]">Bir sayfanın içinde</p><h2 className="archive-display-balanced mt-5 text-5xl leading-[0.95] text-white sm:text-7xl">Bakılan değil, içine girilen bir hatıra.</h2><p className="mt-6 text-base leading-8 text-[#9fb4ca]">Önizleme artık düz bir kart değil. Ziyaretçi göğü döndürür, yıldızları seçer; aşağı indikçe fotoğraflar, ses ve zaman çizelgesi aynı gecenin sahneleri gibi açılır.</p><Link href="/urun/dijital/ornek/gece-laciverti" className="archive-button-primary mt-8">3D örneği deneyimle</Link></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[["01","Karşılama","İsimler, tarih ve konumla sinematik açılış"],["02","3D gökyüzü","Gerçek koordinatlar, seçilebilir yıldızlar ve gezegenler"],["03","Hatıra sahneleri","Fotoğraf, video, ses ve kişisel mesaj"],["04","Yaşayan arşiv","Her altı ayda büyüyen zaman çizelgesi"]].map(([n,title,body],index)=><div key={title} className={`night-surface min-h-56 p-7 ${index===1||index===2?"sm:translate-y-6":""}`}><span className="archive-kicker text-[#5eead4]">{n}</span><h3 className="mt-10 font-display text-4xl font-semibold text-white">{title}</h3><p className="mt-3 text-sm leading-6 text-[#9fb4ca]">{body}</p></div>)}
          </div>
        </div>
      </section>

      <section className="archive-paper px-4 py-24 text-center sm:px-8"><div className="mx-auto max-w-4xl"><p className="archive-kicker text-[#5eead4]">Önce görün · sonra karar verin</p><h2 className="archive-display-balanced mt-5 text-6xl leading-[0.9] text-white sm:text-8xl">Sizin geceniz nasıl görünürdü?</h2><p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#9fb4ca]">Tarih, saat ve konumu girin. 3D gökyüzünüzü ve ürün önizlemelerinizi ücretsiz görün; ödeme en son adımda.</p><Link href="/create" className="archive-button-primary mt-9">Geceyi oluşturmaya başla</Link></div></section>
    </main>
  );
}
