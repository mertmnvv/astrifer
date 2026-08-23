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

export function JournalProductV2(props: Props) {
  return (
    <main>
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
        <div>
          <p className="archive-kicker text-[#c79a52]">Astrifer Deri Defter</p>
          <h1 className="mt-5 font-display text-5xl leading-none sm:text-7xl">Gökyüzünüzü elinizde tutun.</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#aeb5ba]">Premium vegan/suni deri kapaklı, 26 sayfalık kişisel zaman kapsülü. İçindeki yıldız haritası sizin tarih ve konumunuzdan hesaplanır.</p>
          <div className="mt-8 flex items-end gap-4"><strong className="font-display text-5xl text-white">{formatTRY(props.price)}</strong>{props.originalPrice > props.price && <span className="mb-1 text-sm text-[#7d878e] line-through">{formatTRY(props.originalPrice)}</span>}</div>
          <p className="mt-2 archive-kicker text-[#7d878e]">Dijital sayfa dahil · üretim 5–7 iş günü</p>
          <Link href="/create" className="archive-button-primary mt-8">Defterimi tasarla</Link>
        </div>
        <div className="archive-frame p-5 sm:p-8">
          <div className="mx-auto aspect-[3/4] max-w-sm border border-[#c79a52]/50 bg-[#101a2e] p-5 shadow-2xl">
            <div className="flex h-full flex-col items-center justify-between border border-[#c79a52]/40 p-8 text-center">
              <span className="archive-kicker text-[#c79a52]">Astrifer · kişisel baskı</span>
              <div><span className="mx-auto block h-10 w-10 rotate-45 border border-[#c79a52]" /><h2 className="mt-8 font-display text-4xl italic text-[#f2eee4]">{props.title}</h2><p className="mt-3 archive-kicker text-[#8f979d]">Gökyüzü zaman kapsülü</p></div>
              <span className="archive-kicker text-[#c79a52]">26 sayfa · özel üretim</span>
            </div>
          </div>
        </div>
      </section>

      <section className="archive-paper px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl"><p className="archive-kicker text-[#8b6331]">Kutudan çıkanlar</p><h2 className="mt-4 max-w-3xl font-display text-5xl">Her sayfanın görevi belli.</h2><div className="mt-10 grid gap-px bg-[#19212a]/20 sm:grid-cols-2 lg:grid-cols-4">{[["02", "Gökyüzü sayfası", "İki sayfalık kesintisiz gerçek yıldız haritası."], ["04", "Anı sayfası", "Seçtiğiniz dört fotoğraf için ayrı baskı alanı."], ["15", "Yazı sayfası", "Gelecekte ekleyeceğiniz anılar için boş alan."], ["01", "Mühürlü mektup", "Belirlediğiniz tarihte açılacak ayrı fiziksel ek."]].map(([n,t,d]) => <div key={t} className="bg-[#f2eee4] p-6"><strong className="font-display text-5xl text-[#a64d3d]">{n}</strong><h3 className="mt-7 font-display text-2xl">{t}</h3><p className="mt-3 text-sm leading-6 text-[#59636c]">{d}</p></div>)}</div></div>
      </section>

      <section className="px-4 py-20 sm:px-8"><div className="mx-auto max-w-7xl"><div className="mb-8 max-w-2xl"><p className="archive-kicker text-[#c79a52]">Basılacak gerçek sayfalar</p><h2 className="mt-4 font-display text-5xl">Defteri, çevrilebilir sade bir önizlemede inceleyin.</h2><p className="mt-4 text-sm leading-6 text-[#aeb5ba]">Ekrandaki sayfalar baskı motorunun kullandığı aynı bileşenlerden oluşturulur.</p></div><JournalShowcase sky={props.sky} title={props.title} eventDateUtc={props.eventDateUtc} timezone={props.timezone} locationName={props.locationName} latitude={props.latitude} longitude={props.longitude} memoryPhotos={props.photos} journalPrice={props.price} journalOriginalPrice={props.originalPrice} /></div></section>

      <section className="archive-paper px-4 py-20 text-center sm:px-8"><div className="mx-auto max-w-3xl"><p className="archive-kicker text-[#8b6331]">Önce kişiselleştirin</p><h2 className="mt-4 font-display text-6xl">Baskıya girmeden önce her sayfayı görün.</h2><p className="mx-auto mt-5 max-w-xl text-[#59636c]">Tarih ve içeriğinizi girin; dijital sayfa ile defter önizlemesi birlikte hazırlansın.</p><Link href="/create" className="archive-button-primary mt-8">Defteri tasarla</Link></div></section>
    </main>
  );
}
