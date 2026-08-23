"use client";

import { useState } from "react";
import { getYoutubeId } from "@/lib/youtube";

interface BackgroundMusicProps {
  url: string;
  onPlayingChange?: (playing: boolean) => void;
}

export function BackgroundMusic({ url, onPlayingChange }: BackgroundMusicProps) {
  const videoId = getYoutubeId(url);
  const [playing, setPlaying] = useState(true);
  const [instance, setInstance] = useState(0);

  if (!videoId) return null;

  const start = () => {
    setInstance((value) => value + 1);
    setPlaying(true);
    onPlayingChange?.(true);
  };

  const stop = () => {
    setPlaying(false);
    onPlayingChange?.(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] sm:bottom-6 sm:right-6">
      {playing && (
        <iframe
          key={instance}
          className="pointer-events-none absolute h-px w-px opacity-0"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&rel=0`}
          title="Sayfanın müziği"
          allow="autoplay; encrypted-media"
        />
      )}
      <div className="flex items-center gap-3 border border-[#5eead4]/35 bg-[#020711]/90 px-3 py-2 text-white shadow-2xl backdrop-blur-xl sm:px-4">
        <span className={`grid h-8 w-8 place-items-center rounded-full border border-[#5eead4]/30 ${playing ? "bg-[#5eead4]/15" : "bg-white/5"}`} aria-hidden>
          <span className={`h-2 w-2 rounded-full bg-[#5eead4] ${playing ? "animate-pulse shadow-[0_0_12px_#5eead4]" : "opacity-50"}`} />
        </span>
        <div className="hidden sm:block">
          <p className="archive-kicker text-[#5eead4]">Bu anın müziği</p>
          <p className="mt-0.5 text-[10px] text-[#9fb4ca]">{playing ? "Otomatik oynatılıyor" : "Müzik durduruldu"}</p>
        </div>
        <button
          type="button"
          onClick={() => playing ? stop() : start()}
          className="min-h-8 border-l border-white/10 pl-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white transition hover:text-[#5eead4]"
        >
          {playing ? "Durdur" : "Başlat"}
        </button>
      </div>
    </div>
  );
}
