"use client";

import { useMusic } from "@/components/journal/MusicContext";

/** Pause/resume control for the page's shared background track (see MusicProvider). Renders nothing if there's no track. */
export function MusicToggle() {
  const { hasTrack, playing, toggle } = useMusic();
  if (!hasTrack) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      className="inline-flex items-center gap-2 rounded-full border border-amber/30 px-4 py-1.5 font-mono text-[9.5px] uppercase tracking-widest text-amber transition-colors hover:bg-amber/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
    >
      <span aria-hidden>{playing ? "❙❙" : "▶"}</span>
      {playing ? "Müziği durdur" : "Müziği çal"}
    </button>
  );
}
