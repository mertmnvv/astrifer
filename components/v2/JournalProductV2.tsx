import Link from "next/link";
import { JournalShowcase } from "@/components/journal/JournalShowcase";
import { formatTRY } from "@/lib/pricing";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import type { StarMapPhoto } from "@/lib/starmaps";

interface Props {
  sky: ComputeSkyResult;
  title: string;
  eventDateUtc: Date;
  timezone: string;
  locationName: string;
  latitude: number;
  longitude: number;
  photos: StarMapPhoto[];
  price: number;
  originalPrice: number;
}

const PAGE_CONTENTS = [
  ["02", "Panoramik gökyüzü", "Yalnızca bu açılımda kullanılan, gece baskılı gerçek yıldız haritası."],
  ["01", "Göksel kayıt", "Ay evresi, gezegenler, tarih, saat ve koordinatların arşiv levhası."],
  ["04", "Anı sayfası", "Seçtiğiniz dört fotoğraf için ayrı baskı alanı."],
  ["12", "Yazı sayfası", "Sorular, ortak hayaller ve gelecekte ekleyeceğiniz anılar için fildişi yapraklar."],
  ["01", "Mühürlü mektup", "Belirlediğiniz tarihte açılacak ayrı fiziksel ek."],
  ["01", "Dijital geçit", "Defterdeki gökyüzünü, müziği ve anıları canlı sayfada açan kişisel QR."],
];

