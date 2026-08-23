/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { StarChart } from "@/components/astrolab/StarChart";
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
      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="archive-kicker text-[#c79a52]">Astrifer Dijital Sayfa</p>
          <h1 className="mt-5 font-display text-5xl leading-none sm:text-7xl">Bir gecenin yaşayan arşivi.</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#aeb5ba]">Gerçek yıldız haritası, kişisel mesaj, fotoğraflar ve ses tek bir kalıcı bağlantıda. Uygulama indirmeden her telefonda açılır.</p>
          <div className="mt-8 flex items-end gap-4"><strong className="font-display text-5xl text-white">{formatTRY(pricing.digitalPrice)}</strong>{pricing.digitalOriginalPrice > pricing.digitalPrice && <span className="mb-1 text-sm text-[#7d878e] line-through">{formatTRY(pricing.digitalOriginalPrice)}</span>}</div>
          <p className="mt-2 archive-kicker text-[#7d878e]">Tek ödeme · abonelik yok · kalıcı bağlantı</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/create" className="archive-button-primary">Sayfamı oluştur</Link><Link href={`/urun/dijital/ornek/${demo.paletteId}`} className="archive-button-secondary">Tam örneği aç</Link></div>
        </div>
        <div className="archive-frame p-3 sm:p-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 archive-kicker text-[#7d878e]"><span>Gerçek ürün görünümü</span><span>Mobil + masaüstü</span></div>
          <div className="relative mt-3 aspect-[5/4] overflow-hidden bg-[#050910]">
            <StarChart sky={sky} palette={palette} showLabels label="Dijital ürün örneği" className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-x-0 top-7 text-center"><p className="archive-kicker text-[#c79a52]">{record.locationName}</p><h2 className="mt-2 font-display text-4xl italic text-white">{record.title}</h2></div>
          </div>
        </div>
      </section>

      <section className="archive-paper px-4 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="archive-kicker text-[#8b6331]">Sayfanın içinde</p>
          <h2 className="mt-4 max-w-3xl font-display text-5xl leading-tight">Sadece harita değil; tamamlanmış bir hediye deneyimi.</h2>
          <div className="mt-12 grid gap-px bg-[#19212a]/20 sm:grid-cols-2 lg:grid-cols-4">
            {[["01", "Açılış", "İsimleriniz, anın tarihi ve konumu."], ["02", "Gerçek gökyüzü", "Ay, gezegenler ve isimlendirilmiş yıldızlar."], ["03", "Kişisel içerik", "4 fotoğraf, mesaj, video, ses veya müzik."], ["04", "Yaşayan zaman", "Her 6 ayda yeni bir anı ekleme alanı."]].map(([n, title, body]) => (
              <div key={n} className="min-h-56 bg-[#f2eee4] p-6"><span className="archive-kicker text-[#a64d3d]">{n}</span><h3 className="mt-10 font-display text-3xl">{title}</h3><p className="mt-3 text-sm leading-6 text-[#59636c]">{body}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div><p className="archive-kicker text-[#c79a52]">Anılar görünür kalır</p><h2 className="mt-4 font-display text-5xl">Galeri gibi değil, hikâye gibi.</h2><p className="mt-5 text-sm leading-6 text-[#aeb5ba]">Fotoğraflar gökyüzünün altında, tarihleri ve notlarıyla gösterilir. Bu yüzden sayfa hazır bir şablon değil, size ait bir kayıt gibi hissedilir.</p></div>
          <div className="grid grid-cols-2 gap-3">
            {first?.photos.slice(0, 4).map((photo, index) => photo.url && <div key={photo.url} className="archive-paper p-2">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={photo.url} alt={`Örnek anı ${index + 1}`} className="aspect-square w-full object-cover" /></div>)}
          </div>
        </div>
      </section>

      <section className="archive-paper px-4 py-20 text-center sm:px-8"><div className="mx-auto max-w-3xl"><p className="archive-kicker text-[#8b6331]">Satın almadan önce görün</p><h2 className="mt-4 font-display text-6xl">Kendi gecenizi ücretsiz çıkarın.</h2><p className="mx-auto mt-5 max-w-xl text-[#59636c]">Önizleme için ödeme gerekmez. Bilgilerinizi girin, sayfanızın tamamını görün ve sonra karar verin.</p><Link href="/create" className="archive-button-primary mt-8">Önizlemeyi başlat</Link></div></section>
    </main>
  );
}
