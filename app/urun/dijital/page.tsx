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

/* ─────────────────────────── Palette Showcase Data ─────────────────────────── */

interface PaletteShowcase {
  paletteId: string;
  moodTitle: string;
  moodSubtitle: string;
  moodDescription: string;
  designFeatures: string[];
  suggestedOccasions: string[];
  demoTitle: string;
  demoMessage: string;
  demoLocation: string;
  demoLat: number;
  demoLon: number;
  demoTimezone: string;
  demoDate: string;
  demoDateLabel: string;
  demoPhoto: string;
  timelinePhoto: string;
  timelineText: string;
}

const PALETTE_SHOWCASES: PaletteShowcase[] = [
  {
    paletteId: "kehribar",
    moodTitle: "Kehribar",
    moodSubtitle: "Sıcak Altın Işığı",
    moodDescription:
      "Sıcak kehribar tonlarında, gün batımının son ışığını yakalayan nostaljik bir atmosfer. Altın sarısı yıldızlar, amber parlamalı bir gökyüzünde zamanı donduruyor.",
    designFeatures: [
      "Amber ve is-siyahı tonlarında sıcak gradient arka plan",
      "Altın sarısı yıldız parlamaları ve meteor çizgileri",
      "Nostaljik, romantik bir akşam güneşi atmosferi",
      "Kehribar tonlu ay ve güneş tasviri",
    ],
    suggestedOccasions: ["Doğum Günü", "Kuruluş", "Yıldönümü", "Sünnet"],
    demoTitle: "Elif & Kaan",
    demoMessage:
      "Yıllar geçse de gökyüzü hep o geceyi hatırlıyor. Seni çok seviyorum.",
    demoLocation: "İstanbul, Türkiye",
    demoLat: 41.0082,
    demoLon: 28.9784,
    demoTimezone: "Europe/Istanbul",
    demoDate: "2024-02-14T21:00:00.000Z",
    demoDateLabel: "14 Şubat 2024 · 21:00",
    demoPhoto:
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&auto=format&fit=crop&q=80",
    timelinePhoto:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80",
    timelineText: "Bir yıl sonra, aynı yerde yine el ele...",
  },
  {
    paletteId: "gul-safagi",
    moodTitle: "Gül Şafağı",
    moodSubtitle: "Romantik Pembe Tonlar",
    moodDescription:
      "Gece morunun gülcü kızıla kavuştuğu büyülü bir geçiş anı. Gül tonlarında yıldızlar, floral ve zarif bir atmosferde parlıyor.",
    designFeatures: [
      "Morumsu-kızıl gradient ile romantik gece atmosferi",
      "Gül tonlu yıldız parlamaları ve sıcak meteor izleri",
      "Pembe-şeftali tonlarında ay ve güneş yansımaları",
      "Floral ve zarif bir estetik duygu",
    ],
    suggestedOccasions: ["Yıldönümü", "Evlilik Teklifi", "Sevgililer Günü"],
    demoTitle: "Sena & Berk",
    demoMessage:
      "Bana hayatının en güzel evet cevabını verdiğin o eşsiz an.",
    demoLocation: "Antalya, Türkiye",
    demoLat: 36.8969,
    demoLon: 30.7133,
    demoTimezone: "Europe/Istanbul",
    demoDate: "2025-06-21T22:15:00.000Z",
    demoDateLabel: "21 Haziran 2025 · 22:15",
    demoPhoto:
      "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&auto=format&fit=crop&q=80",
    timelinePhoto:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80",
    timelineText: "Ve işte o büyük gün, heyecanımız göklerde!",
  },
  {
    paletteId: "gece-laciverti",
    moodTitle: "Gece Laciverti",
    moodSubtitle: "Derin Okyanus Mavisi",
    moodDescription:
      "Gece gökyüzünün en derin ve sakin hali. Çelik-mavi yıldızlar, uçsuz bucaksız bir lacivert okyanusu üzerinde asaletle parlıyor.",
    designFeatures: [
      "Derin lacivert-siyah gradient ile klasik gece atmosferi",
      "Serin çelik-mavi yıldız parlamaları",
      "Altın sarısı güneş kontrast detayları",
      "Sakin, asil ve zamansız bir tasarım dili",
    ],
    suggestedOccasions: ["Evlilik Teklifi", "Anma", "Mezuniyet", "Doğum"],
    demoTitle: "Deniz Ailesi",
    demoMessage:
      "Dünyaya geldiğin an, gökyüzündeki tüm yıldızlar senin için parlıyordu.",
    demoLocation: "Ankara, Türkiye",
    demoLat: 39.9334,
    demoLon: 32.8597,
    demoTimezone: "Europe/Istanbul",
    demoDate: "2020-03-12T09:15:00.000Z",
    demoDateLabel: "12 Mart 2020 · 09:15",
    demoPhoto:
      "https://images.unsplash.com/photo-1519689680058-324335c77ebe?w=600&auto=format&fit=crop&q=80",
    timelinePhoto:
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&auto=format&fit=crop&q=80",
    timelineText: "İlk adımların ve o kocaman gülüşün...",
  },
  {
    paletteId: "komur",
    moodTitle: "Kömür",
    moodSubtitle: "Minimalist Monokrom",
    moodDescription:
      "Sıcak is-siyahının derinliğinde kırık-beyaz yıldızlar. Abartısız, güçlü ve kararlı bir tasarım dili — sadeliğin içindeki zarafet.",
    designFeatures: [
      "Sıcak is-siyahı arka plan ile minimalist atmosfer",
      "Kırık-beyaz yıldızlar ve yumuşak parlamalar",
      "Monokrom ama soğuk değil — sıcak kömür tonları",
      "Güçlü, kararlı ve modern bir tasarım kimliği",
    ],
    suggestedOccasions: ["Mezuniyet", "Kariyer", "Girişim Kuruluşu"],
    demoTitle: "Arda'nın Günü",
    demoMessage:
      "Emeğinin, uykusuz gecelerinin ve bu büyük gururun gökyüzü şahidi.",
    demoLocation: "Eskişehir, Türkiye",
    demoLat: 39.7767,
    demoLon: 30.5206,
    demoTimezone: "Europe/Istanbul",
    demoDate: "2026-06-20T17:00:00.000Z",
    demoDateLabel: "20 Haziran 2026 · 17:00",
    demoPhoto:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80",
    timelinePhoto:
      "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=600&auto=format&fit=crop&q=80",
    timelineText: "Zorlu yolları bitirdik, şimdi yeni ufuklara!",
  },
  {
    paletteId: "gravur-atlas",
    moodTitle: "Gravür Atlas",
    moodSubtitle: "Antik Harita Estetiği",
    moodDescription:
      "Eski dünya atlaslarının eskitme kağıt ve siyah mürekkep estetiğini yaşatan benzersiz bir tasarım. Koyu yıldızlar, açık zemin — klasik bir gravür tablosu.",
    designFeatures: [
      "Eskitme kağıt tonu üzerine siyah mürekkep yıldızları",
      "Ters kontrastlı benzersiz antik harita estetiği",
      "Sepya tonlarında ay ve güneş detayları",
      "Müze kalitesinde zarif bir koleksiyon parçası hissi",
    ],
    suggestedOccasions: ["Tarihsel An", "Aile Mirası", "Koleksiyon"],
    demoTitle: "Osmanlı Gecesi",
    demoMessage:
      "O büyük tarihi anın üzerindeki gökyüzünün haritası.",
    demoLocation: "Bursa, Türkiye",
    demoLat: 40.1827,
    demoLon: 29.0665,
    demoTimezone: "Europe/Istanbul",
    demoDate: "1453-05-29T03:00:00.000Z",
    demoDateLabel: "29 Mayıs 1453 · 03:00",
    demoPhoto:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80",
    timelinePhoto:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
    timelineText: "Tarih sayfalarından süzülen ışık...",
  },
  {
    paletteId: "kozmik-aurora",
    moodTitle: "Kozmik Aurora",
    moodSubtitle: "Yeşil-Mavi Kuzey Işıkları",
    moodDescription:
      "Kuzey kutbunun büyüleyici aurora ışıklarından ilham alınan taze ve canlı bir tasarım. Zümrüt yeşili ve turkuaz tonlarında yıldızlar, kozmik bir enerji yayıyor.",
    designFeatures: [
      "Yeşil-mavi aurora tarzı nebula bulutsuları",
      "Zümrüt pırıltılı yıldız parlamaları ve meteor izleri",
      "Turkuaz tonlarında soğuk ama canlı bir atmosfer",
      "Kozmik enerji ve taze bir hissiyat",
    ],
    suggestedOccasions: ["Yeni Başlangıç", "Göç", "Nişan", "Doğum"],
    demoTitle: "Yeni Ufuklar",
    demoMessage:
      "Yeni bir hayat, yeni bir gökyüzü. Her şeyin başladığı an.",
    demoLocation: "İzmir, Türkiye",
    demoLat: 38.4192,
    demoLon: 27.1287,
    demoTimezone: "Europe/Istanbul",
    demoDate: "2025-09-01T20:00:00.000Z",
    demoDateLabel: "1 Eylül 2025 · 20:00",
    demoPhoto:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&auto=format&fit=crop&q=80",
    timelinePhoto:
      "https://images.unsplash.com/photo-1488188840666-e2308741a62f?w=600&auto=format&fit=crop&q=80",
    timelineText: "İlk adımlar, sonsuz olasılıklar...",
  },
  {
    paletteId: "kizil-bulut",
    moodTitle: "Kızıl Bulut",
    moodSubtitle: "Ateş ve Tutku",
    moodDescription:
      "Karanlık uzayın derinliklerinde kıvılcımlanan kızıl bulutsular. Ateş tonlarında yıldızlar ve tutkulu bir kırmızı, güçlü duyguları yansıtıyor.",
    designFeatures: [
      "Kızıl nebula bulutsuları ile dramatik gece atmosferi",
      "Ateş tonlarında yıldız parlamaları ve kırmızı meteorlar",
      "Turuncu güneş ve kızıl ay detayları",
      "Tutkulu, güçlü ve çarpıcı bir estetik",
    ],
    suggestedOccasions: ["Aşk", "Tutku", "Düğün", "Özel Gece"],
    demoTitle: "Ateş Gecesi",
    demoMessage:
      "Kalbimin senin için çarptığı ilk gece, yıldızlar bile kızardı.",
    demoLocation: "Kapadokya, Türkiye",
    demoLat: 38.6431,
    demoLon: 34.8297,
    demoTimezone: "Europe/Istanbul",
    demoDate: "2024-08-15T23:30:00.000Z",
    demoDateLabel: "15 Ağustos 2024 · 23:30",
    demoPhoto:
      "https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=600&auto=format&fit=crop&q=80",
    timelinePhoto:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&auto=format&fit=crop&q=80",
    timelineText: "O gece her şey başladı...",
  },
  {
    paletteId: "derin-mor",
    moodTitle: "Derin Mor",
    moodSubtitle: "Kozmik Gizem",
    moodDescription:
      "Evrenin en derin katmanlarındaki kozmik morluklar ve menekşe tonlarında yıldızlar. Gizemli, büyüleyici ve ruhani bir atmosfer — galaksinin kalbine yolculuk.",
    designFeatures: [
      "Derin mor bulutsular ile mistik gece atmosferi",
      "Menekşe tonlarında yıldız parlamaları ve mor meteorlar",
      "Gül altını kontrastlı güneş detayı",
      "Gizemli, ruhani ve büyüleyici bir tasarım",
    ],
    suggestedOccasions: ["Ruhani An", "Meditasyon", "Doğum Günü", "Anma"],
    demoTitle: "Sonsuz Işık",
    demoMessage:
      "Seni her andığımızda, gökyüzündeki bu yıldızlar kadar parlaksın.",
    demoLocation: "Trabzon, Türkiye",
    demoLat: 41.0027,
    demoLon: 39.7168,
    demoTimezone: "Europe/Istanbul",
    demoDate: "2021-10-10T11:00:00.000Z",
    demoDateLabel: "10 Ekim 2021 · 11:00",
    demoPhoto:
      "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&auto=format&fit=crop&q=80",
    timelinePhoto:
      "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&auto=format&fit=crop&q=80",
    timelineText: "Huzurlu bir hatıra, sonsuz bir ışık...",
  },
];

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
    description: "Gökyüzü haritasındaki en parlak yıldızların bilimsel adları, büyüklük değerleri ve numaralı referansları ile gerçek bir astronomi deneyimi.",
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
    title: "Zaman Çizelgesi",
    description: "Zamanla büyüyen dijital günlük. Her 6 ayda bir yeni fotoğraf ve not ekleyerek anınızı yaşayan bir hikayeye dönüştürün.",
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

