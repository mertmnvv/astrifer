"use client";

import { useState } from "react";
import Link from "next/link";
import { AuroraHeader } from "@/components/home/AuroraHeader";
import { AuroraFooter } from "@/components/home/AuroraFooter";
import { AuroraField } from "@/components/home/AuroraField";
import { StarChart } from "@/components/astrolab/StarChart";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { computeSky } from "@/lib/astronomy/computeSky";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { formatTRY } from "@/lib/pricing";
import type { PricingConfig } from "@/lib/pricingConfig";
import { DIGITAL_DEMO_SHOWCASES } from "@/lib/demoStarMaps";

/* ─────────────────────────── (legacy inline showcase data, replaced by lib/demoStarMaps.ts) ─────────────────────────── */

/* ─────────────────────────── General Features ─────────────────────────── */

const GENERAL_FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
      </svg>
    ),
    title: "Sinematik Kaydırma",
    description: "Scroll-driven animasyonlarla katman katman açılan sahne geçişleri. Başlık, yıldız haritası, mesaj ve fotoğraflar sırasıyla ortaya çıkar.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
    title: "Yıldız Anahtarı",
    description: "Gökyüzü haritasındaki en parlak yıldızların bilimsel adları, büyüklük değerleri and numaralı referansları ile gerçek bir astronomi deneyimi.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
      </svg>
    ),
    title: "Sesli Kapsül",
    description: "Anınıza sesinizi ekleyin. Fotoğrafın ötesinde, o ana ait bir ses kaydını dijital sayfanıza gömün — açıldığında çalsın.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
    title: "Aylık Zaman Çizelgesi",
    description: "Her ay yeni bir fotoğraf ve not ekleyerek anınızı yaşayan bir hikayeye dönüştürebilirsiniz. Zamanla büyüyen dijital bir günlük.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
      </svg>
    ),
    title: "Arka Plan Müziği",
    description: "Sayfanız açılırken çalan hafif melodi. Görsel deneyimi işitsel bir boyuta taşıyan sinematik müzik katmanı.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5Z" />
      </svg>
    ),
    title: "QR Kod Paylaşımı",
    description: "Her dijital sayfa için benzersiz bir QR kod. Telefon kamerasıyla taratarak sayfanıza anında ulaşın veya yakınlarınızla paylaşın.",
  },
];

/* ─────────────────────────── Component ─────────────────────────── */

