"use client";

import { useEffect, useRef, useState } from "react";
import { CoverPanel } from "./CoverPanel";
import { MusicProvider, useMusic } from "./MusicContext";

function OpenButton({ onOpen }: { onOpen: () => void }) {
  const music = useMusic();

  return (
    <button
      type="button"
      autoFocus
      onClick={() => {
        music.play();
        onOpen();
      }}
      className="mt-4 rounded-full border border-brass px-8 py-3 font-mono text-xs uppercase tracking-[0.3em] text-brass transition-colors hover:bg-brass hover:text-void focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text"
    >
      Aç
    </button>
  );
}

export interface PageGateProps {
  title: string;
  subtitle: string;
  musicUrl: string | null;
  children: React.ReactNode;
}

/**
 * Full-viewport leather cover with an "Aç" button standing in front of the
 * rest of the page. Opening it is the one real user gesture that lets the
 * shared background track start (browsers block unprompted autoplay), and
 * doubles as a ceremonial "open the gift" moment. `children` is always
 * mounted underneath — nothing extra to fetch or animate in once the gate
 * lifts, it's just uncovered.
 */
export function PageGate({ title, subtitle, musicUrl, children }: PageGateProps) {
  const [opened, setOpened] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Set/clear the `inert` DOM attribute imperatively: React's JSX prop for
  // it doesn't reliably reach the DOM through SSR + hydration in this React
  // version, so bypass that layer entirely.
  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    if (opened) {
      node.removeAttribute("inert");
    } else {
      node.setAttribute("inert", "");
    }
  }, [opened]);

  return (
    <MusicProvider src={musicUrl}>
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-700 ${
          opened ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <CoverPanel fullscreen title={title} subtitle={subtitle}>
          <OpenButton onOpen={() => setOpened(true)} />
        </CoverPanel>
      </div>
      <div ref={contentRef} aria-hidden={!opened}>
        {children}
      </div>
    </MusicProvider>
  );
}
