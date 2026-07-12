"use client";

import { StarChart } from "@/components/astrolab/StarChart";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import type { StarMapPhoto } from "@/lib/starmaps";
import { CoverPanel } from "./CoverPanel";
import { PhotoSlot } from "./PhotoSlot";

/**
 * One small, self-contained preview per İçindekiler item on /urun/defter —
 * each fills its parent (`h-full w-full`) so the page can drop them into
 * uniform grid cells. Deterministic PRNG (mulberry32, same approach as
 * drawLeatherTexture.ts) only desynchronizes cosmetic QR speckle, never
 * real data — the QR pattern itself is decorative and non-functional.
 */

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PHOTO_ROTATIONS = [-2.5, 2, 1.5, -2];

export function CoverPreview({ title }: { title: string }) {
  return <CoverPanel fullscreen title={title} subtitle="Kapak" />;
}

export interface TitleSpreadPreviewProps {
  title: string;
  dateLabel: string;
  locationName: string;
  sky: ComputeSkyResult;
}

export function TitleSpreadPreview({ title, dateLabel, locationName, sky }: TitleSpreadPreviewProps) {
  return (
    <div className="relative flex h-full w-full overflow-hidden rounded-md shadow-xl shadow-black/50">
      <div className="flex w-1/2 flex-col items-center justify-center gap-1.5 bg-parchment px-2.5 text-center">
        <p className="font-display text-sm italic leading-tight text-ink">{title}</p>
        <p className="font-mono text-[7px] uppercase tracking-widest text-ink/60">{dateLabel}</p>
        <p className="font-mono text-[7px] uppercase tracking-widest text-ink/60">{locationName}</p>
      </div>
      <div className="w-1/2">
        <StarChart sky={sky} label={`${locationName} yıldız haritası`} className="h-full w-full" showLabels={false} />
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/50" />
    </div>
  );
}

export function SkyLogPreview({ narrative }: { narrative: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-md bg-parchment px-4 text-center shadow-xl shadow-black/50">
      <p className="font-mono text-[7px] uppercase tracking-[0.25em] text-ink/50">Gökyüzü Kaydı</p>
      <p className="font-display text-xs italic leading-relaxed text-ink">
        {narrative || "O anın Ay evresi ve gezegenleri burada yazılı."}
      </p>
    </div>
  );
}

export function MemoriesPreview({ photos }: { photos: StarMapPhoto[] }) {
  return (
    <div className="grid h-full w-full grid-cols-2 place-items-center gap-2 rounded-md bg-text/[0.035] p-3">
      {photos.slice(0, 4).map((photo, index) => (
        <div key={photo.caption ?? index} className="w-full max-w-[4.5rem]">
          <PhotoSlot photo={photo} rotateDeg={PHOTO_ROTATIONS[index % PHOTO_ROTATIONS.length]} />
        </div>
      ))}
    </div>
  );
}

const QR_GRID = 11;
const QR_MODULE = 10;
const FINDER_CORNERS: [number, number][] = [
  [0, 0],
  [0, QR_GRID - 3],
  [QR_GRID - 3, 0],
];

function isFinderZone(row: number, col: number): boolean {
  return FINDER_CORNERS.some(([r, c]) => row >= r && row < r + 3 && col >= c && col < c + 3);
}

/** Deterministic, non-functional QR-look pattern — decorative only, never a real payload. */
export function QrPreview() {
  const rnd = mulberry32(7);
  const modules: boolean[] = [];
  for (let row = 0; row < QR_GRID; row++) {
    for (let col = 0; col < QR_GRID; col++) {
      modules.push(isFinderZone(row, col) ? false : rnd() > 0.55);
    }
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 rounded-md bg-parchment p-4 shadow-xl shadow-black/50">
      <svg viewBox={`0 0 ${QR_GRID * QR_MODULE} ${QR_GRID * QR_MODULE}`} className="w-2/3" aria-hidden>
        {modules.map((filled, index) => {
          if (!filled) return null;
          const row = Math.floor(index / QR_GRID);
          const col = index % QR_GRID;
          return (
            <rect key={index} x={col * QR_MODULE} y={row * QR_MODULE} width={QR_MODULE} height={QR_MODULE} fill="#2a2318" />
          );
        })}
        {FINDER_CORNERS.map(([r, c]) => (
          <g key={`${r}-${c}`}>
            <rect x={c * QR_MODULE} y={r * QR_MODULE} width={QR_MODULE * 3} height={QR_MODULE * 3} fill="#2a2318" />
            <rect x={c * QR_MODULE + QR_MODULE} y={r * QR_MODULE + QR_MODULE} width={QR_MODULE} height={QR_MODULE} fill="#f3ecda" />
          </g>
        ))}
      </svg>
      <p className="font-mono text-[7px] uppercase tracking-widest text-ink/60">Dijital sayfana git →</p>
    </div>
  );
}

export function PageStackPreview() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-md bg-leather/40 shadow-xl shadow-black/50">
      <svg viewBox="0 0 64 64" className="h-12 w-12" fill="none" stroke="#e6b877" strokeWidth="1.6" strokeLinejoin="round">
        <rect x="10" y="14" width="36" height="44" rx="2" opacity="0.35" />
        <rect x="12" y="12" width="36" height="44" rx="2" opacity="0.6" />
        <rect x="14" y="10" width="36" height="44" rx="2" />
        <line x1="20" y1="20" x2="44" y2="20" opacity="0.5" />
        <line x1="20" y1="27" x2="44" y2="27" opacity="0.5" />
        <line x1="20" y1="34" x2="38" y2="34" opacity="0.5" />
      </svg>
      <p className="font-display text-xl italic text-amber">30</p>
      <p className="font-mono text-[7px] uppercase tracking-widest text-subtle">Sayfa</p>
    </div>
  );
}

export function GiltEdgePreview() {
  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-md shadow-xl shadow-black/50"
      style={{ background: "repeating-linear-gradient(180deg, #f3ecda 0px, #f3ecda 2px, #d8c9a3 2px, #d8c9a3 3px)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(230,184,119,0.85) 0%, rgba(224,163,92,0.55) 35%, rgba(230,184,119,0.85) 55%, rgba(180,130,60,0.35) 100%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30" />
    </div>
  );
}

export function FutureLetterPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-md bg-leather/50 shadow-xl shadow-black/50">
      <svg viewBox="0 0 64 48" className="w-4/5" fill="none" aria-hidden>
        <rect x="2" y="2" width="60" height="44" rx="2" fill="#f3ecda" stroke="#e6b877" strokeWidth="1.2" />
        <path d="M2 4L32 28L62 4" stroke="#e6b877" strokeWidth="1.2" strokeLinejoin="round" />
        <circle cx="32" cy="26" r="7" fill="#e0a35c" stroke="#c98a45" strokeWidth="0.8" />
        <line x1="32" y1="21.5" x2="32" y2="30.5" stroke="#2a2318" strokeWidth="1" />
        <line x1="27.5" y1="26" x2="36.5" y2="26" stroke="#2a2318" strokeWidth="1" />
      </svg>
    </div>
  );
}

export function GoldPenPreview() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-md bg-text/[0.035] shadow-xl shadow-black/50">
      <svg
        viewBox="0 0 64 64"
        className="h-3/5 w-3/5 -rotate-45"
        fill="none"
        stroke="#e6b877"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        aria-hidden
      >
        <rect x="26" y="6" width="12" height="34" rx="6" fill="#2b1e15" />
        <path d="M26 40L32 58L38 40Z" fill="#e6b877" />
        <line x1="32" y1="10" x2="32" y2="38" opacity="0.4" />
      </svg>
    </div>
  );
}
