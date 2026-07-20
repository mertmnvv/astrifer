import { cloudinaryTransform } from "@/lib/cloudinary/transformUrl";
import type { StarMapPhoto } from "@/lib/starmaps";

export interface PhotoSlotProps {
  photo: StarMapPhoto;
  rotateDeg: number;
  isPreviewMode?: boolean;
  onImageClick?: (url: string, caption: string) => void;
}

export function PhotoSlot({ photo, rotateDeg, isPreviewMode = false, onImageClick }: PhotoSlotProps) {
  return (
    <div
      className="relative overflow-hidden bg-[#fdfaf1] p-1.5 pb-4 shadow-lg shadow-black/40"
      style={{ transform: `rotate(${rotateDeg}deg)` }}
    >
      <span
        aria-hidden
        className="absolute -top-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full shadow"
        style={{ background: "radial-gradient(circle at 35% 30%, #f2c67e, #e0a35c)" }}
      />
      <div
        className="flex items-center justify-center overflow-hidden"
        style={{
          background: photo.url
            ? undefined
            : "repeating-linear-gradient(135deg, rgba(230,184,119,0.13), rgba(230,184,119,0.13) 7px, rgba(230,184,119,0.05) 7px, rgba(230,184,119,0.05) 14px)",
        }}
      >
        {photo.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cloudinaryTransform(photo.url, 500)}
            alt={photo.caption ?? "Anı fotoğrafı"}
            className="h-auto w-full object-contain cursor-zoom-in hover:opacity-95 transition-opacity"
            onClick={() => onImageClick?.(photo.url!, photo.caption ?? "")}
          />
        ) : (
          <div className="aspect-square w-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#e6b877" strokeWidth="1.3" className="w-8 opacity-60">
              <path d="M4 16l4.5-6 3.5 4 2.5-3L20 16" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8" cy="8" r="1.6" />
              <rect x="3" y="4" width="18" height="16" rx="1.4" />
            </svg>
          </div>
        )}
      </div>
      {isPreviewMode && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10">
          <div className="bg-amber/95 text-ink font-mono text-[8.5px] font-bold uppercase tracking-[0.2em] py-0.5 px-8 rotate-[15deg] shadow-sm border-y border-ink/10">
            Önizleme
          </div>
        </div>
      )}
      {photo.caption && (
        <p className="mt-1.5 text-center font-display text-[11px] italic text-ink">{photo.caption}</p>
      )}
    </div>
  );
}