export default function DigitalProductClient({ pricing }: { pricing: PricingConfig }) {
  const [activePaletteId, setActivePaletteId] = useState("kehribar");

  const activeShowcase =
    DIGITAL_DEMO_SHOWCASES.find((s) => s.paletteId === activePaletteId) ??
    DIGITAL_DEMO_SHOWCASES[0];

  const activePalette = getSkyPalette(activeShowcase.paletteId);
  const activeStarMap = activeShowcase.starMap;
  const foundingEntry = activeStarMap.entries.find((e) => e.isInitial) ?? activeStarMap.entries[0];
  const latestTimelineEntry = activeStarMap.entries.find((e) => !e.isInitial) ?? null;
  const demoDateLabel = new Intl.DateTimeFormat("tr-TR", {
    timeZone: activeStarMap.timezone,
    dateStyle: "long",
    timeStyle: "short",
  }).format(activeStarMap.eventDateUtc);

  const sky = computeSky({
    date: activeStarMap.eventDateUtc,
    latitude: activeStarMap.latitude,
    longitude: activeStarMap.longitude,
  });

  const createHref = `/create?palette=${activeShowcase.paletteId}`;
  const demoHref = `/urun/dijital/ornek/${activeShowcase.paletteId}`;

  return (
    <>
      <AuroraHeader />
      <main className="min-h-screen px-4 pb-20 pt-28 sm:px-8 sm:pb-28 sm:pt-36 bg-nebula text-text overflow-hidden relative">
        <AuroraField />
        <div className="mx-auto max-w-6xl">

          {/* ─── Hero Section ─── */}
          <RevealOnScroll className="mb-14 flex flex-col items-center text-center sm:mb-20">
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-iris-light">
              Dijital Ürünümüz
            </p>
            <h1 className="mt-3.5 font-display text-3xl italic leading-tight text-bright sm:text-5xl">
              O Ana Ait Gökyüzü, Senin Renklerin
            </h1>
            <p className="mt-4 max-w-lg text-xs leading-relaxed text-subtle sm:text-sm">
              Hayatınızın herhangi bir anının gerçek yıldız haritasını, 8 farklı
              tasarım temasıyla kişiselleştirin. <strong>Her ay yeni fotoğraflar ekleyerek</strong> yaşayan bir dijital anı günlüğüne dönüştürün.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="rounded-full border border-iris/30 bg-iris/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-iris-light flex items-center gap-1.5 flex-wrap">
                Tek seferlik · {pricing.digitalOriginalPrice > pricing.digitalPrice ? (
                  <>
                    <span className="line-through text-dim">{formatTRY(pricing.digitalOriginalPrice)}</span>
                    <span className="text-iris-light font-semibold">{formatTRY(pricing.digitalPrice)}</span>
                    <span className="ml-2 inline-block rounded bg-green-500/10 px-2 py-0.5 text-[8px] font-bold text-green-400">
                      %{Math.round(((pricing.digitalOriginalPrice - pricing.digitalPrice) / pricing.digitalOriginalPrice) * 100)} İNDİRİM
                    </span>
                  </>
                ) : (
                  <span>{formatTRY(pricing.digitalPrice)}</span>
                )}
              </span>
            </div>
            <Link
              href={createHref}
              className="mt-6 group relative inline-flex items-center gap-2.5 rounded-full bg-gradient-to-br from-iris to-flare px-8 py-3.5 font-mono text-xs uppercase tracking-widest text-white shadow-[0_10px_40px_-12px_rgba(167,139,250,0.5)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_14px_50px_-10px_rgba(167,139,250,0.65)]"
            >
              Bu Tasarımla Başla
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5">
                <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
              </svg>
            </Link>
          </RevealOnScroll>

          {/* ─── Palette Selector (Tab Bar) ─── */}
          <RevealOnScroll className="mb-10 sm:mb-14">
            <p className="mb-4 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-dim">
              Bir Tasarım Teması Seçin
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {DIGITAL_DEMO_SHOWCASES.map((s) => {
                const pal = getSkyPalette(s.paletteId);
                const isActive = activePaletteId === s.paletteId;
                return (
                  <button
                    key={s.paletteId}
                    type="button"
                    onClick={() => setActivePaletteId(s.paletteId)}
                    className={`group relative flex items-center gap-2.5 rounded-full px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest transition-all duration-300 ${
                      isActive
                        ? "bg-iris/15 border border-iris/50 text-iris-light font-semibold shadow-[0_0_20px_-4px_rgba(167,139,250,0.25)]"
                        : "bg-text/[0.03] border border-text/10 text-muted hover:border-iris/30 hover:text-bright"
                    }`}
                  >
                    {/* Color swatch dot */}
                    <span
                      className="h-3 w-3 rounded-full ring-1 ring-white/10 shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: `radial-gradient(circle at 35% 35%, ${pal.skyCenter}, ${pal.skyEdge})`,
                      }}
                    />
                    {s.moodTitle}
                  </button>
                );
              })}
            </div>
          </RevealOnScroll>

          {/* ─── Two-Column Main Content ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

            {/* Left Column: Design Info Card */}
            <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-36">

              {/* Mood Header */}
              <div
                className="rounded-2xl border border-text/10 p-6 sm:p-8 space-y-5 transition-all duration-500"
                style={{
                  background: `linear-gradient(135deg, ${activePalette.skyCenter}20 0%, transparent 60%)`,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl italic text-bright sm:text-3xl">
                      {activeShowcase.moodTitle}
                    </h2>
                    <p
                      className="mt-1 font-mono text-[10px] uppercase tracking-widest"
                      style={{ color: activePalette.label }}
                    >
                      {activeShowcase.moodSubtitle}
                    </p>
                  </div>
                  {/* Mini palette preview circle */}
                  <div
                    className="h-12 w-12 rounded-full ring-2 ring-white/5 shrink-0 shadow-lg"
                    style={{
                      background: `radial-gradient(circle at 40% 35%, ${activePalette.skyCenter}, ${activePalette.skyEdge})`,
                      boxShadow: `0 8px 30px -8px ${activePalette.skyCenter}80`,
                    }}
                  />
                </div>

                {/* Mood Description */}
                <p className="text-xs leading-relaxed text-subtle sm:text-[13px]">
                  {activeShowcase.moodDescription}
                </p>

                {/* Design Features */}
                <div className="space-y-3 pt-1">
                  <h4 className="font-mono text-[9px] uppercase tracking-widest text-dim">
                    Tasarım Detayları
                  </h4>
                  <ul className="space-y-2.5">
                    {activeShowcase.designFeatures.map((feat, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2.5 text-xs text-muted"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          style={{ color: activePalette.label }}
                        >
                          <path
                            d="M20 6L9 17l-5-5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggested Occasions Tags */}
                <div className="space-y-2.5 pt-1 border-t border-text/5">
                  <h4 className="pt-3 font-mono text-[9px] uppercase tracking-widest text-dim">
                    Önerilen Kullanım Alanları
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeShowcase.suggestedOccasions.map((occ) => (
                      <span
                        key={occ}
                        className="rounded-full border border-text/10 bg-text/[0.03] px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-muted"
                      >
                        {occ}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: iPhone Mockup Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative">
                {/* Glowing background behind card */}
                <div
                  className="absolute -inset-4 rounded-[40px] blur-xl -z-10 transition-all duration-700"
                  style={{
                    background: `radial-gradient(circle, ${activePalette.skyCenter}40 0%, transparent 70%)`,
                  }}
                />

                {/* Page Preview Card (no device chrome) */}
                <div className="relative w-[300px] h-[600px] rounded-[32px] border border-iris/25 bg-nebula shadow-[0_30px_70px_-10px_rgba(0,0,0,0.9)] ring-1 ring-white/10 flex flex-col overflow-hidden">

                  {/* Plaque header instead of a notch */}
                  <div className="absolute top-0 left-0 right-0 h-10 z-30 flex items-center justify-center gap-2 pointer-events-none">
                    <span className="h-px w-8" style={{ backgroundColor: `${activePalette.label}40` }} />
                    <span
                      className="font-mono text-[7px] uppercase tracking-[0.3em]"
                      style={{ color: `${activePalette.label}b0` }}
                    >
                      Dijital Sayfa
                    </span>
                    <span className="h-px w-8" style={{ backgroundColor: `${activePalette.label}40` }} />
                  </div>

                  {/* Auto-scrolling content — no click/scroll needed to see it */}
                  <div className="flex-1 overflow-hidden pt-14 pb-6 px-3.5 relative text-left">
                  <div
                    className="space-y-8 select-none animate-auto-scroll"
                    style={{ "--auto-scroll-distance": "-45%" } as React.CSSProperties}
                  >
                    {/* Background Star Chart */}
                    <div
                      aria-hidden
                      className="absolute inset-0 -z-10 opacity-60 blur-[1.5px] pointer-events-none"
                    >
                      <StarChart
                        sky={sky}
                        label=""
                        className="h-full w-full object-cover"
                        palette={activePalette}
                        showLabels={false}
                      />
                    </div>
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_35%,rgba(7,5,15,0.15)_0%,rgba(7,5,15,0.65)_70%,#07050f_100%)]"
                    />

                    {/* Title Reveal */}
                    <div className="text-center pt-3 flex flex-col items-center">
                      <span
                        className="h-0.5 w-6 rounded"
                        style={{ backgroundColor: `${activePalette.label}50` }}
                      />
                      <h3 className="mt-3.5 font-display text-lg italic text-bright leading-tight max-w-[200px] mx-auto">
                        {activeStarMap.title}
                      </h3>
                      <p
                        className="mt-2 font-mono text-[8px] uppercase tracking-widest"
                        style={{ color: activePalette.label }}
                      >
                        {demoDateLabel}
                      </p>
                      <p className="mt-0.5 font-mono text-[7px] text-dim">
                        {activeStarMap.locationName.toUpperCase()}
                      </p>
                    </div>

                    {/* Sky Panel & Message — küçültülmüş versiyonu StarMapView'deki
                        geniş gökyüzü sahnesinin (SkyFocusSection) */}
                    <div className="flex flex-col items-center">
                      <p
                        className="font-mono text-[7px] font-medium uppercase tracking-[0.3em]"
                        style={{ color: activePalette.label }}
                      >
                        O Anın Gökyüzü
                      </p>
                      <div
                        className="relative mt-2.5 w-full max-w-[236px] rounded-2xl p-1 bg-panel/40 backdrop-blur-sm"
                        style={{ border: `1px solid ${activePalette.label}33` }}
                      >
                        <div
                          className="aspect-[16/10] w-full overflow-hidden rounded-xl relative"
                          style={{ border: `1px solid ${activePalette.label}25`, boxShadow: `0 0 25px ${activePalette.label}20` }}
                        >
                          <StarChart
                            sky={sky}
                            label=""
                            className="h-full w-full"
                            palette={activePalette}
                            showLabels={false}
                          />
                        </div>
                      </div>
                      <div className="mt-4 text-center px-4 max-w-[210px]">
                        <p className="font-display text-[10px] italic leading-relaxed text-subtle">
                          &ldquo;{activeStarMap.message}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Star Key Legend */}
                    <div
                      className="mx-1 p-3 rounded-xl bg-panel/50 backdrop-blur-sm text-center"
                      style={{ border: `1px solid ${activePalette.label}25` }}
                    >
                      <h5
                        className="font-mono text-[7px] uppercase tracking-widest"
                        style={{ color: activePalette.label }}
                      >
                        Yıldız Anahtarı
                      </h5>
                      <div className="mt-2 space-y-1.5 text-left max-w-[170px] mx-auto text-[7px] font-mono text-muted">
                        <div className="flex justify-between border-b border-text/5 pb-0.5">
                          <span>01. Sirius (Akyıldız)</span>
                          <span style={{ color: activePalette.label }}>
                            ★ -1.46 mag
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-text/5 pb-0.5">
                          <span>02. Vega</span>
                          <span style={{ color: activePalette.label }}>
                            ★ 0.03 mag
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>03. Altair</span>
                          <span style={{ color: activePalette.label }}>
                            ★ 0.76 mag
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* First Moment Photo */}
                    <div className="flex flex-col items-center">
                      <div className="w-36 overflow-hidden bg-[#fdfaf1] p-1.5 pb-3 shadow-lg shadow-black/40 rotate-[1.5deg]">
                        <div className="w-full aspect-square bg-[#eceae1] overflow-hidden rounded-sm relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={foundingEntry?.photos[0]?.url}
                            alt="Örnek anı"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="mt-1 text-center font-display text-[8px] italic text-ink">
                          O Özel An
                        </p>
                      </div>
                    </div>

                    {/* Timeline Entry */}
                    <div className="space-y-4 px-1 pt-2">
                      <p className="text-center font-mono text-[7px] uppercase tracking-[0.2em] text-dim">
                        Zaman Çizelgesi
                      </p>
                      <div className="flex flex-col items-center">
                        <p
                          className="font-mono text-[7px] uppercase tracking-wider"
                          style={{ color: activePalette.label }}
                        >
                          Eklenen Anı
                        </p>
                        <p className="font-display text-[9px] italic text-subtle text-center mt-1 px-1 max-w-[200px]">
                          &ldquo;{latestTimelineEntry?.note}&rdquo;
                        </p>
                        <div className="w-28 mt-2.5 overflow-hidden bg-[#fdfaf1] p-1 pb-2 shadow-lg shadow-black/40 -rotate-[2deg]">
                          <div className="w-full aspect-square bg-[#eceae1] overflow-hidden rounded-sm relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={latestTimelineEntry?.photos[0]?.url}
                              alt="Eklenen anı"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Voice Record */}
                    <div
                      className="mx-1 p-2.5 rounded-xl bg-panel/50 backdrop-blur-sm flex items-center justify-between"
                      style={{ border: `1px solid ${activePalette.label}25` }}
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-5.5 w-5.5 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: `${activePalette.label}15`,
                            color: activePalette.label,
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="h-3 w-3"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                            />
                          </svg>
                        </div>
                        <div className="text-[7.5px] font-mono text-muted">
                          Arka_Plan_Muzigi
                        </div>
                      </div>
                      <div
                        className="text-[7.5px] font-mono"
                        style={{ color: activePalette.label }}
                      >
                        ♫
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>

              {/* Gerçek deneyime bağlantı — bu bir mockup değil, aynı StarMapView'in
                  tam, canlı halini yeni sekmede açar (bkz. app/urun/dijital/ornek/[palette]) */}
              <Link
                href={demoHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 group inline-flex items-center gap-2 rounded-full border border-iris/25 bg-iris/5 px-5 py-2.5 font-mono text-[10px] uppercase tracking-widest text-iris-light transition-all hover:border-iris/50 hover:bg-iris/10"
              >
                Gerçek Deneyimi Aç
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 13 13 7M13 7H8m5 0v5" />
                </svg>
              </Link>
            </div>
          </div>

          {/* ─── Price and CTA (below preview) ─── */}
          <div className="relative mt-14 sm:mt-16">
            {/* Decorative glow */}
            <div
              className="absolute inset-0 -z-10 rounded-3xl blur-2xl opacity-20 transition-all duration-700"
              style={{
                background: `radial-gradient(ellipse at 50% 50%, ${activePalette.skyCenter} 0%, transparent 70%)`,
              }}
            />

            <div className="flex flex-col items-center text-center py-10 sm:py-14 px-6 rounded-3xl border border-text/[0.06] bg-gradient-to-b from-text/[0.02] to-transparent">
              {/* Decorative star divider */}
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-10 bg-gradient-to-r from-transparent to-iris/30" />
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-iris/40">
                  <path d="M12 2l1.09 6.91L20 10l-6.91 1.09L12 18l-1.09-6.91L4 10l6.91-1.09L12 2z" />
                </svg>
                <span className="h-px w-10 bg-gradient-to-l from-transparent to-iris/30" />
              </div>

              <p className="font-display text-sm italic text-subtle sm:text-base">
                Seçtiğiniz tasarımla başlayın
              </p>

              <div className="mt-4 flex flex-col items-center gap-1">
                {pricing.digitalOriginalPrice > pricing.digitalPrice && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs line-through text-dim">
                      {formatTRY(pricing.digitalOriginalPrice)}
                    </span>
                    <span className="rounded bg-green-500/10 px-1.5 py-0.5 font-mono text-[8px] font-bold text-green-400">
                      %{Math.round(((pricing.digitalOriginalPrice - pricing.digitalPrice) / pricing.digitalOriginalPrice) * 100)} İNDİRİM
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl font-semibold text-iris-light sm:text-4xl">
                    {formatTRY(pricing.digitalPrice)}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-dim">
                    / tek seferlik
                  </span>
                </div>
              </div>

              <p className="mt-2 text-[11px] text-dim max-w-xs">
                Ömür boyu erişim · Sınırsız düzenleme · Her Ay Fotoğraf Ekleme
              </p>

              <Link
                href={createHref}
                className="mt-7 group relative inline-flex items-center gap-2.5 rounded-full bg-gradient-to-br from-iris to-flare px-10 py-4 font-mono text-xs uppercase tracking-widest text-white shadow-[0_10px_40px_-12px_rgba(167,139,250,0.5)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_14px_50px_-10px_rgba(167,139,250,0.65)]"
              >
                Bu Tasarımla Başla
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                </svg>
              </Link>

              {/* Decorative bottom star divider */}
              <div className="flex items-center gap-3 mt-8">
                <span className="h-px w-6 bg-gradient-to-r from-transparent to-text/10" />
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-2 w-2 text-text/10">
                  <path d="M12 2l1.09 6.91L20 10l-6.91 1.09L12 18l-1.09-6.91L4 10l6.91-1.09L12 2z" />
                </svg>
                <span className="h-px w-6 bg-gradient-to-l from-transparent to-text/10" />
              </div>
            </div>
          </div>

          {/* ─── General Features Section ─── */}
          <RevealOnScroll className="mt-24 sm:mt-32">
            <div className="text-center mb-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-iris-light">
                Her Tasarımda
              </p>
              <h2 className="mt-3 font-display text-2xl italic text-bright sm:text-3xl">
                Tüm Dijital Sayfalarda Ortak Özellikler
              </h2>
              <p className="mt-3 max-w-md mx-auto text-xs leading-relaxed text-subtle">
                Hangi renk temasını seçerseniz seçin, tüm dijital sayfalar aşağıdaki
                premium özelliklere sahip olur.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {GENERAL_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-text/10 bg-text/[0.02] p-6 space-y-3 transition-all duration-300 hover:border-iris/20 hover:bg-iris/[0.02]"
                >
                  <div className="h-10 w-10 rounded-xl bg-iris/10 text-iris-light flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>
                  <h3 className="font-display text-base italic text-bright">
                    {feature.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-subtle">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </RevealOnScroll>

          {/* ─── Bottom CTA ─── */}
          <RevealOnScroll className="mt-20 sm:mt-28 text-center">
            <h2 className="font-display text-2xl italic text-bright sm:text-3xl">
              Anınızı Ölümsüzleştirin
            </h2>
            <p className="mt-3 max-w-sm mx-auto text-xs leading-relaxed text-subtle">
              Sevdiklerinize, kendinize veya özel bir ana armağan edin.
              Dakikalar içinde hazır.
            </p>
            <Link
              href="/create"
              className="mt-8 inline-block rounded-full bg-gradient-to-br from-iris to-flare px-10 py-4 font-mono text-xs uppercase tracking-widest text-white shadow-[0_10px_40px_-12px_rgba(167,139,250,0.6)] transition-all hover:scale-[1.02] hover:opacity-95"
            >
              Hemen Başla
            </Link>
          </RevealOnScroll>
        </div>
      </main>
      <AuroraFooter />
    </>
  );
}
