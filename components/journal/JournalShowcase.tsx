"use client";

import { useState, useMemo } from "react";
import { getJournalTheme } from "@/components/journal/night/journalTheme";
import { JournalThemeProvider } from "@/components/journal/JournalThemeContext";
import { NightCoverPage } from "@/components/journal/night/NightCoverPage";
import { DedicationPage } from "@/components/journal/night/DedicationPage";
import { StarMapSpreadPage } from "@/components/journal/night/StarMapSpreadPage";
import { StarKeyPage } from "@/components/journal/night/StarKeyPage";
import { MemoryPage } from "@/components/journal/night/MemoryPage";
import { EssayPage } from "@/components/journal/night/EssayPage";
import { BlankPage } from "@/components/journal/night/BlankPage";
import { BackCoverPage } from "@/components/journal/night/BackCoverPage";
import { LetterNoticePage } from "@/components/journal/night/LetterNoticePage";
import { BookFlip } from "@/components/journal/BookFlip";
import { pickNumberedStars, splitSkyByAzimuth } from "@/components/journal/starMapSpread";
import { buildSkyEssay, buildSkyNarrative } from "@/lib/astronomy/skyNarrative";
import { ScaledPreview } from "@/components/ScaledPreview";
import { formatTRY } from "@/lib/pricing";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import type { StarMapPhoto } from "@/lib/starmaps";

export interface JournalShowcaseProps {
  sky: ComputeSkyResult;
  title: string;
  eventDateUtc: Date;
  timezone: string;
  locationName: string;
  latitude: number;
  longitude: number;
  memoryPhotos: StarMapPhoto[];
  journalPrice: number;
  journalOriginalPrice?: number;
}

interface PageDescription {
  title: string;
  subtitle: string;
  body: string;
}

const PAGE_DESCRIPTIONS: Record<number, PageDescription> = {
  0: {
    title: "Kişiye Özel Kapak",
    subtitle: "Suni Deri & Altın Yaldız Sıcak Baskı",
    body: "Defterinizin kapağında Astrifer'in minimal ince-çizgi yıldız logosu ve seçtiğiniz isimler yer alır. Premium suni deri cilt üzerine gofre (sıcak yaldız baskı) tekniğiyle tamamen el işçiliğiyle üretilir."
  },
  1: {
    title: "Panoramik Yıldız Haritası (Sol)",
    subtitle: "Kapağın Hemen Ardından — Tek Bir Gökyüzü",
    body: "Kapağı açar açmaz karşınıza çıkan gerçek gökyüzü — bu ve karşı sayfa, aynı anın kesintisiz tek bir panoramik şeridi olacak şekilde birlikte tasarlandı, iki ayrı harita değil."
  },
  2: {
    title: "Panoramik Yıldız Haritası (Sağ)",
    subtitle: "Aynı Şeridin Devamı",
    body: "Sol sayfadaki azimut çizgisi tam bu sayfanın sol kenarından devam eder — takımyıldızlar ve gök cisimleri, sayfa dönümünde kesilmeyen tek bir gerçek gökyüzü görüntüsü oluşturur."
  },
  3: {
    title: "Seyir Kaydı",
    subtitle: "İthaf & O Anın Kaydı",
    body: "Az önce gördüğünüz gökyüzünün altına düşülen bir seyir defteri girişi: isimleriniz, tarih, saat, konum ve koordinatlar — o anı bir kayıt olarak sabitler."
  },
  4: {
    title: "Yıldız Anahtarı",
    subtitle: "Kozmik Kılavuz & Detaylı Anlatım",
    body: "Gökyüzü haritanızda numaralandırılmış olan yıldızların gerçek adlarını, parlaklık derecelerini ve o andaki kozmik hikayelerini içeren detaylı bir kılavuz sayfasıdır."
  },
  5: {
    title: "Birlikte Anılarımız — I",
    subtitle: "İlk \"Merhaba\" Sayfası",
    body: "Birlikte geçen zamanların en değerli ilk fotoğrafını barındıran sayfa. Altın yaldızlı köşe süslemeleri ve fotoğraf alanı ile nostaljik bir albüm havası sunar."
  },
  6: {
    title: "Birlikte Anılarımız — II",
    subtitle: "O Geceye Dair Kareler",
    body: "Hikayenizin başladığı ya da unutulmaz olan o özel geceden kalan ikinci fotoğraf sayfası. Sayfa altına basılan kişisel başlığınızla anıyı somutlaştırır."
  },
  7: {
    title: "Birlikte Anılarımız — III",
    subtitle: "Birlikte Geçen Zamanlar",
    body: "Yolculuğunuzdaki bir diğer önemli dönüm noktası için ayrılmış üçüncü fotoğraf sayfası. Kitabın asil tasarım diliyle bütünleşir."
  },
  8: {
    title: "Birlikte Anılarımız — IV",
    subtitle: "Ailece ve Geleceğe",
    body: "Albüm kısmının son fotoğraf sayfası. Birlikte kurduğunuz hayatı ve sevdiklerinizi bir araya getiren en sıcak kareniz için tasarlanmıştır."
  },
  9: {
    title: "Günün Anlamı ve Önemi",
    subtitle: "Kozmik Hizalanmanın Düzyazı Hikayesi",
    body: "O özel günde Güneş, Ay ve gezegenlerin konumlarının getirdiği astro-kozmik etkileri, günün ruhunu ve hissini anlatan derinlemesine, uzun düzyazı formatında bir anlatım."
  },
  10: {
    title: "Yazı Sayfaları",
    subtitle: "Düz, Çizgisiz Yaprak",
    body: "Defterin geri kalanı, hediye gönderilen altın renkli kalemle kendi el yazınızla anılarınızı veya ortak hayallerinizi yazabileceğiniz, tamamen düz ve çizgisiz dokulu sayfalardan oluşur."
  },
  11: {
    title: "Yazı Sayfaları",
    subtitle: "Ortak Hayalleriniz İçin",
    body: "Defterin son kısımlarında yer alan, duygularınızı ve planlarınızı kalıcı kılmak için kullanabileceğiniz düz sayfalar."
  },
  12: {
    title: "Gelecek Mektubu Notu",
    subtitle: "Mühürlü Cebe Bir İşaret",
    body: "Arka kapaktan hemen önceki bu sayfa, geleceğe yazdığınız mektubun kitabın içinde değil arka kapaktaki mühürlü cepte beklediğini not düşer."
  },
  13: {
    title: "Arka Kapak & QR Kod",
    subtitle: "Mühürlü Cep + Dijital Bağlantı",
    body: "Kitabın arka kapağında hem gofraj dikişli mühürlü mektup cebi hem de dijital sayfanıza ve ses kaydınıza ulaştıran gerçek, taranabilir QR kod bir arada yer alır."
  }
};

