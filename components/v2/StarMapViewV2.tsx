"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { CrossSell } from "@/components/CrossSell";
import { StarChart } from "@/components/astrolab/StarChart";
import { StarKeyLegend } from "@/components/astrolab/StarKeyLegend";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { VoiceNote } from "@/components/journal/VoiceNote";
import { Timeline } from "@/components/starmap/Timeline";
import { computeSky } from "@/lib/astronomy/computeSky";
import { getCosmicEvents } from "@/lib/astronomy/cosmicEvents";
import { buildSkyNarrative } from "@/lib/astronomy/skyNarrative";
import type { StarMapRecord } from "@/lib/starmaps";

const CelestialGlobe3D = dynamic(
  () => import("@/components/starmap/CelestialGlobe3D").then((module) => module.CelestialGlobe3D),
  {
    ssr: false,
    loading: () => <div className="grid h-full place-items-center bg-[#050910] archive-kicker text-[#7890a8]">3D gökyüzü hazırlanıyor…</div>,
  },
);

export interface StarMapViewV2Props {
  starMap: StarMapRecord;
  isPreview?: boolean;
  isOwner?: boolean;
  step?: number;
  furthestStep?: number;
}

function formatDate(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("tr-TR", { timeZone: timezone, dateStyle: "long", timeStyle: "short" }).format(date);
}

function editHref(starMap: StarMapRecord, step?: number, furthestStep?: number) {
  const params = new URLSearchParams({
    title: starMap.title,
    message: starMap.message ?? "",
    location: starMap.locationName,
    lat: String(starMap.latitude),
    lon: String(starMap.longitude),
    timezone: starMap.timezone,
    date: starMap.eventDateUtc.toISOString(),
    palette: starMap.palette,
  });
  const first = starMap.entries.find((entry) => entry.isInitial) ?? starMap.entries[0];
  const photos = first?.photos.map((photo) => photo.url).filter(Boolean) ?? [];
  if (photos.length) params.set("photos", photos.join(","));
  if (starMap.voiceNoteUrl) params.set("voice", starMap.voiceNoteUrl);
  if (starMap.videoUrl) params.set("video", starMap.videoUrl);
  if (step) params.set("step", String(step));
  if (furthestStep) params.set("furthestStep", String(furthestStep));
  return `/create?${params.toString()}`;
}

