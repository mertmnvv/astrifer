"use client";

import { useRef, useState } from "react";

export interface MusicToggleProps {
  src: string;
}

export function MusicToggle({ src }: MusicToggleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      void audio.play();
    }
    setPlaying(!playing);
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        className="inline-flex items-center gap-2 rounded-full border border-brass-dim/60 px-4 py-2 font-mono text-xs uppercase tracking-widest text-brass transition-colors hover:bg-brass-dim/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
      >
        <span aria-hidden>{playing ? "❙❙" : "▶"}</span>
        {playing ? "Müziği durdur" : "Müziği çal"}
      </button>
    </>
  );
}