export function JournalShowcase({
  sky,
  title,
  eventDateUtc,
  timezone,
  locationName,
  latitude,
  longitude,
  memoryPhotos,
  journalPrice,
  journalOriginalPrice,
}: JournalShowcaseProps) {
  const [activePageIndex, setActivePageIndex] = useState(0);
  const paletteId = "gece-laciverti"; // Default presentation color theme

  // Build the book pages array using computed sky data
  const pages = useMemo(() => {
    const page1Stars = pickNumberedStars(splitSkyByAzimuth(sky, 0, 180), 6, 1);
    const page2Stars = pickNumberedStars(splitSkyByAzimuth(sky, 180, 360), 6, 7);
    const allStars = [...page1Stars, ...page2Stars];

    const narrative = buildSkyNarrative(sky);
    const essay = buildSkyEssay(sky);

    return [
      // 0: Cover (Right)
      <NightCoverPage key="cover" names={title} />,
      // 1: StarMap Left (Left)
      <StarMapSpreadPage key="map-left" sky={sky} numberedStars={page1Stars} azimuthFrom={0} azimuthTo={180} />,
      // 2: StarMap Right (Right)
      <StarMapSpreadPage key="map-right" sky={sky} numberedStars={page2Stars} azimuthFrom={180} azimuthTo={360} />,
      // 3: Dedication / Seyir Kaydı (Left)
      <DedicationPage
        key="dedication"
        names={title}
        eventDateUtc={eventDateUtc}
        timezone={timezone}
        locationName={locationName}
        latitude={latitude}
        longitude={longitude}
      />,
      // 4: StarKey Page (Right)
      <div key="key" className="h-full w-full bg-void">
        <ScaledPreview designWidth={600} designHeight={800} className="h-full w-full">
          <StarKeyPage numberedStars={allStars} narrative={narrative} widthPx={600} heightPx={800} />
        </ScaledPreview>
      </div>,
      // 5: Memory 1 (Left)
      <MemoryPage key="mem1" photo={memoryPhotos[0] ?? {}} caption={memoryPhotos[0]?.caption || "İlk “Merhaba”"} sampleIndex={0} />,
      // 6: Memory 2 (Right)
      <MemoryPage key="mem2" photo={memoryPhotos[1] ?? {}} caption={memoryPhotos[1]?.caption || "O Gece"} sampleIndex={1} />,
      // 7: Memory 3 (Left)
      <MemoryPage key="mem3" photo={memoryPhotos[2] ?? {}} caption={memoryPhotos[2]?.caption || "Yüzük"} sampleIndex={2} />,
      // 8: Memory 4 (Right)
      <MemoryPage key="mem4" photo={memoryPhotos[3] ?? {}} caption={memoryPhotos[3]?.caption || "Ailece"} sampleIndex={3} />,
      // 9: Essay (Left)
      <div key="essay" className="h-full w-full bg-void">
        <ScaledPreview designWidth={600} designHeight={800} className="h-full w-full">
          <EssayPage essay={essay} widthPx={600} heightPx={800} />
        </ScaledPreview>
      </div>,
      // 10: Blank Page (Right)
      <BlankPage key="blank-pre-letter" />,
      // 11: Blank Page (Left)
      <BlankPage key="blank-post-letter" />,
      // 12: Letter Notice (Right)
      <LetterNoticePage key="letter-notice" />,
      // 13: Back Cover + QR (Left)
      <BackCoverPage key="back-cover" qrUrl="https://astrifer.com/s/preview" />,
    ];
  }, [sky, title, eventDateUtc, timezone, locationName, latitude, longitude, memoryPhotos]);

  const activeDescription = useMemo(() => {
    return PAGE_DESCRIPTIONS[activePageIndex] || PAGE_DESCRIPTIONS[0];
  }, [activePageIndex]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.8fr] lg:items-start lg:gap-12 mt-12 bg-void/30 p-6 sm:p-8 rounded-3xl border border-text/10">
      
      {/* Page Description Panel (Left Sürüm) */}
      <div className="flex flex-col h-full justify-between min-h-[220px] bg-void/40 border border-text/5 p-6 rounded-2xl">
        <div className="space-y-4">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-amber font-bold">
              Defterin İçi · Sayfa {activePageIndex === 0 ? "Kapak" : `${activePageIndex} / 13`}
            </span>
            <h3 className="font-display italic text-2xl text-bright mt-1.5 transition-all duration-300">
              {activeDescription.title}
            </h3>
            <p className="font-mono text-[10px] text-dim uppercase tracking-wider mt-1">
              {activeDescription.subtitle}
            </p>
          </div>
          
          <p className="text-xs sm:text-sm text-subtle leading-relaxed transition-all duration-300">
            {activeDescription.body}
          </p>
        </div>

        <div className="mt-8 pt-4 border-t border-text/5 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] font-mono text-dim">Yüksek kaliteli dokulu kâğıt</span>
          <span className="text-xs font-bold text-amber font-mono flex items-center gap-1.5 flex-wrap">
            Astrifer Defter ·{" "}
            {journalOriginalPrice && journalOriginalPrice > journalPrice ? (
              <>
                <span className="line-through text-dim">{formatTRY(journalOriginalPrice)}</span>
                <span>{formatTRY(journalPrice)}</span>
                <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[8px] font-bold text-green-400">
                  %{Math.round(((journalOriginalPrice - journalPrice) / journalOriginalPrice) * 100)} İNDİRİM
                </span>
              </>
            ) : (
              <span>{formatTRY(journalPrice)}</span>
            )}
          </span>
        </div>
      </div>

      {/* Book Flip Preview Panel (Sağ Sürüm) */}
      <div className="w-full">
        <JournalThemeProvider theme={getJournalTheme(paletteId)}>
          <BookFlip pages={pages} onPageChange={setActivePageIndex} />
        </JournalThemeProvider>
        <div
          aria-hidden
          className="mx-auto -mt-2 h-6 w-[85%] max-w-2xl rounded-[100%] bg-black/40 blur-xl"
        />
      </div>

    </div>
  );
}
