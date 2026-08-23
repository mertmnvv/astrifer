"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CrossSell } from "@/components/CrossSell";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { VoiceNote } from "@/components/journal/VoiceNote";
import { BackgroundMusic } from "@/components/starmap/BackgroundMusic";
import { Timeline } from "@/components/starmap/Timeline";
import { computeSky } from "@/lib/astronomy/computeSky";
import { getCosmicEvents } from "@/lib/astronomy/cosmicEvents";
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

function nextCapsuleDate(createdAt: Date) {
  const next = new Date(createdAt);
  const now = new Date();
  do next.setMonth(next.getMonth() + 6);
  while (next <= now);
  return next;
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
  if (starMap.musicUrl) params.set("music", starMap.musicUrl);
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
  const [skyMode, setSkyMode] = useState<"event" | "today">("event");
  const [musicReactive, setMusicReactive] = useState(Boolean(starMap.musicUrl));
  const eventSky = useMemo(() => computeSky({ date: starMap.eventDateUtc, latitude: starMap.latitude, longitude: starMap.longitude }), [starMap.eventDateUtc, starMap.latitude, starMap.longitude]);
  const today = useMemo(() => new Date(), []);
  const todaySky = useMemo(() => computeSky({ date: today, latitude: starMap.latitude, longitude: starMap.longitude }), [starMap.latitude, starMap.longitude, today]);
  const sky = skyMode === "event" ? eventSky : todaySky;
  const palette = getSkyPalette(starMap.palette);
  const cosmic = getCosmicEvents(sky);
  const dateLabel = formatDate(skyMode === "event" ? starMap.eventDateUtc : today, starMap.timezone);
  const firstEntry = starMap.entries.find((entry) => entry.isInitial) ?? starMap.entries[0];
  const periodicEntries = starMap.entries.filter((entry) => entry !== firstEntry);
  const returnHref = editHref(starMap, step, furthestStep);
  const capsuleDate = nextCapsuleDate(starMap.createdAt);

  return (
    <div className="archive-shell min-h-screen">
      {starMap.musicUrl && <BackgroundMusic url={starMap.musicUrl} onPlayingChange={setMusicReactive} />}

      {isPreview && (
        <div className="fixed inset-x-0 top-0 z-50 border-b border-[#5eead4]/30 bg-[#020711]/90 px-4 py-3 text-white backdrop-blur-xl">
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
        <section className="relative min-h-[100svh] overflow-hidden bg-[#020711] text-white">
          <div className="absolute inset-0">
            <CelestialGlobe3D
              sky={sky}
              palette={palette}
              label={`${starMap.title} için tam ekran etkileşimli 3D gökyüzü`}
              memoryMoments={firstEntry?.photos ?? []}
              musicReactive={musicReactive}
              className="h-full w-full"
            />
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(2,7,17,.92)_0%,rgba(2,7,17,.64)_32%,rgba(2,7,17,.08)_68%),linear-gradient(0deg,rgba(2,7,17,.88)_0%,transparent_38%)]" />
          <div className={`pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-[1600px] flex-col justify-end px-4 pb-10 sm:px-8 sm:pb-14 lg:justify-center lg:pb-0 ${isPreview ? "pt-24" : "pt-20"}`}>
            <Link href="/" className="pointer-events-auto absolute left-4 top-5 font-display text-xl tracking-[0.16em] text-white sm:left-8">HATIRNAME</Link>
            <div className="max-w-xl">
              <div className="flex items-center gap-3"><span className="archive-kicker text-[#5eead4]">Hatırname · canlı gökyüzü</span><span className="h-px w-12 bg-[#5eead4]/40" /></div>
              <h1 className="archive-display-balanced mt-5 text-5xl leading-[0.88] text-white sm:text-7xl lg:text-[6.5rem]">{starMap.title}</h1>
              <p className="mt-5 max-w-md font-mono text-[10px] uppercase leading-6 tracking-[0.19em] text-[#9fb4ca]">{dateLabel}<br />{starMap.locationName}</p>
              {starMap.message && <blockquote className="mt-6 max-w-lg border-l border-[#5eead4] pl-5 font-display text-xl font-medium italic leading-8 text-[#edf7ff] sm:text-2xl">“{starMap.message}”</blockquote>}
              <div className="pointer-events-auto mt-7 flex flex-wrap gap-3">
                {(firstEntry?.photos.length || isPreview) && <a href="#hikaye" className="archive-button-primary">Hikâyeye geç</a>}
                {isOwner && <Link href={returnHref} className="archive-button-secondary">Sayfayı düzenle</Link>}
              </div>
              <div className="pointer-events-auto mt-4 inline-flex border border-white/15 bg-[#020711]/65 p-1 backdrop-blur-xl" aria-label="Gökyüzü tarihi">
                <button type="button" onClick={() => setSkyMode("event")} className={`px-4 py-2 archive-kicker transition ${skyMode === "event" ? "bg-[#5eead4] text-[#020711]" : "text-[#9fb4ca] hover:text-white"}`}>O gece</button>
                <button type="button" onClick={() => setSkyMode("today")} className={`px-4 py-2 archive-kicker transition ${skyMode === "today" ? "bg-[#5eead4] text-[#020711]" : "text-[#9fb4ca] hover:text-white"}`}>Bugünün göğü</button>
              </div>
              <div className="mt-8 grid max-w-lg grid-cols-3 border-y border-white/10 py-4 backdrop-blur-sm">
                <div><span className="archive-kicker text-[#7890a8]">Kayıt</span><strong className="mt-2 block font-display text-base text-white sm:text-xl">#{starMap.slug.slice(0, 7).toUpperCase()}</strong></div>
                <div className="border-x border-white/10 px-3 sm:px-4"><span className="archive-kicker text-[#7890a8]">Yıldız</span><strong className="mt-2 block font-display text-base text-white sm:text-xl">{sky.stars.length}</strong></div>
                <div className="pl-3 sm:pl-4"><span className="archive-kicker text-[#7890a8]">Ay</span><strong className="mt-2 block font-display text-base text-white sm:text-xl">{cosmic.moonPhaseName}</strong></div>
              </div>
            </div>
          </div>
        </section>

        {(firstEntry?.photos.length || isPreview) && (
          <section id="hikaye" className="px-4 py-20 sm:px-8">
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

        {(starMap.videoUrl || starMap.voiceNoteUrl) && (
          <section className="border-y border-[#9dd2ff]/10 bg-[#071426]/90 px-4 py-14 sm:px-8">
            <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
              <div><p className="archive-kicker text-[#5eead4]">Sesli kayıt</p><h2 className="mt-3 font-display text-4xl">Bu anın sesi de burada.</h2></div>
              <div className="space-y-4">
                {starMap.videoUrl && <video src={starMap.videoUrl} controls className="w-full border border-white/15 bg-black" />}
                {starMap.voiceNoteUrl && <VoiceNote url={starMap.voiceNoteUrl} />}
              </div>
            </div>
          </section>
        )}

        <section className="border-y border-[#9dd2ff]/10 bg-[#040b16] px-4 py-16 sm:px-8">
          <div className="mx-auto grid max-w-5xl gap-8 border border-[#9dd2ff]/15 bg-[#071426]/75 p-6 sm:p-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <div>
              <p className="archive-kicker text-[#9a8cf0]">Zaman kilitli bölüm</p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#7890a8]">{formatDate(capsuleDate, starMap.timezone)}</p>
            </div>
            <div>
              <h2 className="font-display text-4xl text-white sm:text-5xl">Hikâyenin sonraki sayfası henüz açılmadı.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#9fb4ca]">Bu sayfa altı aylık döngülerle büyür. Yeni fotoğraf, ses veya mektup zamanı geldiğinde burada yeni bir yıldız yanar.</p>
            </div>
          </div>
        </section>

        {(periodicEntries.length > 0 || isOwner) && (
          <section className="archive-paper px-4 py-20 sm:px-8">
            <div className="mx-auto max-w-5xl text-[#edf7ff]">
              <Timeline slug={starMap.slug} createdAt={starMap.createdAt} entries={periodicEntries} palette={palette} isOwner={isOwner} isPreviewMode={isPreview} />
            </div>
          </section>
        )}

        <section className="px-4 py-20 text-center sm:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="archive-kicker text-[#5eead4]">Hatırname · {starMap.slug}</p>
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