function PhotoGrid({ photos }: { photos: { url?: string | null; caption?: string | null }[] }) {
  if (!photos.length) return null;
  return (
    <div className={`grid auto-rows-[12rem] gap-3 ${photos.length > 1 ? "sm:grid-cols-2" : ""}`}>
      {photos.map((photo, index) => photo.url && (
        <figure key={`${photo.url}-${index}`} className={`group relative overflow-hidden border border-[#9dd2ff]/10 bg-[#071426] text-white ${index === 0 && photos.length > 2 ? "sm:row-span-2" : ""}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt={photo.caption ?? `Anı fotoğrafı ${index + 1}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b10]/90 via-transparent to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 font-display text-xl font-semibold">
            <span>{photo.caption ?? "O günden bir kare"}</span><span className="font-mono text-[10px] text-[#5eead4]">0{index + 1}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function StarMapViewV2({ starMap, isPreview = false, isOwner = false, step, furthestStep }: StarMapViewV2Props) {
  const sky = computeSky({ date: starMap.eventDateUtc, latitude: starMap.latitude, longitude: starMap.longitude });
  const palette = getSkyPalette(starMap.palette);
  const cosmic = getCosmicEvents(sky);
  const narrative = buildSkyNarrative(sky);
  const dateLabel = formatDate(starMap.eventDateUtc, starMap.timezone);
  const firstEntry = starMap.entries.find((entry) => entry.isInitial) ?? starMap.entries[0];
  const periodicEntries = starMap.entries.filter((entry) => entry !== firstEntry);
  const returnHref = editHref(starMap, step, furthestStep);

  return (
    <div className="archive-shell min-h-screen">
      {isPreview && (
        <div className="sticky top-[65px] z-40 border-b border-[#5eead4]/30 bg-[#020711]/95 px-4 py-3 text-white backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#5eead4] shadow-[0_0_14px_#5eead4]" />
              <div><p className="archive-kicker text-[#5eead4]">Birebir 3D sayfa önizlemesi</p><p className="mt-1 hidden text-xs text-[#7890a8] sm:block">Müşterinizin açacağı sayfa tam olarak bu deneyimdir.</p></div>
            </div>
            <Link href={returnHref} className="archive-button-secondary !min-h-9 !px-4 !py-2">Düzenlemeye dön</Link>
          </div>
        </div>
      )}

      <main>
        <section className="relative mx-auto grid min-h-[calc(100svh-65px)] max-w-[1500px] items-center gap-10 overflow-hidden px-4 py-10 sm:px-8 lg:grid-cols-[0.68fr_1.32fr] lg:py-14">
          <div aria-hidden className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#1d5f9e]/20 blur-[100px]" />
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-3"><span className="archive-kicker text-[#5eead4]">Astrifer kişisel gece</span><span className="h-px w-12 bg-[#5eead4]/40" /></div>
            <h1 className="archive-display-balanced mt-6 text-6xl leading-[0.88] text-white sm:text-8xl lg:text-[6.8rem]">{starMap.title}</h1>
            <p className="mt-7 max-w-md font-mono text-[10px] uppercase leading-6 tracking-[0.19em] text-[#9fb4ca]">{dateLabel}<br />{starMap.locationName}</p>
            {starMap.message && <blockquote className="mt-8 max-w-xl border-l border-[#5eead4] pl-5 font-display text-2xl font-medium italic leading-9 text-[#edf7ff]">“{starMap.message}”</blockquote>}
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#gokyuzu" className="archive-button-primary">3D gökyüzünü keşfet</a>
              {isOwner && <Link href={returnHref} className="archive-button-secondary">Sayfayı düzenle</Link>}
            </div>
            <div className="mt-10 grid grid-cols-3 border-y border-white/10 py-4">
              <div><span className="archive-kicker text-[#7890a8]">Kayıt</span><strong className="mt-2 block font-display text-xl text-white">#{starMap.slug.slice(0, 7).toUpperCase()}</strong></div>
              <div className="border-x border-white/10 px-4"><span className="archive-kicker text-[#7890a8]">Yıldız</span><strong className="mt-2 block font-display text-xl text-white">{sky.stars.length}</strong></div>
              <div className="pl-4"><span className="archive-kicker text-[#7890a8]">Ay</span><strong className="mt-2 block font-display text-xl text-white">{cosmic.moonPhaseName}</strong></div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="archive-globe-frame p-2 sm:p-3">
              <CelestialGlobe3D sky={sky} palette={palette} label={`${starMap.title} için etkileşimli 3D gökyüzü`} className="aspect-square min-h-[420px] sm:aspect-[6/5] lg:min-h-[610px]" />
            </div>
            <div className="grid grid-cols-3 border-x border-b border-white/10 bg-[#0e1720] py-4 text-center">
              <div><span className="block archive-kicker text-[#7890a8]">Enlem</span><strong className="mt-1 block font-mono text-xs">{starMap.latitude.toFixed(3)}°</strong></div>
              <div className="border-x border-white/10"><span className="block archive-kicker text-[#7890a8]">Boylam</span><strong className="mt-1 block font-mono text-xs">{starMap.longitude.toFixed(3)}°</strong></div>
              <div><span className="block archive-kicker text-[#7890a8]">Zaman</span><strong className="mt-1 block font-mono text-xs">Efemeris</strong></div>
            </div>
          </div>
        </section>

        <section id="gokyuzu" className="archive-paper px-4 py-20 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="archive-kicker text-[#5eead4]">02 · Arşiv levhası</p>
              <h2 className="archive-display-balanced mt-4 max-w-2xl text-5xl leading-[0.95] sm:text-7xl">Hareketli göğün kalıcı astronomik kaydı.</h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-[#9fb4ca]">Üstteki küre gökyüzünü keşfetmeniz için; bu levha ise yıldızların o ana ait kesin yerleşimini saklamak için hazırlandı. Her numara sağdaki gerçek gök cismiyle eşleşir.</p>
              <div className="mt-8 aspect-[5/4] overflow-hidden border border-[#9dd2ff]/15 bg-[#07101a] p-2 shadow-[0_28px_70px_rgba(0,4,16,.35)]">
                <StarChart sky={sky} palette={palette} interactive showLabels label={`${dateLabel} gökyüzü haritası`} className="h-full w-full" />
              </div>
            </div>
            <aside className="night-surface border border-[#9dd2ff]/15 p-6 sm:p-8">
              <p className="archive-kicker text-[#9a8cf0]">03 · Yıldız anahtarı</p>
              <StarKeyLegend sky={sky} palette={palette} className="mt-6" />
              <div className="mt-8 border-t border-[#9dd2ff]/15 pt-6">
                <p className="font-display text-2xl italic">{narrative || cosmic.moonDescription}</p>
                {cosmic.specialEvent && <p className="mt-4 text-sm leading-6 text-[#9fb4ca]"><strong>{cosmic.specialEvent}:</strong> {cosmic.specialEventDescription}</p>}
              </div>
            </aside>
          </div>
        </section>

        {(firstEntry?.photos.length || isPreview) && (
          <section className="px-4 py-20 sm:px-8">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.62fr_1.38fr]">
              <div>
                <p className="archive-kicker text-[#5eead4]">İlk kayıt</p>
                <h2 className="mt-4 font-display text-5xl">Gökyüzünün altındaki hikâye.</h2>
                <p className="mt-5 text-sm leading-6 text-[#9fb4ca]">Fotoğraflar bir galerinin içinde kaybolmaz; seçtiğiniz anın tarihi ve gökyüzüyle aynı arşivde yaşar.</p>
              </div>
              {firstEntry?.photos.length ? <PhotoGrid photos={firstEntry.photos} /> : (
                <Link href={returnHref} className="flex min-h-72 items-center justify-center border border-dashed border-[#5eead4]/30 text-center archive-kicker text-[#5eead4]">Fotoğraf eklemek için düzenlemeye dön</Link>
              )}
            </div>
          </section>
        )}

        {(starMap.videoUrl || starMap.voiceNoteUrl || starMap.musicUrl) && (
          <section className="border-y border-[#9dd2ff]/10 bg-[#071426]/90 px-4 py-14 sm:px-8">
            <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
              <div><p className="archive-kicker text-[#5eead4]">Sesli kayıt</p><h2 className="mt-3 font-display text-4xl">Bu anın sesi de burada.</h2></div>
              <div className="space-y-4">
                {starMap.videoUrl && <video src={starMap.videoUrl} controls className="w-full border border-white/15 bg-black" />}
                {starMap.voiceNoteUrl && <VoiceNote url={starMap.voiceNoteUrl} />}
                {starMap.musicUrl && <a href={starMap.musicUrl} target="_blank" rel="noreferrer" className="archive-button-secondary w-full">Seçilen şarkıyı aç</a>}
              </div>
            </div>
          </section>
        )}

        {(periodicEntries.length > 0 || isOwner) && (
          <section className="archive-paper px-4 py-20 sm:px-8">
            <div className="mx-auto max-w-5xl text-[#edf7ff]">
              <Timeline slug={starMap.slug} createdAt={starMap.createdAt} entries={periodicEntries} palette={palette} isOwner={isOwner} isPreviewMode={isPreview} />
            </div>
          </section>
        )}

        <section className="px-4 py-20 text-center sm:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="archive-kicker text-[#5eead4]">Astrifer · {starMap.slug}</p>
            <h2 className="mt-4 font-display text-5xl sm:text-7xl">Bu an artık kaybolmaz.</h2>
            <p className="mx-auto mt-5 max-w-xl text-[#9fb4ca]">{isPreview ? "3D önizlemeniz hazır. İçeriği düzenleyebilir veya ürün seçimine devam edebilirsiniz." : "Siz de bir tarihin gerçek gökyüzünü kişisel bir arşive dönüştürebilirsiniz."}</p>
            <Link href={isPreview ? returnHref : "/create"} className="archive-button-primary mt-8">{isPreview ? "Düzenlemeye dön" : "Kendi sayfanı oluştur"}</Link>
          </div>
        </section>
        {!isPreview && isOwner && (
          <div className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-8">
            <CrossSell exclude={["digital"]} />
          </div>
        )}
      </main>
    </div>
  );
}
