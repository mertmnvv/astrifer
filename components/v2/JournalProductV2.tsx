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
  ["02", "Gökyüzü sayfası", "İki sayfalık kesintisiz gerçek yıldız haritası."],
  ["04", "Anı sayfası", "Seçtiğiniz dört fotoğraf için ayrı baskı alanı."],
  ["15", "Yazı sayfası", "Gelecekte ekleyeceğiniz anılar için boş alan."],
  ["01", "Mühürlü mektup", "Belirlediğiniz tarihte açılacak ayrı fiziksel ek."],
];

export function JournalProductV2(props: Props) {
  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100svh-65px)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-8 lg:grid-cols-[0.78fr_1.22fr]">
        <div><p className="archive-kicker text-[#5eead4]">Astrifer Deri Defter</p><h1 className="archive-display-balanced mt-6 text-6xl leading-[0.88] text-white sm:text-8xl">Gökyüzünüzü elinizde tutun.</h1><p className="mt-7 max-w-xl text-base leading-8 text-[#b3c6da]">Premium vegan/suni deri kapaklı, 26 sayfalık kişisel zaman kapsülü. İçindeki yıldız haritası sizin tarih ve konumunuzdan hesaplanır.</p><div className="mt-8 flex items-end gap-4"><strong className="font-display text-6xl text-white">{formatTRY(props.price)}</strong>{props.originalPrice>props.price&&<span className="mb-2 text-sm text-[#7890a8] line-through">{formatTRY(props.originalPrice)}</span>}</div><p className="mt-2 archive-kicker text-[#7890a8]">Dijital sayfa dahil · üretim 5–7 iş günü</p><Link href="/create" className="archive-button-primary mt-9">Defterimi tasarla</Link></div>
        <div className="archive-frame relative overflow-hidden p-6 sm:p-10"><div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#1d5f9e]/20 blur-3xl"/><div className="relative mx-auto aspect-[3/4] max-w-sm border border-[#5eead4]/35 bg-gradient-to-br from-[#0d2340] to-[#030914] p-5 shadow-[0_35px_90px_rgba(0,0,0,.55)]"><div className="flex h-full flex-col items-center justify-between border border-[#5eead4]/25 p-8 text-center"><span className="archive-kicker text-[#5eead4]">Astrifer · kişisel baskı</span><div><span className="mx-auto block h-10 w-10 rotate-45 border border-[#5eead4] shadow-[0_0_30px_rgba(94,234,212,.25)]"/><h2 className="mt-9 font-display text-5xl font-semibold italic text-white">{props.title}</h2><p className="mt-3 archive-kicker text-[#7890a8]">Gökyüzü zaman kapsülü</p></div><span className="archive-kicker text-[#5eead4]">26 sayfa · özel üretim</span></div></div></div>
      </section>

      <section className="archive-paper px-4 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><p className="archive-kicker text-[#5eead4]">Kutudan çıkanlar</p><h2 className="archive-display-balanced mt-5 max-w-3xl text-6xl text-white">Her sayfanın görevi belli.</h2><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{PAGE_CONTENTS.map(([number,title,body])=><div key={title} className="night-surface p-6"><strong className="font-display text-5xl text-[#9a8cf0]">{number}</strong><h3 className="mt-7 font-display text-3xl font-semibold text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-[#9fb4ca]">{body}</p></div>)}</div></div></section>

      <section className="px-4 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><div className="mb-10 max-w-3xl"><p className="archive-kicker text-[#5eead4]">Basılacak gerçek sayfalar</p><h2 className="archive-display-balanced mt-5 text-6xl leading-[0.95] text-white">Defteri, çevrilebilir canlı önizlemede inceleyin.</h2><p className="mt-5 text-sm leading-7 text-[#9fb4ca]">Ekrandaki sayfalar baskı motorunun kullandığı aynı bileşenlerden oluşturulur.</p></div><JournalShowcase sky={props.sky} title={props.title} eventDateUtc={props.eventDateUtc} timezone={props.timezone} locationName={props.locationName} latitude={props.latitude} longitude={props.longitude} memoryPhotos={props.photos} journalPrice={props.price} journalOriginalPrice={props.originalPrice}/></div></section>

      <section className="archive-paper px-4 py-24 text-center sm:px-8"><div className="mx-auto max-w-4xl"><p className="archive-kicker text-[#5eead4]">Önce kişiselleştirin</p><h2 className="archive-display-balanced mt-5 text-6xl leading-[0.9] text-white sm:text-8xl">Baskıya girmeden önce her sayfayı görün.</h2><p className="mx-auto mt-6 max-w-xl text-[#9fb4ca]">Tarih ve içeriğinizi girin; dijital sayfa ile defter önizlemesi birlikte hazırlansın.</p><Link href="/create" className="archive-button-primary mt-9">Defteri tasarla</Link></div></section>
    </main>
  );
}
