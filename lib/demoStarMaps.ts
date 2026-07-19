import type { StarMapRecord } from "@/lib/starmaps";

/**
 * Full "gerçek deneyim" demo pages for /urun/dijital — one finished,
 * fully-populated StarMapRecord per sky palette so visitors can open the
 * *real* StarMapView (same component /s/[slug] renders) instead of a static
 * mockup. Photos are deterministic Picsum placeholders (seeded per palette,
 * always resolve — no risk of a dead third-party photo id), music is a
 * shared pair of real YouTube tracks alternated across palettes.
 */

const MUSIC_TRACKS = [
  "https://www.youtube.com/watch?v=7V8MQ20cc0s&list=PLfP6i5T0-DkImSa4jTf2RsWKkbEgS7ugB&index=27",
  "https://www.youtube.com/watch?v=pv1UkRXo84U&list=PLfP6i5T0-DkImSa4jTf2RsWKkbEgS7ugB&index=4",
];

function picsum(seed: string, w = 600, h = 750): string {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

export interface DemoStarMapMeta {
  paletteId: string;
  moodTitle: string;
  moodSubtitle: string;
  moodDescription: string;
  designFeatures: string[];
  suggestedOccasions: string[];
  starMap: StarMapRecord;
}

interface DemoSeed {
  paletteId: string;
  moodTitle: string;
  moodSubtitle: string;
  moodDescription: string;
  designFeatures: string[];
  suggestedOccasions: string[];
  title: string;
  message: string;
  location: string;
  lat: number;
  lon: number;
  timezone: string;
  eventDateUtc: string;
  timelineNotes: [string, string];
}

const DEMO_SEEDS: DemoSeed[] = [
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
    title: "Elif & Kaan",
    message: "Yıllar geçse de gökyüzü hep o geceyi hatırlıyor. Seni çok seviyorum.",
    location: "İstanbul, Türkiye",
    lat: 41.0082,
    lon: 28.9784,
    timezone: "Europe/Istanbul",
    eventDateUtc: "2024-02-14T21:00:00.000Z",
    timelineNotes: ["Bir yıl sonra, aynı yerde yine el ele...", "İkinci yıl dönümümüz — hâlâ aynı heyecan."],
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
    title: "Sena & Berk",
    message: "Bana hayatının en güzel evet cevabını verdiğin o eşsiz an.",
    location: "Antalya, Türkiye",
    lat: 36.8969,
    lon: 30.7133,
    timezone: "Europe/Istanbul",
    eventDateUtc: "2025-06-21T22:15:00.000Z",
    timelineNotes: ["Ve işte o büyük gün, heyecanımız göklerde!", "Nişan hazırlıkları başladı bile."],
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
    title: "Deniz Ailesi",
    message: "Dünyaya geldiğin an, gökyüzündeki tüm yıldızlar senin için parlıyordu.",
    location: "Ankara, Türkiye",
    lat: 39.9334,
    lon: 32.8597,
    timezone: "Europe/Istanbul",
    eventDateUtc: "2020-03-12T09:15:00.000Z",
    timelineNotes: ["İlk adımların ve o kocaman gülüşün...", "İlk okul günün, ne çabuk büyüdün."],
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
    title: "Arda'nın Günü",
    message: "Emeğinin, uykusuz gecelerinin ve bu büyük gururun gökyüzü şahidi.",
    location: "Eskişehir, Türkiye",
    lat: 39.7767,
    lon: 30.5206,
    timezone: "Europe/Istanbul",
    eventDateUtc: "2026-06-20T17:00:00.000Z",
    timelineNotes: ["Zorlu yolları bitirdik, şimdi yeni ufuklara!", "İlk iş teklifi geldi — yolun devamı hayırlı olsun."],
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
    title: "Osmanlı Gecesi",
    message: "O büyük tarihi anın üzerindeki gökyüzünün haritası.",
    location: "Bursa, Türkiye",
    lat: 40.1827,
    lon: 29.0665,
    timezone: "Europe/Istanbul",
    eventDateUtc: "1453-05-29T03:00:00.000Z",
    timelineNotes: ["Tarih sayfalarından süzülen ışık...", "Yıllar sonra yeniden okunan bir hatıra."],
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
    title: "Yeni Ufuklar",
    message: "Yeni bir hayat, yeni bir gökyüzü. Her şeyin başladığı an.",
    location: "İzmir, Türkiye",
    lat: 38.4192,
    lon: 27.1287,
    timezone: "Europe/Istanbul",
    eventDateUtc: "2025-09-01T20:00:00.000Z",
    timelineNotes: ["İlk adımlar, sonsuz olasılıklar...", "Yeni şehirde ilk altı ayımızı doldurduk."],
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
    title: "Ateş Gecesi",
    message: "Kalbimin senin için çarptığı ilk gece, yıldızlar bile kızardı.",
    location: "Kapadokya, Türkiye",
    lat: 38.6431,
    lon: 34.8297,
    timezone: "Europe/Istanbul",
    eventDateUtc: "2024-08-15T23:30:00.000Z",
    timelineNotes: ["O gece her şey başladı...", "Bir yıl oldu, hâlâ aynı ateş."],
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
    title: "Sonsuz Işık",
    message: "Seni her andığımızda, gökyüzündeki bu yıldızlar kadar parlaksın.",
    location: "Trabzon, Türkiye",
    lat: 41.0027,
    lon: 39.7168,
    timezone: "Europe/Istanbul",
    eventDateUtc: "2021-10-10T11:00:00.000Z",
    timelineNotes: ["Huzurlu bir hatıra, sonsuz bir ışık...", "Her andığımızda yeniden parlayan bir an."],
  },
];

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function buildStarMap(seed: DemoSeed, index: number): StarMapRecord {
  const eventDateUtc = new Date(seed.eventDateUtc);
  const musicUrl = MUSIC_TRACKS[index % MUSIC_TRACKS.length];

  return {
    slug: `ornek-${seed.paletteId}`,
    title: seed.title,
    message: seed.message,
    eventDateUtc,
    timezone: seed.timezone,
    latitude: seed.lat,
    longitude: seed.lon,
    locationName: seed.location,
    musicUrl,
    voiceNoteUrl: null,
    videoUrl: null,
    palette: seed.paletteId,
    journalThemeId: null,
    createdAt: eventDateUtc,
    entries: [
      {
        id: "periodic-2",
        date: addMonths(eventDateUtc, 12),
        photos: [{ url: picsum(`${seed.paletteId}-t2`) }],
        note: seed.timelineNotes[1],
        isInitial: false,
      },
      {
        id: "periodic-1",
        date: addMonths(eventDateUtc, 6),
        photos: [{ url: picsum(`${seed.paletteId}-t1`) }],
        note: seed.timelineNotes[0],
        isInitial: false,
      },
      {
        id: "initial",
        date: eventDateUtc,
        photos: [
          { url: picsum(`${seed.paletteId}-f1`), caption: "İlk “Merhaba”" },
          { url: picsum(`${seed.paletteId}-f2`) },
          { url: picsum(`${seed.paletteId}-f3`) },
          { url: picsum(`${seed.paletteId}-f4`) },
        ],
        note: null,
        isInitial: true,
      },
    ],
  };
}

export const DIGITAL_DEMO_SHOWCASES: DemoStarMapMeta[] = DEMO_SEEDS.map((seed, index) => ({
  paletteId: seed.paletteId,
  moodTitle: seed.moodTitle,
  moodSubtitle: seed.moodSubtitle,
  moodDescription: seed.moodDescription,
  designFeatures: seed.designFeatures,
  suggestedOccasions: seed.suggestedOccasions,
  starMap: buildStarMap(seed, index),
}));

export function getDemoStarMap(paletteId: string): DemoStarMapMeta | null {
  return DIGITAL_DEMO_SHOWCASES.find((s) => s.paletteId === paletteId) ?? null;
}
