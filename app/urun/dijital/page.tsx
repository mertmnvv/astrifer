"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StarChart } from "@/components/astrolab/StarChart";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { computeSky } from "@/lib/astronomy/computeSky";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { DIGITAL_PRICE, formatTRY } from "@/lib/pricing";

interface TemplatePreviewData {
  slug: string;
  name: string;
  title: string;
  message: string;
  locationName: string;
  lat: number;
  lon: number;
  timezone: string;
  dateStr: string;
  dateLabel: string;
  paletteId: string;
  description: string;
  features: string[];
  mockPhoto: string;
  timelinePhoto: string;
  timelineText: string;
}

const PRESET_TEMPLATES: TemplatePreviewData[] = [
  {
    slug: "yildonumu",
    name: "Yıldönümü",
    title: "Bizim Gecemiz",
    message: "Yıllar geçse de gökyüzü hep o geceyi hatırlıyor. Seni çok seviyorum.",
    locationName: "İstanbul, Türkiye",
    lat: 41.0082,
    lon: 28.9784,
    timezone: "Europe/Istanbul",
    dateStr: "2024-02-14T21:00:00.000Z",
    dateLabel: "14 Şubat 2024 · 21:00",
    paletteId: "gul-safagi",
    description: "Birlikte geçirdiğiniz o benzersiz yola ilk adım attığınız anın gerçek gökyüzünü ve o günden bugüne biriken tüm güzel fotoğrafları zaman çizelgesinde sergileyin.",
    features: [
      "Yıldönümünüze özel 'Mor ve Gül Altını' esintili Gül Şafağı teması",
      "İlk tanışma veya yola çıkış anının hassas gökyüzü haritası",
      "Zaman çizelgesine her 6 ayda bir yeni yıldönümü veya gezi fotoğrafı ekleme imkanı",
      "Arka planda çalan romantik müzik eşliğinde sinematik kaydırma deneyimi"
    ],
    mockPhoto: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&auto=format&fit=crop&q=80",
    timelinePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80",
    timelineText: "Bir yıl sonra, aynı yerde yine el ele..."
  },
  {
    slug: "dogum",
    name: "Doğum",
    title: "İyi ki Doğdun Canım",
    message: "Dünyaya geldiğin an, gökyüzündeki tüm yıldızlar senin için parlıyordu.",
    locationName: "Ankara, Türkiye",
    lat: 39.9334,
    lon: 32.8597,
    timezone: "Europe/Istanbul",
    dateStr: "2020-03-12T09:15:00.000Z",
    dateLabel: "12 Mart 2020 · 09:15",
    paletteId: "kehribar",
    description: "Bebeğinizin veya sevdiğiniz birinin ilk nefes aldığı anın gökyüzü madalyonunu tasarlayın. Büyüme çizelgesiyle her doğum gününde yeni bir anı katarak zamanı dondurun.",
    features: [
      "Sıcak altın tonlarında Kehribar tasarımı",
      "Gerçek efemeris hesaplamasıyla doğum anındaki gezegenlerin gökyüzündeki yerleşimi",
      "Yıllık büyüme ve ilk adımlar fotoğrafları için ideal zaman kapsülü",
      "Ömür boyu saklanabilir dijital miras ve QR kod paylaşımı"
    ],
    mockPhoto: "https://images.unsplash.com/photo-1519689680058-324335c77ebe?w=600&auto=format&fit=crop&q=80",
    timelinePhoto: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&auto=format&fit=crop&q=80",
    timelineText: "İlk adımların ve o kocaman gülüşün..."
  },
  {
    slug: "teklif",
    name: "Evlilik Teklifi",
    title: "Evet Dediğin Saniye",
    message: "Bana hayatının en güzel evet cevabını verdiğin o eşsiz an.",
    locationName: "İzmir, Türkiye",
    lat: 38.4192,
    lon: 27.1287,
    timezone: "Europe/Istanbul",
    dateStr: "2025-07-24T22:30:00.000Z",
    dateLabel: "24 Temmuz 2025 · 22:30",
    paletteId: "gece-laciverti",
    description: "Hayatlarınızı birleştirmeye karar verdiğiniz o büyülü saniyenin gökyüzü. Teklif anından düğün gününe, ilk tatilden yeni eve uzanan tüm dönüm noktalarını tek bir sayfada birleştirin.",
    features: [
      "Klasik derin mavi tonlarında Gece Laciverti tasarımı",
      "Raptiyeli mücevher-kesim detayları ile parlayan yıldız ve gezegen konumları",
      "Müstakbel eşinize özel hazırlayabileceğiniz sürpriz sesli not entegrasyonu",
      "Düğün hazırlıklarından ilk fotoğraflara uzanan dinamik anı çizgisi"
    ],
    mockPhoto: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop&q=80",
    timelinePhoto: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80",
    timelineText: "Ve işte o büyük gün, heyecanımız göklerde!"
  },
  {
    slug: "mezuniyet",
    name: "Mezuniyet",
    title: "Büyük Başarı",
    message: "Emeğinin, uykusuz gecelerinin ve bu büyük gururun gökyüzü şahidi.",
    locationName: "Eskişehir, Türkiye",
    lat: 39.7767,
    lon: 30.5206,
    timezone: "Europe/Istanbul",
    dateStr: "2026-06-20T17:00:00.000Z",
    dateLabel: "20 Haziran 2026 · 17:00",
    paletteId: "komur",
    description: "Akademik veya profesyonel başarınızın zirveye ulaştığı o gurur dolu kep atma anı. Keplerin havada süzüldüğü andaki yıldız haritası ve mezuniyet fotoğraflarınızla başarınızı kutlayın.",
    features: [
      "Güçlü ve kararlı Kömür ve kırık-beyaz yıldız haritası tasarımı",
      "Gökbilimsel doğrulukta mezuniyet gününün yıldız dizilimleri",
      "Okul arkadaşlarından gelen tebrik notları veya anılar için zaman tüneli",
      "Cv ve portföy sitelerine eklenebilecek gurur verici bir başarı hikayesi bağlantısı"
    ],
    mockPhoto: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
    timelinePhoto: "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=600&auto=format&fit=crop&q=80",
    timelineText: "Zorlu yolları bitirdik, şimdi yeni ufuklara!"
  },
  {
    slug: "anma",
    name: "Anma",
    title: "Sonsuz Işığın",
    message: "Seni her andığımızda, gökyüzündeki bu yıldızlar kadar parlaksın.",
    locationName: "Trabzon, Türkiye",
    lat: 41.0027,
    lon: 39.7168,
    timezone: "Europe/Istanbul",
    dateStr: "2021-10-10T11:00:00.000Z",
    dateLabel: "10 Ekim 2021 · 11:00",
    paletteId: "gece-laciverti",
    description: "Saygıyla ve sevgiyle andığınız o değerli anın veya kişinin anısına özel bir yıldız haritası. Paylaştığınız en güzel anıları, fotoğrafları ve sesleri bir arada tutan kalıcı bir dijital anıt.",
    features: [
      "Sakinleştirici ve vakur Gece Laciverti tasarımı",
      "Geçmişten gelen sesinizi veya anılarınızı saklayabileceğiniz kalıcı ses arşivi",
      "Her yıl dönümünde eklenen anma fotoğraflarıyla büyüyen aile mirası çizelgesi",
      "Sadece yakınlarınızla paylaşabileceğiniz, ömür boyu reklam barındırmayan özel bağlantı"
    ],
    mockPhoto: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80",
    timelinePhoto: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
    timelineText: "Huzurlu dalgalar, unutulmaz anılar..."
  }
];

