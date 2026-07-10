"use client";

import { useRef, useState } from "react";

const BAR_HEIGHTS = [40, 70, 100, 55, 85, 45, 90, 60];

export interface VoiceNoteProps {
  url: string;
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/** Playback panel for a one-off voice message — distinct from the looping background track (see MusicToggle). */
export function VoiceNote({ url }: VoiceNoteProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

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
    <div className="flex items-center gap-4 rounded-2xl border border-text/10 bg-text/[0.035] px-5 py-4">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        preload="metadata"
      />
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Sesli mesajı durdur" : "Sesli mesajı dinle"}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-light to-amber-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#1a1206" aria-hidden>
            <rect x="5" y="4" width="5" height="16" rx="1" />
            <rect x="14" y="4" width="5" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#1a1206" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div aria-hidden className="flex h-[26px] flex-1 items-center gap-[3px]">
        {BAR_HEIGHTS.map((height, index) => (
          <span
            key={index}
            className={`flex-1 rounded-sm bg-amber motion-reduce:animate-none ${playing ? "animate-voice-bar" : ""}`}
            style={{ height: `${height}%`, animationDelay: `${index * 90}ms` }}
          />
        ))}
      </div>
      <span className="shrink-0 font-mono text-[10px] text-dim">{formatDuration(duration)}</span>
    </div>
  );
}