export default function DigitalProductPage() {
  const [activePaletteId, setActivePaletteId] = useState("kehribar");

  const activeShowcase =
    PALETTE_SHOWCASES.find((s) => s.paletteId === activePaletteId) ??
    PALETTE_SHOWCASES[0];

  const activePalette = getSkyPalette(activeShowcase.paletteId);

  const sky = computeSky({
    date: new Date(activeShowcase.demoDate),
    latitude: activeShowcase.demoLat,
    longitude: activeShowcase.demoLon,
  });

  const createHref = `/create?palette=${activeShowcase.paletteId}`;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen px-4 pb-20 pt-28 sm:px-8 sm:pb-28 sm:pt-36 bg-void text-text overflow-hidden relative">
        <div className="mx-auto max-w-6xl">

          {/* ─── Hero Section ─── */}
          <RevealOnScroll className="mb-14 flex flex-col items-center text-center sm:mb-20">
            <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-amber">
              Dijital Ürünümüz
            </p>
            <h1 className="mt-3.5 font-display text-3xl italic leading-tight text-bright sm:text-5xl">
              O Ana Ait Gökyüzü, Senin Renklerin
            </h1>
            <p className="mt-4 max-w-lg text-xs leading-relaxed text-subtle sm:text-sm">
              Hayatınızın herhangi bir anının gerçek yıldız haritasını, 8 farklı
              tasarım temasıyla kişiselleştirin. Her renk, farklı bir duygu ve
              atmosfer taşıyor.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="rounded-full border border-amber/30 bg-amber/5 px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest text-amber">
                Tek seferlik · {formatTRY(DIGITAL_PRICE)}
              </span>
            </div>
          </RevealOnScroll>

          {/* ─── Palette Selector (Tab Bar) ─── */}
          <RevealOnScroll className="mb-10 sm:mb-14">
            <p className="mb-4 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-dim">
              Bir Tasarım Teması Seçin
            </p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {PALETTE_SHOWCASES.map((s) => {
                const pal = getSkyPalette(s.paletteId);
                const isActive = activePaletteId === s.paletteId;
                return (
                  <button
                    key={s.paletteId}
                    type="button"
                    onClick={() => setActivePaletteId(s.paletteId)}
                    className={`group relative flex items-center gap-2.5 rounded-full px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest transition-all duration-300 ${
                      isActive
                        ? "bg-amber/15 border border-amber/50 text-amber font-semibold shadow-[0_0_20px_-4px_rgba(230,163,92,0.25)]"
                        : "bg-text/[0.03] border border-text/10 text-muted hover:border-amber/30 hover:text-bright"
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

              {/* Price and CTA */}
              <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-text/10 bg-text/[0.02] p-5 sm:p-6">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-dim">
                    Tek Seferlik Ödeme
                  </p>
                  <p className="mt-1 font-mono text-2xl font-semibold text-amber">
                    {formatTRY(DIGITAL_PRICE)}
                  </p>
                </div>
                <Link
                  href={createHref}
                  className="rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-8 py-4 font-mono text-xs uppercase tracking-widest text-ink shadow-[0_10px_40px_-12px_rgba(230,163,92,0.6)] transition-all hover:scale-[1.02] hover:opacity-95"
                >
                  Bu Tasarımla Başla
                </Link>
              </div>
            </div>

            {/* Right Column: iPhone Mockup Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative">
                {/* Glowing background behind phone */}
                <div
                  className="absolute -inset-4 rounded-[48px] blur-xl -z-10 transition-all duration-700"
                  style={{
                    background: `radial-gradient(circle, ${activePalette.skyCenter}40 0%, transparent 70%)`,
                  }}
                />

                {/* iPhone Frame */}
                <div className="relative w-[300px] h-[600px] rounded-[44px] border-[10px] border-[#1d1d1f] bg-[#0b0810] shadow-[0_30px_70px_-10px_rgba(0,0,0,0.9)] ring-1 ring-white/10 flex flex-col overflow-hidden">

                  {/* Dynamic Island */}
                  <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-[#1d1d1f] rounded-full z-30 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-void/70 absolute left-3.5" />
                    <div className="w-10 h-0.5 bg-[#2d2d2f] rounded-full" />
                  </div>

                  {/* Scrollable Screen Content */}
                  <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none pt-12 pb-6 px-3.5 space-y-8 select-none relative text-left scroll-smooth">
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
                      className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_35%,rgba(11,8,16,0.15)_0%,rgba(11,8,16,0.65)_70%,#0b0810_100%)]"
                    />

                    {/* Title Reveal */}
                    <div className="text-center pt-3 flex flex-col items-center">
                      <span
                        className="h-0.5 w-6 rounded"
                        style={{ backgroundColor: `${activePalette.label}50` }}
                      />
                      <h3 className="mt-3.5 font-display text-lg italic text-bright leading-tight max-w-[200px] mx-auto">
                        {activeShowcase.demoTitle}
                      </h3>
                      <p
                        className="mt-2 font-mono text-[8px] uppercase tracking-widest"
                        style={{ color: activePalette.label }}
                      >
                        {activeShowcase.demoDateLabel}
                      </p>
                      <p className="mt-0.5 font-mono text-[7px] text-dim">
                        {activeShowcase.demoLocation.toUpperCase()}
                      </p>
                    </div>

                    {/* Star Medallion & Message */}
                    <div className="flex flex-col items-center">
                      <div
                        className="relative aspect-square w-48 rounded-full p-1.5 bg-void/50 backdrop-blur-sm"
                        style={{
                          border: `1px solid ${activePalette.label}33`,
                          boxShadow: `0 0 25px ${activePalette.label}25`,
                        }}
                      >
                        <div className="h-full w-full rounded-full overflow-hidden relative">
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
                          &ldquo;{activeShowcase.demoMessage}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Star Key Legend */}
                    <div
                      className="mx-1 p-3 rounded-xl bg-void/75 backdrop-blur-sm text-center"
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
                            src={activeShowcase.demoPhoto}
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
                          &ldquo;{activeShowcase.timelineText}&rdquo;
                        </p>
                        <div className="w-28 mt-2.5 overflow-hidden bg-[#fdfaf1] p-1 pb-2 shadow-lg shadow-black/40 -rotate-[2deg]">
                          <div className="w-full aspect-square bg-[#eceae1] overflow-hidden rounded-sm relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={activeShowcase.timelinePhoto}
                              alt="Eklenen anı"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Voice Record */}
                    <div
                      className="mx-1 p-2.5 rounded-xl bg-void/75 backdrop-blur-sm flex items-center justify-between"
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
                          Sesli_Kapsul.mp3
                        </div>
                      </div>
                      <div
                        className="text-[7.5px] font-mono"
                        style={{ color: activePalette.label }}
                      >
                        0:45
                      </div>
                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-[#1d1d1f] rounded-full z-30" />
                </div>
              </div>
            </div>
          </div>

          {/* ─── General Features Section ─── */}
          <RevealOnScroll className="mt-24 sm:mt-32">
            <div className="text-center mb-12">
              <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-amber">
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
                  className="group rounded-2xl border border-text/10 bg-text/[0.02] p-6 space-y-3 transition-all duration-300 hover:border-amber/20 hover:bg-amber/[0.02]"
                >
                  <div className="h-10 w-10 rounded-xl bg-amber/10 text-amber flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
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
              className="mt-8 inline-block rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-10 py-4 font-mono text-xs uppercase tracking-widest text-ink shadow-[0_10px_40px_-12px_rgba(230,163,92,0.6)] transition-all hover:scale-[1.02] hover:opacity-95"
            >
              Hemen Başla
            </Link>
          </RevealOnScroll>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
