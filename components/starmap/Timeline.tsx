"use client";

import { useState } from "react";
import { PhotoSlot } from "@/components/journal/PhotoSlot";
import { Lightbox } from "@/components/ui/Lightbox";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import type { TimelineEntry } from "@/lib/starmaps";
import type { SkyPalette } from "@/components/astrolab/palettes";
import { isAddWindowOpen } from "@/lib/starmapTimeline";
import { AddEntryForm } from "./AddEntryForm";

export const PHOTO_ROTATIONS = [-2.5, 2, 1.5, -2];

const TEMPLATE_CARDS = [
  {
    id: "ilk-fotografimiz",
    title: "İlk Fotoğrafımız",
    note: "İlk fotoğrafımızdan güzel bir kare...",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
      </svg>
    )
  },
  {
    id: "en-sevdigimiz-tatil",
    title: "En Sevdiğimiz Tatil",
    note: "En sevdiğimiz tatilden unutulmaz bir an...",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
      </svg>
    )
  },
  {
    id: "gelecege-bir-not",
    title: "Geleceğe Bir Not",
    note: "Geleceğe ufak bir not ve fotoğraf...",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    )
  }
];

export interface TimelineProps {
  slug: string;
  createdAt: Date;
  entries: TimelineEntry[];
  palette: SkyPalette;
  /** True only when a valid owner cookie was verified server-side — visitors with just the share link never see add controls. */
  isOwner: boolean;
  isPreviewMode?: boolean;
}

function formatEntryDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(date);
}