export function JournalProductV2(props: Props) {
  return (
    <main>
      <section className="relative mx-auto grid min-h-[calc(100svh-65px)] max-w-7xl items-center gap-12 overflow-hidden px-4 py-16 sm:px-8 lg:grid-cols-[0.82fr_1.18fr]">
        <div aria-hidden className="absolute left-1/2 top-1/3 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#194d74]/15 blur-[120px]" />
        <div className="relative z-10"><p className="archive-kicker text-[#d7b56d]">Hatırname · Gökyüzü Cildi</p><h1 className="archive-display-balanced mt-6 text-6xl leading-[0.88] text-white sm:text-8xl">Bir geceyi değil, bir hikâyeyi ciltleyin.</h1><p className="mt-7 max-w-xl text-base leading-8 text-[#b3c6da]">Vegan deri, gömme yörünge kabartması ve sıcak metalik baskıyla hazırlanan 26 sayfalık koleksiyon cildi. Gerçek gökyüzü, anılarınız ve dijital deneyiminiz aynı eserde birleşir.</p><div className="mt-8 flex items-end gap-4"><strong className="font-display text-6xl text-white">{formatTRY(props.price)}</strong>{props.originalPrice>props.price&&<span className="mb-2 text-sm text-[#7890a8] line-through">{formatTRY(props.originalPrice)}</span>}</div><p className="mt-2 archive-kicker text-[#7890a8]">Canlı Gökyüzü dahil · numaralı özel üretim · 5–7 iş günü</p><Link href="/create" className="archive-button-primary mt-9">Gökyüzü Cildimi tasarla</Link></div>
        <div className="relative z-10 flex min-h-[620px] items-center justify-center [perspective:1400px]">
          <div className="relative aspect-[3/4] w-[78%] max-w-[390px] rotate-y-[-8deg] border border-[#d7b56d]/35 bg-[linear-gradient(135deg,#10273d_0%,#06101c_55%,#020711_100%)] p-5 shadow-[-22px_28px_0_#02050a,0_55px_120px_rgba(0,0,0,.72)] [transform:rotateY(-9deg)_rotateX(2deg)]">
            <div className="absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-black/70 to-transparent" />
            <div className="relative flex h-full flex-col items-center justify-between border border-[#d7b56d]/30 px-7 py-9 text-center">
              <span className="archive-kicker text-[#d7b56d]">Hatırname · I / 100</span>
              <div className="relative grid h-48 w-48 place-items-center rounded-full border border-[#d7b56d]/35">
                <span className="absolute inset-5 rounded-full border border-[#d7b56d]/20" />
                <span className="absolute h-px w-[120%] rotate-[18deg] bg-[#d7b56d]/35" />
                <span className="h-12 w-12 rotate-45 border border-[#d7b56d] shadow-[0_0_35px_rgba(215,181,109,.22)]" />
              </div>
              <div><h2 className="font-display text-5xl font-semibold italic text-[#fff9ea]">{props.title}</h2><p className="mt-3 archive-kicker text-[#9fb4ca]">Gökyüzü Cildi</p></div>
              <div className="w-full border-t border-[#d7b56d]/20 pt-5"><span className="archive-kicker text-[#d7b56d]">{props.latitude.toFixed(3)}° · {props.longitude.toFixed(3)}°</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="archive-paper px-4 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><p className="archive-kicker text-[#d7b56d]">26 sayfalık ritüel</p><h2 className="archive-display-balanced mt-5 max-w-3xl text-6xl text-white">Gece, an ve gelecek aynı ciltte.</h2><div className="mt-12 grid gap-px overflow-hidden border border-[#9dd2ff]/10 bg-[#9dd2ff]/10 sm:grid-cols-2 lg:grid-cols-3">{PAGE_CONTENTS.map(([number,title,body])=><div key={title} className="bg-[#07101a] p-7"><strong className="font-display text-5xl text-[#d7b56d]">{number}</strong><h3 className="mt-7 font-display text-3xl font-semibold text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-[#9fb4ca]">{body}</p></div>)}</div></div></section>

      <section className="px-4 py-24 sm:px-8"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center"><div><p className="archive-kicker text-[#5eead4]">Fizikselden dijitale</p><h2 className="archive-display-balanced mt-5 text-6xl leading-[0.92] text-white">Sayfayı çevirin. Gökyüzü canlansın.</h2><p className="mt-6 text-sm leading-7 text-[#9fb4ca]">Arka kapaktaki kişisel geçit, defterdeki bölümleri dijital karşılıklarıyla eşleştirir. Baskıdaki yıldızlar 3D kürede, şarkı oynatıcıda, mühürlü tarih ise zaman kilidinde açılır.</p></div><div className="grid gap-3 sm:grid-cols-3">{[["01","Gökyüzü","Tam ekran 3D küre"],["02","Bu anın sesi","Müzik ve ses kaydı"],["03","Gelecek","Zaman kilitli bölüm"]].map(([number,title,body])=><div key={number} className="min-h-56 border border-[#5eead4]/15 bg-[#071426]/80 p-6"><span className="archive-kicker text-[#5eead4]">Geçit {number}</span><h3 className="mt-12 font-display text-3xl text-white">{title}</h3><p className="mt-3 text-sm text-[#9fb4ca]">{body}</p></div>)}</div></div></section>

      <section className="px-4 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><div className="mb-10 max-w-3xl"><p className="archive-kicker text-[#5eead4]">Basılacak gerçek sayfalar</p><h2 className="archive-display-balanced mt-5 text-6xl leading-[0.95] text-white">Defteri, çevrilebilir canlı önizlemede inceleyin.</h2><p className="mt-5 text-sm leading-7 text-[#9fb4ca]">Ekrandaki sayfalar baskı motorunun kullandığı aynı bileşenlerden oluşturulur.</p></div><JournalShowcase sky={props.sky} title={props.title} eventDateUtc={props.eventDateUtc} timezone={props.timezone} locationName={props.locationName} latitude={props.latitude} longitude={props.longitude} memoryPhotos={props.photos} journalPrice={props.price} journalOriginalPrice={props.originalPrice}/></div></section>

      <section className="archive-paper px-4 py-24 text-center sm:px-8"><div className="mx-auto max-w-4xl"><p className="archive-kicker text-[#d7b56d]">Önce kişiselleştirin</p><h2 className="archive-display-balanced mt-5 text-6xl leading-[0.9] text-white sm:text-8xl">Baskıya girmeden önce her sayfayı görün.</h2><p className="mx-auto mt-6 max-w-xl text-[#9fb4ca]">Tarih ve içeriğinizi girin; Canlı Gökyüzü ile Gökyüzü Cildi birlikte hazırlansın.</p><Link href="/create" className="archive-button-primary mt-9">Gökyüzü Cildini tasarla</Link></div></section>
    </main>
  );
}
