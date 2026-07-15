"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PhotoPicker, type PickedPhoto } from "@/components/ui/PhotoPicker";
import { addTimelineEntryAction } from "@/app/s/actions";

export interface AddEntryFormProps {
  slug: string;
  onDone: () => void;
  initialNote?: string;
}

function todayDateInputValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
}

export function AddEntryForm({ slug, onDone, initialNote }: AddEntryFormProps) {
  const router = useRouter();
  const [date, setDate] = useState(todayDateInputValue());
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [note, setNote] = useState(initialNote ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialNote) {
      setNote(initialNote);
    }
  }, [initialNote]);

  const uploadsPending = photos.some((photo) => photo.status === "uploading");
  const photoUrls = photos.filter((photo) => photo.status === "done" && photo.url).map((photo) => photo.url as string);
  const isValid = Boolean(date) && photoUrls.length > 0 && !uploadsPending;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await addTimelineEntryAction({
        slug,
        dateIso: new Date(date).toISOString(),
        photoUrls,
        note: note.trim() || null,
      });
      router.refresh();
      onDone();
    } catch {
      setError("An eklenemedi — lütfen tekrar dene.");
      setIsSubmitting(false);
    }
  };

  return (
    <form
      id="add-entry-form"
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-2xl border border-amber/20 bg-void/60 p-4"
    >
      <div>
        <label htmlFor="entry-date" className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-dim">
          Tarih
        </label>
        <input
          id="entry-date"
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="w-full rounded-md border border-text/[0.14] bg-text/[0.04] px-2.5 py-1.5 text-xs text-text [color-scheme:dark]"
        />
      </div>

      <PhotoPicker photos={photos} onChange={setPhotos} max={4} />

      <div>
        <label htmlFor="entry-note" className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-dim">
          Kısa not (ops.)
        </label>
        <textarea
          id="entry-note"
          rows={2}
          maxLength={160}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="w-full resize-none rounded-md border border-text/[0.14] bg-text/[0.04] px-2.5 py-1.5 text-xs text-text"
        />
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-ink transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {isSubmitting ? "Ekleniyor…" : "Anı Ekle"}
      </button>
    </form>
  );
}