export default function DigitalProductPage() {
  const [activeTab, setActiveTab] = useState("yildonumu");

  const activeTemplate = PRESET_TEMPLATES.find((t) => t.slug === activeTab) ?? PRESET_TEMPLATES[0];

  const sky = computeSky({
    date: new Date(activeTemplate.dateStr),
    latitude: activeTemplate.lat,
    longitude: activeTemplate.lon,
  });

  const buildCreateHref = (tmpl: TemplatePreviewData) => {
    const params = new URLSearchParams({
      template: tmpl.slug,
      title: tmpl.title,
      message: tmpl.message,
      palette: tmpl.paletteId,
      location: tmpl.locationName,
      lat: tmpl.lat.toString(),
      lon: tmpl.lon.toString(),
      timezone: tmpl.timezone,
      date: tmpl.dateStr,
    });
    return `/create?${params.toString()}`;
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen px-4 pb-20 pt-28 sm:px-8 sm:pb-28 sm:pt-36 bg-void text-text overflow-hidden relative">
        <div className="mx-auto max-w-6xl">
          {/* Header/Concept */}
          <RevealOnScroll className="mb-14 flex flex-col items-center text-center sm:mb-20">
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-amber">Dijital Ürünümüz</p>
            <h1 className="mt-3.5 font-display text-3xl italic leading-tight text-bright sm:text-5xl">
              Dijital Sayfa ve Zaman Kapsülü
            </h1>
            <p className="mt-4 max-w-md text-xs leading-relaxed text-subtle">
              Özel anınızın gerçek gökyüzünü ömür boyu saklayın, zamanla fotoğraf ekleyerek yaşayan bir dijital günlüğe dönüştürün.
            </p>
          </RevealOnScroll>

          {/* 2 Column Split-Screen Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            
            {/* Left Column: Template tabs & info */}
            <div className="lg:col-span-7 space-y-8 lg:sticky lg:top-36">
              
              {/* Tab Selector */}
              <div>
                <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-dim">
                  Bir Şablon Seçin
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.slug}
                      type="button"
                      onClick={() => setActiveTab(tmpl.slug)}
                      className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-all ${
                        activeTab === tmpl.slug
                          ? "bg-amber text-ink font-semibold"
                          : "bg-text/[0.04] border border-text/10 text-muted hover:border-amber/40 hover:text-bright"
                      }`}
                    >
                      {tmpl.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion Description */}
              <div className="rounded-2xl border border-text/10 bg-text/[0.02] p-6 space-y-4">
                <h3 className="font-display text-2xl italic text-bright border-b border-text/10 pb-3">
                  {activeTemplate.name} Teması
                </h3>
                <p className="text-xs text-subtle leading-relaxed">
                  {activeTemplate.description}
                </p>

                {/* Features List */}
                <div className="space-y-3 pt-2">
                  <h4 className="font-mono text-[9px] uppercase tracking-widest text-dim">
                    Öne Çıkan Özellikler
                  </h4>
                  <ul className="space-y-2.5">
                    {activeTemplate.features.map((feat, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-xs text-muted">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber"
                        >
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Price and CTA */}
              <div className="flex flex-wrap items-center justify-between gap-6 border-t border-text/10 pt-6">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-dim">Tek Seferlik Ödeme</p>
                  <p className="mt-1 font-mono text-2xl font-semibold text-amber">{formatTRY(DIGITAL_PRICE)}</p>
                </div>
                <Link
                  href={buildCreateHref(activeTemplate)}
                  className="rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-8 py-4 font-mono text-xs uppercase tracking-widest text-ink shadow-[0_10px_40px_-12px_rgba(230,163,92,0.6)] transition-all hover:scale-[1.02] hover:opacity-95"
                >
                  Bu Şablonla Başla
                </Link>
              </div>

            </div>

            {/* Right Column: Live Mock Phone Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative">
                {/* Decorative glowing background behind the phone */}
                <div className="absolute -inset-4 rounded-[48px] bg-gradient-to-r from-amber/10 to-transparent blur-xl -z-10" />

                {/* iPhone Frame Wrapper */}
                <div className="relative w-[300px] h-[600px] rounded-[44px] border-[10px] border-[#1d1d1f] bg-[#0b0810] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.9)] ring-1 ring-white/10 flex flex-col overflow-hidden">
                  
                  {/* Dynamic Island / Notch */}
                  <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-[#1d1d1f] rounded-full z-30 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-void/70 absolute left-3.5" />
                    <div className="w-10 h-0.5 bg-[#2d2d2f] rounded-full" />
                  </div>

                  {/* Scrollable Screen Content */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none pt-12 pb-6 px-3.5 space-y-8 select-none relative text-left scroll-smooth">
                    {/* Simulated Blur Background */}
                    <div aria-hidden className="absolute inset-0 -z-10 opacity-60 blur-[1.5px] pointer-events-none">
                      <StarChart sky={sky} label="" className="h-full w-full object-cover" palette={getSkyPalette(activeTemplate.paletteId)} showLabels={false} />
                    </div>
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_35%,rgba(11,8,16,0.15)_0%,rgba(11,8,16,0.65)_70%,#0b0810_100%)]"
                    />

                    {/* Stage 1: Title Reveal */}
                    <div className="text-center pt-3 flex flex-col items-center">
                      <span className="h-0.5 w-6 bg-amber/30 rounded" />
                      <h3 className="mt-3.5 font-display text-lg italic text-bright leading-tight max-w-[200px] mx-auto">
                        {activeTemplate.title}
                      </h3>
                      <p className="mt-2 font-mono text-[8px] uppercase tracking-widest text-amber">
                        {activeTemplate.dateLabel}
                      </p>
                      <p className="mt-0.5 font-mono text-[7px] text-dim">
                        {activeTemplate.locationName.toUpperCase()}
                      </p>
                    </div>

                    {/* Stage 2: Star Medallion & Message */}
                    <div className="flex flex-col items-center">
                      <div className="relative aspect-square w-48 rounded-full border border-amber/20 p-1.5 shadow-[0_0_25px_rgba(230,163,92,0.15)] bg-void/50 backdrop-blur-sm">
                        <div className="h-full w-full rounded-full overflow-hidden relative">
                          <StarChart sky={sky} label="" className="h-full w-full" palette={getSkyPalette(activeTemplate.paletteId)} showLabels={false} />
                        </div>
                      </div>
                      <div className="mt-4 text-center px-4 max-w-[210px]">
                        <p className="font-display text-[10px] italic leading-relaxed text-subtle">
                          &ldquo;{activeTemplate.message}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Stage 3: Star Key Legend */}
                    <div className="mx-1 p-3 rounded-xl border border-amber/15 bg-void/75 backdrop-blur-sm text-center">
                      <h5 className="font-mono text-[7px] uppercase tracking-widest text-amber">Yıldız Anahtarı</h5>
                      <div className="mt-2 space-y-1.5 text-left max-w-[170px] mx-auto text-[7px] font-mono text-muted">
                        <div className="flex justify-between border-b border-text/5 pb-0.5">
                          <span>01. Sirius (Akyıldız)</span>
                          <span className="text-amber">★ -1.46 mag</span>
                        </div>
                        <div className="flex justify-between border-b border-text/5 pb-0.5">
                          <span>02. Vega</span>
                          <span className="text-amber">★ 0.03 mag</span>
                        </div>
                        <div className="flex justify-between">
                          <span>03. Altair</span>
                          <span className="text-amber">★ 0.76 mag</span>
                        </div>
                      </div>
                    </div>

                    {/* Stage 4: First Moment Photo Slot */}
                    <div className="flex flex-col items-center">
                      <div className="w-36 overflow-hidden bg-[#fdfaf1] p-1.5 pb-3 shadow-lg shadow-black/40 rotate-[1.5deg]">
                        <div className="w-full aspect-square bg-[#eceae1] overflow-hidden rounded-sm relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={activeTemplate.mockPhoto} alt="İlk anı" className="w-full h-full object-cover" />
                        </div>
                        <p className="mt-1 text-center font-display text-[8px] italic text-ink">O Özel An</p>
                      </div>
                    </div>

                    {/* Stage 5: Timeline Entry */}
                    <div className="space-y-4 px-1 pt-2">
                      <p className="text-center font-mono text-[7px] uppercase tracking-[0.2em] text-dim">Zaman Çizelgesi</p>
                      <div className="flex flex-col items-center">
                        <p className="font-mono text-[7px] text-amber uppercase tracking-wider">Eklenen Anı</p>
                        <p className="font-display text-[9px] italic text-subtle text-center mt-1 px-1 max-w-[200px]">
                          &ldquo;{activeTemplate.timelineText}&rdquo;
                        </p>
                        <div className="w-28 mt-2.5 overflow-hidden bg-[#fdfaf1] p-1 pb-2 shadow-lg shadow-black/40 -rotate-[2deg]">
                          <div className="w-full aspect-square bg-[#eceae1] overflow-hidden rounded-sm relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={activeTemplate.timelinePhoto} alt="Eklenen anı" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stage 6: Voice Record */}
                    <div className="mx-1 p-2.5 rounded-xl border border-amber/15 bg-void/75 backdrop-blur-sm flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="h-5.5 w-5.5 rounded-full bg-amber/10 flex items-center justify-center text-amber">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                          </svg>
                        </div>
                        <div className="text-[7.5px] font-mono text-muted">Sesli_Kapsul.mp3</div>
                      </div>
                      <div className="text-[7.5px] font-mono text-amber">0:45</div>
                    </div>
                  </div>

                  {/* Home Indicator line */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-[#1d1d1f] rounded-full z-30" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