/** Growing photo timeline for the digital page — supersedes the old static MemoriesGallery. */
export function Timeline({ slug, createdAt, entries, palette, isOwner, isPreviewMode = false }: TimelineProps) {
  const [showForm, setShowForm] = useState(false);
  const [prefilledNote, setPrefilledNote] = useState<string | undefined>(undefined);
  const [activePhoto, setActivePhoto] = useState<{ url: string; caption: string } | null>(null);
  const windowOpen = isOwner && isAddWindowOpen(createdAt, entries);
  const isGravur = palette.id === "gravur-atlas";
  const t = {
    eyebrow: isGravur ? "text-gravur-ink-soft" : "text-dim",
    body: isGravur ? "text-gravur-ink-soft" : "text-subtle",
    accentText: isGravur ? "text-gravur-copper" : "text-amber",
    accentBorder: isGravur ? "border-gravur-copper/40" : "border-amber/40",
    accentBg: isGravur ? "bg-gravur-copper/10" : "bg-amber/10",
    accentDot: isGravur ? "bg-gravur-copper" : "bg-amber",
    accentButtonHover: isGravur ? "hover:bg-gravur-copper hover:text-gravur-paper" : "hover:bg-amber hover:text-ink",
    dashedCard: isGravur
      ? "border-gravur-copper/40 bg-gravur-copper/[0.02] hover:border-gravur-copper hover:bg-gravur-copper/[0.05]"
      : "border-amber/30 bg-amber/[0.02] hover:border-amber hover:bg-amber/[0.05]",
    dashedInner: isGravur ? "border-gravur-copper/20 text-gravur-copper/40 group-hover:text-gravur-copper/80" : "border-amber/20 text-amber/40 group-hover:text-amber/80",
    accentTextSoft: isGravur ? "text-gravur-copper/90 group-hover:text-gravur-copper" : "text-amber/90 group-hover:text-amber",
    pinDot: isGravur ? "bg-gravur-copper" : "bg-gradient-to-r from-amber-light to-amber-deep",
  };

  if (entries.length === 0 && !isOwner) return null;
  const isTimelineEmpty = entries.length === 0;

  return (
    <div>
      <p className={`text-center font-mono text-[10px] uppercase tracking-[0.3em] ${t.eyebrow}`}>Zaman Çizelgesi</p>

      {isOwner && windowOpen && (
        <div className="mt-5 flex flex-col items-center gap-3">
          {!showForm && (
            <div className={`flex items-center gap-2.5 rounded-full border px-4 py-2 ${t.accentBorder} ${t.accentBg}`}>
              <span
                aria-hidden
                className={`h-1.5 w-1.5 shrink-0 animate-pulse rounded-full motion-reduce:animate-none ${t.accentDot}`}
              />
              <span className={`font-mono text-[10px] uppercase tracking-[0.16em] ${t.accentText}`}>
                Yeni bir an eklemenin zamanı geldi
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              setShowForm((prev) => !prev);
              if (showForm) {
                setPrefilledNote(undefined);
              }
            }}
            className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${t.accentBorder} ${t.accentText} ${t.accentButtonHover}`}
          >
            {showForm ? "Vazgeç" : "+ Yeni An Ekle"}
          </button>
          {showForm && (
            <div className="w-full max-w-sm">
              <AddEntryForm
                slug={slug}
                onDone={() => {
                  setShowForm(false);
                  setPrefilledNote(undefined);
                }}
                initialNote={prefilledNote}
              />
            </div>
          )}
        </div>
      )}

      {isTimelineEmpty && isOwner && windowOpen && (
        <div className="mt-8">
          <p className={`text-center text-xs mb-6 max-w-md mx-auto leading-relaxed ${t.body}`}>
            Zaman çizelgeniz henüz boş. Sevdiğiniz anıları ekleyerek sayfanızı zenginleştirebilirsiniz. İlham almak için aşağıdaki şablonlardan birine tıklayın:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-xl mx-auto px-4">
            {TEMPLATE_CARDS.map((card, idx) => {
              const rotation = PHOTO_ROTATIONS[idx % PHOTO_ROTATIONS.length];
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => {
                    setPrefilledNote(card.note);
                    setShowForm(true);
                    setTimeout(() => {
                      document.getElementById("add-entry-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
                      (document.getElementById("entry-note") as HTMLTextAreaElement)?.focus();
                    }, 100);
                  }}
                  className={`group relative flex flex-col items-center border border-dashed p-3 pb-5 rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1 text-center ${t.dashedCard}`}
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  {/* Pin/Raptiye detayı */}
                  <span
                    aria-hidden
                    className={`absolute -top-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full shadow opacity-60 group-hover:opacity-100 transition-opacity ${t.pinDot}`}
                  />
                  {/* Fotoğraf Yer Tutucusu */}
                  <div className={`w-full aspect-square border border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${t.dashedInner}`}>
                    {card.icon}
                    <span className="mt-2 font-mono text-[8px] uppercase tracking-wider opacity-60">
                      Fotoğraf Ekle
                    </span>
                  </div>
                  {/* Şablon Başlığı */}
                  <h4 className={`mt-3.5 font-display text-[13px] italic transition-colors ${t.accentTextSoft}`}>
                    {card.title}
                  </h4>
                  <p className={`mt-1 text-[10px] leading-relaxed ${t.eyebrow}`}>
                    Tıkla ve oluştur
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 space-y-8">
        {entries.map((entry, entryIndex) => (
          <RevealOnScroll key={entry.id} delayMs={entryIndex * 120} durationMs={500}>
            <p className={`text-center font-mono text-[9px] uppercase tracking-[0.25em] ${t.accentText}`}>
              {formatEntryDate(entry.date)}
            </p>
            {entry.note && (
              <p className={`mx-auto mt-2 max-w-md text-center font-display text-sm italic leading-relaxed ${t.body}`}>
                &ldquo;{entry.note}&rdquo;
              </p>
            )}
            {entry.photos.length > 0 && (
              <div className="mt-6 flex flex-col items-center gap-6">
                {entry.photos.map((photo, photoIndex) => (
                  <div key={photo.url ?? `${entry.id}-${photoIndex}`} className="w-44 sm:w-56">
                    <PhotoSlot
                      photo={photo}
                      rotateDeg={PHOTO_ROTATIONS[photoIndex % PHOTO_ROTATIONS.length]}
                      isPreviewMode={isPreviewMode}
                      onImageClick={(url, caption) => setActivePhoto({ url, caption })}
                    />
                  </div>
                ))}
              </div>
            )}
          </RevealOnScroll>
        ))}
      </div>

      <Lightbox
        url={activePhoto?.url ?? null}
        caption={activePhoto?.caption}
        onClose={() => setActivePhoto(null)}
      />
    </div>
  );
}
