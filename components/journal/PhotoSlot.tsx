import type { StarMapPhoto } from "@/lib/starmaps";

export interface PhotoSlotProps {
  photo: StarMapPhoto;
  rotateDeg: number;
}

export function PhotoSlot({ photo, rotateDeg }: PhotoSlotProps) {
  return (
    <div
      className="relative bg-[#fdfaf1] p-1.5 pb-4 shadow-lg shadow-black/40"
      style={{ transform: `rotate(${rotateDeg}deg)` }}
    >
      <span
        aria-hidden
        className="absolute -top-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full shadow"
        style={{ background: "radial-gradient(circle at 35% 30%, #e6cd94, #8a7644)" }}
      />
      <div
        className="flex aspect-square items-center justify-center overflow-hidden"
        style={{ background: photo.url ? undefined : "linear-gradient(155deg, #1c2550, #0a0f26 65%)" }}
      >
        {photo.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt={photo.caption ?? "Anı fotoğrafı"} className="h-full w-full object-cover" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="#c9a86a" strokeWidth="1.3" className="w-8 opacity-60">
            <path d="M4 16l4.5-6 3.5 4 2.5-3L20 16" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8" cy="8" r="1.6" />
            <rect x="3" y="4" width="18" height="16" rx="1.4" />
          </svg>
        )}
      </div>
      {photo.caption && (
        <p className="mt-1.5 text-center font-display text-[11px] italic text-ink">{photo.caption}</p>
      )}
    </div>
  );
}
