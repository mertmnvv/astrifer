"use client";

import { useMemo } from "react";
import Link from "next/link";
import { StarChart } from "@/components/astrolab/StarChart";
import { StarKeyLegend } from "@/components/astrolab/StarKeyLegend";
import { getSkyPalette } from "@/components/astrolab/palettes";
import { AtlasPanel } from "@/components/atlas/AtlasPanel";
import { LedgerRule } from "@/components/atlas/LedgerRule";
import { PageLinkCard } from "@/components/create/PageLinkCard";
import { NightCoverPage } from "@/components/journal/night/NightCoverPage";
import { getJournalTheme } from "@/components/journal/night/journalTheme";
import { JournalThemeProvider } from "@/components/journal/JournalThemeContext";
import { PhotoSlot } from "@/components/journal/PhotoSlot";
import { PHOTO_ROTATIONS } from "@/components/starmap/Timeline";
import { computeSky } from "@/lib/astronomy/computeSky";
import type { OrderDoc } from "@/types/firestore";

interface OrderReadyViewProps {
  order: Omit<OrderDoc, "createdAt" | "updatedAt" | "journalLetterOpeningDate"> & {
    id: string;
    createdAt: string;
    journalLetterOpeningDate: string | null;
  };
  starMap: {
    title: string;
    message: string | null;
    eventDateUtc: string; // Serialized ISO string
    timezone: string;
    latitude: number;
    longitude: number;
    locationName: string;
    palette: string;
    journalThemeId?: string | null;
    photoUrls: string[];
    createdAt: string; // Serialized ISO string
  };
}

