"use client";

import Link from "next/link";
import { StarChart } from "@/components/astrolab/StarChart";
import { StarKeyLegend } from "@/components/astrolab/StarKeyLegend";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { VoiceNote } from "@/components/journal/VoiceNote";
import { Timeline } from "@/components/starmap/Timeline";
import { computeSky } from "@/lib/astronomy/computeSky";
import { getCosmicEvents } from "@/lib/astronomy/cosmicEvents";
import { buildSkyNarrative } from "@/lib/astronomy/skyNarrative";
import type { StarMapRecord } from "@/lib/starmaps";

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
    <div className={`grid gap-3 ${photos.length > 1 ? "sm:grid-cols-2" : ""}`}>
      {photos.map((photo, index) => photo.url && (
        <figure key={`${photo.url}-${index}`} className="archive-paper p-2 text-[#19212a]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt={photo.caption ?? `Anı fotoğrafı ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
          <figcaption className="px-2 py-3 font-display text-lg italic">{photo.caption ?? `Arşiv kaydı · ${String(index + 1).padStart(2, "0")}`}</figcaption>
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
        <div className="sticky top-[65px] z-40 border-b border-[#c79a52]/40 bg-[#c79a52] px-4 py-2 text-[#0b1118]">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <p className="archive-kicker">Canlı önizleme · ödeme yapılmadı</p>
            <Link href={returnHref} className="archive-kicker underline underline-offset-4">Düzenlemeye dön</Link>
          </div>
        </div>
      )}

      <main>
        <section className="mx-auto grid min-h-[calc(100svh-65px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="order-2 lg:order-1">
            <p className="archive-kicker text-[#c79a52]">Kişisel gökyüzü kaydı</p>
            <h1 className="mt-5 font-display text-5xl italic leading-none text-white sm:text-7xl">{starMap.title}</h1>
            <p className="mt-6 archive-kicker leading-5 text-[#aeb5ba]">{dateLabel}<br />{starMap.locationName}</p>
            {starMap.message && <blockquote className="mt-8 border-l border-[#c79a52] pl-5 font-display text-2xl italic leading-9 text-[#e8e2d7]">“{starMap.message}”</blockquote>}
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#gokyuzu" className="archive-button-primary">Gökyüzünü incele</a>
              {isOwner && <Link href={returnHref} className="archive-button-secondary">Sayfayı düzenle</Link>}
            </div>
          </div>
          <div className="order-1 archive-frame p-3 lg:order-2 lg:p-5">
            <div className="aspect-square bg-[#050910] sm:aspect-[6/5]">
              <StarChart sky={sky} palette={palette} showLabels label={`${starMap.title} için gerçek gökyüzü`} className="h-full w-full" />
            </div>
            <div className="grid grid-cols-3 border-t border-white/10 pt-4 text-center">
              <div><span className="block archive-kicker text-[#707b83]">Enlem</span><strong className="mt-1 block font-mono text-xs">{starMap.latitude.toFixed(3)}°</strong></div>
              <div className="border-x border-white/10"><span className="block archive-kicker text-[#707b83]">Boylam</span><strong className="mt-1 block font-mono text-xs">{starMap.longitude.toFixed(3)}°</strong></div>
              <div><span className="block archive-kicker text-[#707b83]">Ay</span><strong className="mt-1 block font-mono text-xs">{cosmic.moonPhaseName}</strong></div>
            </div>
          </div>
        </section>

        <section id="gokyuzu" className="archive-paper px-4 py-20 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="archive-kicker text-[#8b6331]">O anın astronomik portresi</p>
              <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-6xl">Gökyüzündeki her işaretin gerçek bir karşılığı var.</h2>
              <div className="mt-8 aspect-[5/4] overflow-hidden border border-[#19212a]/20 bg-[#07101a] p-2">
                <StarChart sky={sky} palette={palette} interactive showLabels label={`${dateLabel} gökyüzü haritası`} className="h-full w-full" />
              </div>
            </div>
            <aside className="border border-[#19212a]/20 p-6 sm:p-8">
              <p className="archive-kicker text-[#a64d3d]">Yıldız anahtarı</p>
              <StarKeyLegend sky={sky} palette={palette} className="mt-6" />
              <div className="mt-8 border-t border-[#19212a]/20 pt-6">
                <p className="font-display text-2xl italic">{narrative || cosmic.moonDescription}</p>
                {cosmic.specialEvent && <p className="mt-4 text-sm leading-6 text-[#59636c]"><strong>{cosmic.specialEvent}:</strong> {cosmic.specialEventDescription}</p>}
              </div>
            </aside>
          </div>
        </section>

        {(firstEntry?.photos.length || isPreview) && (
          <section className="px-4 py-20 sm:px-8">
            <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.62fr_1.38fr]">
              <div>
                <p className="archive-kicker text-[#c79a52]">İlk kayıt</p>
                <h2 className="mt-4 font-display text-5xl">Gökyüzünün altındaki hikâye.</h2>
                <p className="mt-5 text-sm leading-6 text-[#aeb5ba]">Fotoğraflar bir galerinin içinde kaybolmaz; seçtiğiniz anın tarihi ve gökyüzüyle aynı arşivde yaşar.</p>
              </div>
              {firstEntry?.photos.length ? <PhotoGrid photos={firstEntry.photos} /> : (
                <Link href={returnHref} className="flex min-h-72 items-center justify-center border border-dashed border-white/25 text-center archive-kicker text-[#c79a52]">Fotoğraf eklemek için düzenlemeye dön</Link>
              )}
            </div>
          </section>
        )}

        {(starMap.videoUrl || starMap.voiceNoteUrl || starMap.musicUrl) && (
          <section className="border-y border-white/10 bg-[#111b25] px-4 py-14 sm:px-8">
            <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
              <div><p className="archive-kicker text-[#c79a52]">Sesli kayıt</p><h2 className="mt-3 font-display text-4xl">Bu anın sesi de burada.</h2></div>
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
            <div className="mx-auto max-w-5xl text-[#19212a]">
              <Timeline slug={starMap.slug} createdAt={starMap.createdAt} entries={periodicEntries} palette={palette} isOwner={isOwner} isPreviewMode={isPreview} />
            </div>
          </section>
        )}

        <section className="px-4 py-20 text-center sm:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="archive-kicker text-[#c79a52]">Astrifer · {starMap.slug}</p>
            <h2 className="mt-4 font-display text-5xl sm:text-7xl">Bu an artık kaybolmaz.</h2>
            <p className="mx-auto mt-5 max-w-xl text-[#aeb5ba]">{isPreview ? "Önizlemeniz hazır. İçeriği düzenleyebilir veya ürün seçimine devam edebilirsiniz." : "Siz de bir tarihin gerçek gökyüzünü kişisel bir arşive dönüştürebilirsiniz."}</p>
            <Link href={isPreview ? returnHref : "/create"} className="archive-button-primary mt-8">{isPreview ? "Düzenlemeye dön" : "Kendi sayfanı oluştur"}</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
