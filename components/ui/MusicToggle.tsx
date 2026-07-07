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
      className="inline-flex items-center gap-2 rounded-full border border-brass-dim/60 px-4 py-2 font-mono text-xs uppercase tracking-widest text-brass transition-colors hover:bg-brass-dim/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
    >
      <span aria-hidden>{playing ? "❙❙" : "▶"}</span>
      {playing ? "Müziği durdur" : "Müziği çal"}
    </button>
  );
}
