/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { CelestialGlobe3D } from "@/components/starmap/CelestialGlobe3D";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { computeSky } from "@/lib/astronomy/computeSky";
import { formatTRY } from "@/lib/pricing";
import type { PricingConfig } from "@/lib/pricingConfig";
import { DIGITAL_DEMO_SHOWCASES } from "@/lib/demoStarMaps";

export function DigitalProductV2({ pricing }: { pricing: PricingConfig }) {
  const demo = DIGITAL_DEMO_SHOWCASES.find((item) => item.paletteId === "gece-laciverti") ?? DIGITAL_DEMO_SHOWCASES[0];
  const record = demo.starMap;
  const sky = computeSky({ date: record.eventDateUtc, latitude: record.latitude, longitude: record.longitude });
  const palette = getSkyPalette(record.palette);
  const first = record.entries.find((entry) => entry.isInitial);

  return (
    <main>
      <section className="mx-auto grid min-h-[calc(100svh-65px)] max-w-[1500px] items-center gap-12 px-4 py-14 sm:px-8 lg:grid-cols-[0.72fr_1.28fr]">
        <div><p className="archive-kicker text-[#5eead4]">Hatırname Dijital Sayfa</p><h1 className="archive-display-balanced mt-6 text-6xl leading-[0.88] text-white sm:text-8xl">Bir gecenin yaşayan portalı.</h1><p className="mt-7 max-w-xl text-base leading-8 text-[#b3c6da]">Gerçek yıldızlar, kişisel mesaj, fotoğraflar ve ses; döndürülebilen 3D bir göğün altında tek bir kalıcı bağlantıda yaşar.</p><div className="mt-8 flex items-end gap-4"><strong className="font-display text-6xl text-white">{formatTRY(pricing.digitalPrice)}</strong>{pricing.digitalOriginalPrice > pricing.digitalPrice && <span className="mb-2 text-sm text-[#7890a8] line-through">{formatTRY(pricing.digitalOriginalPrice)}</span>}</div><p className="mt-2 archive-kicker text-[#7890a8]">Tek ödeme · abonelik yok · kalıcı bağlantı</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/create" className="archive-button-primary">Sayfamı oluştur</Link><Link href={`/urun/dijital/ornek/${demo.paletteId}`} className="archive-button-secondary">Tam 3D örneği aç</Link></div></div>
        <div><div className="archive-globe-frame p-2 sm:p-3"><CelestialGlobe3D sky={sky} palette={palette} label="Dijital ürün 3D örneği" className="aspect-square min-h-[430px] sm:aspect-[6/5] lg:min-h-[630px]" /></div><div className="flex justify-between border-x border-b border-[#9dd2ff]/10 bg-[#030b19]/90 px-4 py-4 archive-kicker text-[#7890a8]"><span>{record.title}</span><span className="text-[#5eead4]">Gerçek ürün görünümü</span></div></div>
      </section>

      <section className="archive-paper px-4 py-24 sm:px-8"><div className="mx-auto max-w-7xl"><p className="archive-kicker text-[#5eead4]">Sayfanın içinde</p><h2 className="archive-display-balanced mt-5 max-w-4xl text-5xl leading-[0.95] text-white sm:text-7xl">Düz bir harita değil; tamamlanmış bir gece deneyimi.</h2><div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["01","Sinematik açılış","İsimler, tarih ve konum gece sahnesinin içinde belirir."],["02","Canlı 3D gök","Yıldızları döndürün, yakınlaştırın ve gerçek adlarıyla seçin."],["03","Kişisel hikâye","Fotoğraflar, mesaj, video, ses veya müzikle size dönüşür."],["04","Yaşayan zaman","Her altı ayda eklenen yeni anlarla sayfa büyümeye devam eder."]].map(([n,title,body])=><div key={n} className="night-surface min-h-64 p-6"><span className="archive-kicker text-[#5eead4]">{n}</span><h3 className="mt-12 font-display text-3xl font-semibold text-white">{title}</h3><p className="mt-4 text-sm leading-7 text-[#9fb4ca]">{body}</p></div>)}</div></div></section>

      <section className="px-4 py-24 sm:px-8"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.68fr_1.32fr]"><div><p className="archive-kicker text-[#9a8cf0]">Anılar görünür kalır</p><h2 className="archive-display-balanced mt-5 text-5xl leading-[0.95] text-white sm:text-7xl">Galeri gibi değil, hikâye gibi.</h2><p className="mt-6 text-sm leading-7 text-[#9fb4ca]">Fotoğraflar tarihler, notlar ve o anın göğüyle birlikte gösterilir. Şablon hissi vermez; size ait bir gece kaydı gibi akar.</p></div><div className="grid auto-rows-[14rem] grid-cols-2 gap-3">{first?.photos.slice(0,4).map((photo,index)=>photo.url&&<div key={photo.url} className={`relative overflow-hidden border border-[#9dd2ff]/10 ${index===0?"row-span-2":""}`}><img src={photo.url} alt={`Örnek anı ${index+1}`} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-[#020711]/80 to-transparent"/><span className="absolute bottom-4 right-4 archive-kicker text-[#5eead4]">0{index+1}</span></div>)}</div></div></section>

      <section className="archive-paper px-4 py-24 text-center sm:px-8"><div className="mx-auto max-w-4xl"><p className="archive-kicker text-[#5eead4]">Satın almadan önce görün</p><h2 className="archive-display-balanced mt-5 text-6xl leading-[0.9] text-white sm:text-8xl">Kendi gecenizi ücretsiz açın.</h2><p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#9fb4ca]">Önizleme için ödeme gerekmez. Bilgilerinizi girin, 3D sayfanızın tamamını görün ve sonra karar verin.</p><Link href="/create" className="archive-button-primary mt-9">3D önizlemeyi başlat</Link></div></section>
    </main>
  );
}
