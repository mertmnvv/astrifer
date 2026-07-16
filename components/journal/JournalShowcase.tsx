"use client";

import { useState, useMemo } from "react";
import { getJournalTheme } from "@/components/journal/night/journalTheme";
import { JournalThemeProvider } from "@/components/journal/JournalThemeContext";
import { NightCoverPage } from "@/components/journal/night/NightCoverPage";
import { StarMapSpreadPage } from "@/components/journal/night/StarMapSpreadPage";
import { StarKeyPage } from "@/components/journal/night/StarKeyPage";
import { MemoryPage } from "@/components/journal/night/MemoryPage";
import { EssayPage } from "@/components/journal/night/EssayPage";
import { BlankPage } from "@/components/journal/night/BlankPage";
import { BackCoverPage } from "@/components/journal/night/BackCoverPage";
import { QrPage } from "@/components/journal/night/QrPage";
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
    subtitle: "Seçtiğiniz O Anın Gökyüzü",
    body: "Seçtiğiniz tarih, saat ve konumdaki gökyüzünün sol yarısı çizilir. Takımyıldızlar ve gök cisimleri parlaklıklarına göre mücevher kesim numaralarla gösterilir."
  },
  2: {
    title: "Panoramik Yıldız Haritası (Sağ)",
    subtitle: "Gökyüzünün Devamı",
    body: "Gökyüzü haritanızda sağ yarısını kapsayan iki sayfalık panoramik gökyüzü madalyonunun sağ sayfasıdır. O anın gerçek kozmik hizalanmasını bütünsel bir görünümle sunar."
  },
  3: {
    title: "Yıldız Anahtarı",
    subtitle: "Kozmik Kılavuz & Detaylı Anlatım",
    body: "Gökyüzü haritanızda numaralandırılmış olan yıldızların gerçek adlarını, parlaklık derecelerini ve o andaki kozmik hikayelerini içeren detaylı bir kılavuz sayfasıdır."
  },
  4: {
    title: "Birlikte Anılarımız — I",
    subtitle: "İlk \"Merhaba\" Sayfası",
    body: "Birlikte geçen zamanların en değerli ilk fotoğrafını barındıran sayfa. Altın yaldızlı köşe süslemeleri ve fotoğraf alanı ile nostaljik bir albüm havası sunar."
  },
  5: {
    title: "Birlikte Anılarımız — II",
    subtitle: "O Geceye Dair Kareler",
    body: "Hikayenizin başladığı ya da unutulmaz olan o özel geceden kalan ikinci fotoğraf sayfası. Sayfa altına basılan kişisel başlığınızla anıyı somutlaştırır."
  },
  6: {
    title: "Birlikte Anılarımız — III",
    subtitle: "Birlikte Geçen Zamanlar",
    body: "Yolculuğunuzdaki bir diğer önemli dönüm noktası için ayrılmış üçüncü fotoğraf sayfası. Kitabın asil tasarım diliyle bütünleşir."
  },
  7: {
    title: "Birlikte Anılarımız — IV",
    subtitle: "Ailece ve Geleceğe",
    body: "Albüm kısmının son fotoğraf sayfası. Birlikte kurduğunuz hayatı ve sevdiklerinizi bir araya getiren en sıcak kareniz için tasarlanmıştır."
  },
  8: {
    title: "Günün Anlamı ve Önemi",
    subtitle: "Kozmik Hizalanmanın Düzyazı Hikayesi",
    body: "O özel günde Güneş, Ay ve gezegenlerin konumlarının getirdiği astro-kozmik etkileri, günün ruhunu ve hissini anlatan derinlemesine, uzun düzyazı formatında bir anlatım."
  },
  9: {
    title: "Yazı Sayfaları",
    subtitle: "Boş & Çizgili Yaprak",
    body: "Defterin geri kalanı, hediye gönderilen altın renkli kalemle kendi el yazınızla anılarınızı veya ortak hayallerinizi yazabileceğiniz yüksek kaliteli dokulu sayfalardan oluşur."
  },
  10: {
    title: "Yazı Sayfaları",
    subtitle: "Ortak Hayalleriniz İçin",
    body: "Defterin son kısımlarında yer alan, duygularınızı ve planlarınızı kalıcı kılmak için kullanabileceğiniz çizgili sayfalar."
  },
  11: {
    title: "Zaman Kapsülü & QR Kod",
    subtitle: "Dijital Sayfa ve Ses Kaydı Bağlantısı",
    body: "Telefon kamerasıyla tarandığında, oluşturduğunuz dijital anı sayfasına ve ses kaydına/müziğe ulaştıran özel olarak entegre edilmiş QR kod sayfası."
  },
  12: {
    title: "Gelecek Mektubu Cebi",
    subtitle: "Arka Kapakta Mühürlü Sır",
    body: "Kitabın arka kapağında gofraj dikişli mühürlü bir cep yer alır. Geleceğe yazdığınız mektup basılarak bu cebe yerleştirilir ve açılış tarihine kadar kapalı tutulur."
  }
};

export function JournalShowcase({ sky, title, memoryPhotos, journalPrice, journalOriginalPrice }: JournalShowcaseProps) {
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
      <StarMapSpreadPage key="map-left" sky={sky} numberedStars={page1Stars} />,
      // 2: StarMap Right (Right)
      <StarMapSpreadPage key="map-right" sky={sky} numberedStars={page2Stars} />,
      // 3: StarKey Page (Left)
      <div key="key" className="h-full w-full bg-void">
        <ScaledPreview designWidth={600} designHeight={800} className="h-full w-full">
          <StarKeyPage numberedStars={allStars} narrative={narrative} widthPx={600} heightPx={800} />
        </ScaledPreview>
      </div>,
      // 4: Memory 1 (Right)
      <MemoryPage key="mem1" photo={memoryPhotos[0] ?? {}} caption={memoryPhotos[0]?.caption || "İlk “Merhaba”"} />,
      // 5: Memory 2 (Left)
      <MemoryPage key="mem2" photo={memoryPhotos[1] ?? {}} caption={memoryPhotos[1]?.caption || "O Gece"} />,
      // 6: Memory 3 (Right)
      <MemoryPage key="mem3" photo={memoryPhotos[2] ?? {}} caption={memoryPhotos[2]?.caption || "Yüzük"} />,
      // 7: Memory 4 (Left)
      <MemoryPage key="mem4" photo={memoryPhotos[3] ?? {}} caption={memoryPhotos[3]?.caption || "Ailece"} />,
      // 8: Essay (Right)
      <div key="essay" className="h-full w-full bg-void">
        <ScaledPreview designWidth={600} designHeight={800} className="h-full w-full">
          <EssayPage essay={essay} widthPx={600} heightPx={800} />
        </ScaledPreview>
      </div>,
      // 9: Blank Page (Left)
      <BlankPage key="blank-pre-qr" />,
      // 10: Blank Page (Right)
      <BlankPage key="blank-post-qr" />,
      // 11: QR Code Page (Left)
      <QrPage key="qr-page" qrUrl="https://astrifer.com/s/preview" />,
      // 12: Back Cover (Right)
      <BackCoverPage key="back-cover" />,
    ];
  }, [sky, title, memoryPhotos]);

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
              Defterin İçi · Sayfa {activePageIndex === 0 ? "Kapak" : `${activePageIndex} / 12`}
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
      </div>

    </div>
  );
}
