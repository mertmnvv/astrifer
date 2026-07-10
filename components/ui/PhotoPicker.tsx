"use client";

import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary/uploadFile";

export interface PickedPhoto {
  id: string;
  file?: File;
  caption: string;
  previewUrl: string;
  status: "uploading" | "done" | "error";
  url?: string;
}

export interface PhotoPickerProps {
  photos: PickedPhoto[];
  onChange: Dispatch<SetStateAction<PickedPhoto[]>>;
  max?: number;
  /** Visual register: "dark" (default, night/void panels) or "light" (parchment panels). */
  tone?: "dark" | "light";
}

/**
 * Photo picker: shows an instant local preview via an object URL, then
 * uploads the file to Cloudinary in the background (see
 * lib/cloudinary/uploadFile.ts) and fills in `url`/`status` once that
 * resolves. The configurator waits for `status === "done"` on every photo
 * before letting checkout proceed.
 */
export function PhotoPicker({ photos, onChange, max = 4, tone = "dark" }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isLight = tone === "light";

  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadPhoto = (photo: PickedPhoto) => {
    if (!photo.file) return;
    uploadToCloudinary(photo.file, "astrifer/starmaps/photos")
      .then((url) => {
        onChange((prev) => prev.map((p) => (p.id === photo.id ? { ...p, status: "done", url } : p)));
      })
      .catch(() => {
        onChange((prev) => prev.map((p) => (p.id === photo.id ? { ...p, status: "error" } : p)));
      });
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const room = max - photos.length;
    const incoming = Array.from(fileList).slice(0, Math.max(0, room));
    const added: PickedPhoto[] = incoming.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      caption: "",
      previewUrl: URL.createObjectURL(file),
      status: "uploading",
    }));
    onChange([...photos, ...added]);
    added.forEach(uploadPhoto);
    if (inputRef.current) inputRef.current.value = "";
  };

  const removePhoto = (id: string) => {
    const target = photos.find((photo) => photo.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(photos.filter((photo) => photo.id !== id));
  };

  const updateCaption = (id: string, caption: string) => {
    onChange(photos.map((photo) => (photo.id === id ? { ...photo, caption } : photo)));
  };

  const retryUpload = (photo: PickedPhoto) => {
    onChange((prev) => prev.map((p) => (p.id === photo.id ? { ...p, status: "uploading" } : p)));
    uploadPhoto(photo);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo.id} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.previewUrl}
              alt=""
              className={`aspect-square w-full rounded-md object-cover ${photo.status === "uploading" ? "opacity-50" : ""}`}
            />
            {photo.status === "uploading" && (
              <span
                aria-hidden
                className="absolute inset-0 flex items-center justify-center font-mono text-[9px] uppercase tracking-widest text-brass"
              >
                Yükleniyor…
              </span>
            )}
            {photo.status === "error" && (
              <button
                type="button"
                onClick={() => retryUpload(photo)}
                className="absolute inset-x-0 bottom-6 text-center font-mono text-[9px] uppercase tracking-widest text-red-300 underline"
              >
                Yüklenemedi — tekrar dene
              </button>
            )}
            <button
              type="button"
              onClick={() => removePhoto(photo.id)}
              aria-label="Fotoğrafı kaldır"
              className={`absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-xs text-brass ring-1 ring-brass-dim focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass ${
                isLight ? "bg-ink" : "bg-void"
              }`}
            >
              ×
            </button>
            <input
              type="text"
              value={photo.caption}
              onChange={(event) => updateCaption(photo.id, event.target.value)}
              placeholder="Kısa not (ops.)"
              maxLength={40}
              aria-label="Fotoğraf notu"
              className={`mt-1 w-full rounded border px-2 py-1 text-[11px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass ${
                isLight
                  ? "border-ink/25 bg-parchment-dim text-ink placeholder:text-ink/40"
                  : "border-brass-dim/40 bg-panel-navy text-text placeholder:text-haze/50"
              }`}
            />
          </div>
        ))}
        {photos.length < max && (
          <label
            className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brass ${
              isLight
                ? "border-ink/30 text-ink/60 hover:border-ink/50"
                : "border-brass-dim/50 text-haze hover:border-brass-dim"
            }`}
          >
            <span aria-hidden className="text-2xl leading-none text-brass-dim">
              +
            </span>
            <span className="text-[10px] uppercase tracking-widest">Ekle</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => handleFiles(event.target.files)}
              className="sr-only"
            />
          </label>
        )}
      </div>
      <p className={`mt-2 text-[11px] ${isLight ? "text-ink/50" : "text-haze/70"}`}>
        En fazla {max} fotoğraf — {photos.length}/{max}
      </p>
    </div>
  );
}
