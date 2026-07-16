/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useMemo, useRef, useState, useEffect } from "react";

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

export function getYoutubeId(url: string | null): string | null {
  if (!url) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  return match ? match[1] : null;
}

/**
 * Owns the single <audio> element or hidden YouTube iframe player for a page's background track.
 * The open gate calls play() (a real click handler, satisfying autoplay policy);
 * MusicToggle elsewhere on the page reads the same playing state and can
 * pause/resume it — two controls, one media source.
 */
export function MusicProvider({ src, children }: MusicProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);

  const ytVideoId = useMemo(() => getYoutubeId(src), [src]);
  const isYoutube = Boolean(ytVideoId);

  useEffect(() => {
    if (!isYoutube || !ytVideoId) return;

    // Load the Iframe Player API code asynchronously
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Set up global callback for when API is ready
    const previousOnReady = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      if (previousOnReady) previousOnReady();
      initPlayer();
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    }

    function initPlayer() {
      ytPlayerRef.current = new (window as any).YT.Player("youtube-bg-player", {
        height: "0",
        width: "0",
        videoId: ytVideoId,
        playerVars: {
          autoplay: 0,
          loop: 1,
          playlist: ytVideoId,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === 1) { // YT.PlayerState.PLAYING
              setPlaying(true);
            } else if (event.data === 2) { // YT.PlayerState.PAUSED
              setPlaying(false);
            }
          },
        },
      });
    }

    return () => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === "function") {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying YT Player:", e);
        }
      }
    };
  }, [isYoutube, ytVideoId]);

  const value = useMemo<MusicContextValue>(
    () => ({
      hasTrack: Boolean(src),
      playing,
      play: () => {
        if (isYoutube) {
          if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
            try {
              ytPlayerRef.current.playVideo();
              setPlaying(true);
            } catch (e) {
              console.error(e);
            }
          }
        } else {
          if (!audioRef.current) return;
          void audioRef.current.play();
          setPlaying(true);
        }
      },
      toggle: () => {
        if (isYoutube) {
          if (ytPlayerRef.current) {
            try {
              if (playing) {
                ytPlayerRef.current.pauseVideo();
                setPlaying(false);
              } else {
                ytPlayerRef.current.playVideo();
                setPlaying(true);
              }
            } catch (e) {
              console.error(e);
            }
          }
        } else {
          const audio = audioRef.current;
          if (!audio) return;
          if (playing) {
            audio.pause();
          } else {
            void audio.play();
          }
          setPlaying(!playing);
        }
      },
    }),
    [src, playing, isYoutube],
  );

  return (
    <MusicContext.Provider value={value}>
      {src && !isYoutube && <audio ref={audioRef} src={src} loop preload="none" />}
      {src && isYoutube && <div id="youtube-bg-player" className="hidden pointer-events-none" aria-hidden="true" />}
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