export function OrderReadyView({ order, starMap }: OrderReadyViewProps) {
  const siteHost = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://astrifer.com")
    .replace(/^https?:\/\//, "");

  const starMapEventDate = useMemo(() => new Date(starMap.eventDateUtc), [starMap.eventDateUtc]);

  const sky = useMemo(() => {
    return computeSky({
      date: starMapEventDate,
      latitude: starMap.latitude,
      longitude: starMap.longitude,
    });
  }, [starMapEventDate, starMap.latitude, starMap.longitude]);

  const dateLabel = useMemo(() => {
    return new Intl.DateTimeFormat("tr-TR", {
      timeZone: starMap.timezone,
      dateStyle: "long",
      timeStyle: "short",
    }).format(starMapEventDate);
  }, [starMapEventDate, starMap.timezone]);

  const previewLabel = `${starMap.locationName} üzerinde ${dateLabel} anının gökyüzü`;
  const palette = getSkyPalette(starMap.palette);

  // Check if journal was ordered
  const hasJournal = order.items.some((item) => item.productType === "journal");
  const journalItem = order.items.find((item) => item.productType === "journal");

  const journalTheme = useMemo(() => {
    return getJournalTheme(starMap.journalThemeId || starMap.palette);
  }, [starMap.journalThemeId, starMap.palette]);

  const coordsLabel = useMemo(() => {
    const lat = `${Math.abs(starMap.latitude).toFixed(2)}°${starMap.latitude >= 0 ? "K" : "G"}`;
    const lon = `${Math.abs(starMap.longitude).toFixed(2)}°${starMap.longitude >= 0 ? "D" : "B"}`;
    return `${lat} ${lon}`;
  }, [starMap.latitude, starMap.longitude]);

  return (
    <div className="w-full space-y-10">
      {/* ── 2 Sütunlu Düzen (Sol: Ayrıntılar ve Paylaşım, Sağ: Dijital Önizleme) ── */}
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Sol Sütun: Sipariş Özeti + Paylaşım Linki + Defter Bilgisi (7 Sütun) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Sipariş Durumu */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6 space-y-3">
            <h3 className="font-display text-xl italic text-emerald-400">Siparişiniz Alındı!</h3>
            <p className="text-sm leading-relaxed text-subtle">
              Zaman kapsülü sayfanız başarıyla oluşturuldu ve kalıcı olarak yayına alındı.
            </p>
            <div className="border-t border-text/10 pt-3 space-y-1">
              <p className="text-xs text-subtle">
                Sipariş detayları ve faturanız <span className="text-bright font-medium">{order.customerEmail}</span> adresine e-posta ile iletilmiştir.
              </p>
              {hasJournal && (
                <p className="text-xs text-subtle">
                  Seçtiğiniz Deri Defterin üretimine hemen başlanacaktır.
                </p>
              )}
            </div>
          </div>

          {/* Kalıcı Paylaşım Linki */}
          <PageLinkCard host={siteHost} slug={order.starMapSlug} />

          {/* Sipariş Ayrıntıları */}
          <AtlasPanel padding="lg">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Sipariş Bilgileri</p>
            <div className="mt-4 divide-y divide-text/[0.08]">
              <div className="flex justify-between gap-4 py-3">
                <span className="font-mono text-[11px] uppercase tracking-widest text-dim">Sipariş No</span>
                <span className="font-mono text-sm font-semibold text-amber">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <span className="font-mono text-[11px] uppercase tracking-widest text-dim">Müşteri</span>
                <span className="text-sm text-text">{order.customerName}</span>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <span className="font-mono text-[11px] uppercase tracking-widest text-dim">Telefon</span>
                <span className="text-sm text-text">{order.customerPhone}</span>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <span className="font-mono text-[11px] uppercase tracking-widest text-dim">Ödeme Yöntemi</span>
                <span className="text-sm text-text">Kredi Kartı / Online Ödeme</span>
              </div>
            </div>
          </AtlasPanel>

          {/* Deri Defter Özeti */}
          {hasJournal && journalItem && (
            <AtlasPanel padding="lg" className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 shrink-0">
                  <JournalThemeProvider theme={journalTheme}>
                    <NightCoverPage names={starMap.title} />
                  </JournalThemeProvider>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber">Deri Defter Özeti</p>
                  <h4 className="font-display text-lg italic text-bright">{starMap.title} Defteri</h4>
                </div>
              </div>

              <div className="divide-y divide-text/[0.08] border-t border-text/[0.08] pt-2">
                <div className="py-2.5">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-dim">Defter Rengi &amp; Yaldız</p>
                  <p className="text-xs text-text mt-0.5">{journalTheme.label}</p>
                </div>
                {journalItem.journalLetterText && (
                  <div className="py-2.5">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-dim">Gelecek Mektubu Metni</p>
                    <p className="text-xs italic text-subtle mt-1 leading-relaxed font-display bg-text/[0.02] p-3 rounded-lg border border-text/[0.04]">
                      &ldquo;{journalItem.journalLetterText}&rdquo;
                    </p>
                  </div>
                )}
                {journalItem.journalLetterOpeningDate && (
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-dim">Mektup Açılış Tarihi</span>
                    <span className="font-mono text-xs text-amber font-semibold">
                      {new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(
                        new Date(journalItem.journalLetterOpeningDate)
                      )}
                    </span>
                  </div>
                )}
              </div>
            </AtlasPanel>
          )}

          {/* Alt Linkler */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4">
            <Link
              href="/"
              className="font-mono text-xs uppercase tracking-widest text-subtle underline-offset-4 transition-colors hover:text-bright hover:underline"
            >
              Ana Sayfaya Dön
            </Link>
            <span className="text-dim text-xs hidden sm:inline">•</span>
            <Link
              href="/create"
              className="font-mono text-xs uppercase tracking-widest text-subtle underline-offset-4 transition-colors hover:text-bright hover:underline"
            >
              Yeni Bir Harita Oluştur
            </Link>
          </div>
        </div>

        {/* Sağ Sütun: Dijital Sayfa Görsel Kart Önizlemesi (5 Sütun) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="relative aspect-[3/4] w-full rounded-2xl border border-text/[0.08] bg-panel shadow-2xl shadow-black/65">
            {/* Border frame */}
            <div className="pointer-events-none absolute inset-[13px] rounded-sm border border-amber/[0.18]" />
            <div className="pointer-events-none absolute inset-4 rounded-sm border border-text/10" />
            
            <div className="relative flex h-full flex-col items-center justify-between px-6 pb-6 pt-8">
              {/* Harita */}
              <div className="w-[70%] rounded-full border border-amber/[0.2] p-[6px]">
                <div className="aspect-square overflow-hidden rounded-full border border-amber/40">
                  <StarChart sky={sky} label={previewLabel} className="h-full w-full" palette={palette} />
                </div>
              </div>

              {/* Başlık ve Mesaj */}
              <div className="flex flex-col items-center gap-2.5 text-center mt-2">
                <LedgerRule className="max-w-[4rem] opacity-70" />
                {starMap.message && (
                  <p className="max-w-[28ch] font-display text-sm italic leading-relaxed text-text">
                    &ldquo;{starMap.message}&rdquo;
                  </p>
                )}
                <h3 className="font-display text-xl italic text-bright">{starMap.title}</h3>
                <p className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-amber">{dateLabel}</p>
                <p className="font-mono text-[7.5px] tracking-[0.18em] text-dim">{coordsLabel} · {starMap.locationName.toUpperCase()}</p>
              </div>

              <p className="font-mono text-[8px] tracking-[0.34em] text-faint mt-2">ASTRIFER</p>
            </div>
          </div>

          {/* Yıldız Haritası Numaralandırma Açıklamaları */}
          <AtlasPanel padding="md">
            <StarKeyLegend sky={sky} palette={palette} className="w-full text-xs" />
          </AtlasPanel>

          {/* Yüklenen Fotoğraflar */}
          {starMap.photoUrls.length > 0 && (
            <div className="space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim text-center">Yüklenen Fotoğraflar</p>
              <div className="flex flex-wrap gap-4 items-center justify-center pt-2">
                {starMap.photoUrls.map((url, index) => (
                  <div key={index} className="w-24 sm:w-28 shrink-0">
                    <PhotoSlot
                      photo={{ url }}
                      rotateDeg={PHOTO_ROTATIONS[index % PHOTO_ROTATIONS.length]}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
