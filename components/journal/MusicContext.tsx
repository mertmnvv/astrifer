/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createContext, useContext, useMemo, useRef, useState, useEffect, useCallback } from "react";

interface MusicContextValue {
  hasTrack: boolean;
  playing: boolean;
  play: () => void;
  toggle: () => void;
  getFrequencies: () => Uint8Array;
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

export function MusicProvider({ src, children }: MusicProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);

  // Web Audio refs for visualization
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const simulatedDataRef = useRef<Uint8Array>(new Uint8Array(32));

  const ytVideoId = useMemo(() => getYoutubeId(src), [src]);
  const isYoutube = Boolean(ytVideoId);

  const setupAudioContext = useCallback(() => {
    if (isYoutube || !audioRef.current || audioContextRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64; // 32 frequency bins

      // Enable CORS for analysis of hosted Cloudinary URLs
      audioRef.current.crossOrigin = "anonymous";

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (e) {
      console.warn("Web Audio Analyser setup failed:", e);
    }
  }, [isYoutube]);

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

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        try {
          void audioContextRef.current.close();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, []);

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
          setupAudioContext();
          if (audioContextRef.current && audioContextRef.current.state === "suspended") {
            void audioContextRef.current.resume();
          }
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
          setupAudioContext();
          if (audioContextRef.current && audioContextRef.current.state === "suspended") {
            void audioContextRef.current.resume();
          }
          if (playing) {
            audio.pause();
          } else {
            void audio.play();
          }
          setPlaying(!playing);
        }
      },
      getFrequencies: () => {
        if (!playing) {
          return new Uint8Array(32);
        }
        if (isYoutube || !analyserRef.current) {
          // Generate procedural sine-wave frequency spikes when YouTube is playing
          const time = Date.now() * 0.001;
          for (let i = 0; i < 32; i++) {
            const val = Math.sin(time * 5 + i * 0.3) * 60 + Math.sin(time * 11 - i * 0.7) * 40 + 110;
            simulatedDataRef.current[i] = Math.max(0, Math.min(255, val + Math.random() * 25));
          }
          return simulatedDataRef.current;
        } else {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          return dataArray;
        }
      }
    }),
    [src, playing, isYoutube, setupAudioContext],
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
