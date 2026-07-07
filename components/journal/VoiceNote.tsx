"use client";

import { useRef, useState } from "react";

const BAR_HEIGHTS = [40, 70, 100, 55, 85, 45, 90, 60];

export interface VoiceNoteProps {
  url: string;
}

/** Playback panel for a one-off voice message — distinct from the looping background track (see MusicToggle). */
export function VoiceNote({ url }: VoiceNoteProps) {
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
    <div className="relative rounded-md bg-parchment px-8 py-9 shadow-2xl shadow-black/50">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-brass-dim via-brass to-brass-dim" />
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-brass-dim via-brass to-brass-dim" />
      <p className="text-center font-mono text-[10px] uppercase tracking-[0.26em] text-leather-lt opacity-85">
        Sesli Mesaj
      </p>
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} preload="none" />
      <div className="mt-5 flex flex-col items-center gap-4">
        <div aria-hidden className="flex h-10 items-end gap-1">
          {BAR_HEIGHTS.map((height, index) => (
            <span
              key={index}
              className={`w-1 rounded-full bg-leather-lt motion-reduce:animate-none ${
                playing ? "animate-voice-bar" : ""
              }`}
              style={{ height: `${height}%`, animationDelay: `${index * 90}ms` }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-pressed={playing}
          className="inline-flex items-center gap-2 rounded-full border border-leather-lt/50 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-leather-lt transition-colors hover:bg-leather-lt/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leather-lt"
        >
          <span aria-hidden>{playing ? "❙❙" : "▶"}</span>
          {playing ? "Durdur" : "Dinle"}
        </button>
      </div>
    </div>
  );
}
