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
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytPlayerReadyRef = useRef(false);
  const wantsPlayRef = useRef(false);
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

    // Capture the wrapper node for this effect run so the cleanup below
    // always references the exact node it mounted into, regardless of
    // whether the ref itself has since changed.
    const container = ytContainerRef.current;

    // New video/track: any pending play request or readiness from a
    // previous player instance is no longer valid.
    ytPlayerReadyRef.current = false;

    // Load the Iframe Player API code asynchronously
    if (!(window as any).YT || !(window as any).YT.Player) {
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
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
      // Guard against double-init (e.g. React Strict Mode double effect run).
      if (ytPlayerRef.current) return;
      if (!container) return;

      // Create the mount target imperatively, entirely outside React's
      // reconciliation. The YouTube IFrame API replaces this element with
      // its own <iframe> behind React's back; if React itself rendered
      // this node via JSX, React would later try to remove/update a node
      // that YouTube already swapped out, throwing
      // "NotFoundError: Failed to execute 'removeChild' on 'Node'".
      // By only ever letting the wrapper div be React-managed, and
      // creating/destroying the actual mount target by hand, React never
      // has any expectation about that inner node's identity.
      container.innerHTML = "";
      const mountEl = document.createElement("div");
      mountEl.id = "youtube-bg-player";
      container.appendChild(mountEl);

      ytPlayerRef.current = new (window as any).YT.Player(mountEl, {
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
          onReady: () => {
            ytPlayerReadyRef.current = true;
            // If the user already tapped "Aç" before the player finished
            // initializing, honor that request now.
            if (wantsPlayRef.current && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
              try {
                ytPlayerRef.current.playVideo();
                setPlaying(true);
              } catch (e) {
                console.error(e);
              }
            }
          },
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
      ytPlayerReadyRef.current = false;
      wantsPlayRef.current = false;
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === "function") {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying YT Player:", e);
        }
      }
      ytPlayerRef.current = null;
      // Imperative cleanup, independent of React's reconciliation: whatever
      // YouTube left behind inside the wrapper (iframe or otherwise) is
      // removed by hand so React never has to reconcile it.
      if (container) {
        container.innerHTML = "";
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
          wantsPlayRef.current = true;
          if (
            ytPlayerReadyRef.current &&
            ytPlayerRef.current &&
            typeof ytPlayerRef.current.playVideo === "function"
          ) {
            try {
              ytPlayerRef.current.playVideo();
              setPlaying(true);
            } catch (e) {
              console.error(e);
            }
          }
          // If not ready yet, onReady will pick up wantsPlayRef and start
          // playback as soon as the player becomes usable.
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
          if (playing) {
            wantsPlayRef.current = false;
          } else {
            wantsPlayRef.current = true;
          }
          if (ytPlayerReadyRef.current && ytPlayerRef.current) {
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
      {src && isYoutube && <div ref={ytContainerRef} className="hidden pointer-events-none" aria-hidden="true" />}
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
