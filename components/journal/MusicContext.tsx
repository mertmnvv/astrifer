"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";

interface MusicContextValue {
  hasTrack: boolean;
  playing: boolean;
  play: () => void;
  toggle: () => void;
}

const MusicContext = createContext<MusicContextValue | null>(null);

export interface MusicProviderProps {
  src: string | null;
  children: React.ReactNode;
}

/**
 * Owns the single <audio> element for a page's background track. The open
 * gate calls play() (a real click handler, satisfying autoplay policy);
 * MusicToggle elsewhere on the page reads the same playing state and can
 * pause/resume it — two controls, one audio element.
 */
export function MusicProvider({ src, children }: MusicProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const value = useMemo<MusicContextValue>(
    () => ({
      hasTrack: Boolean(src),
      playing,
      play: () => {
        if (!audioRef.current) return;
        void audioRef.current.play();
        setPlaying(true);
      },
      toggle: () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) {
          audio.pause();
        } else {
          void audio.play();
        }
        setPlaying(!playing);
      },
    }),
    [src, playing],
  );

  return (
    <MusicContext.Provider value={value}>
      {src && <audio ref={audioRef} src={src} loop preload="none" />}
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic(): MusicContextValue {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
