"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LogoMark } from "@/components/LogoMark";
import { MusicProvider, useMusic } from "./MusicContext";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

function GateButton({ title, subtitle, onOpen }: { title: string; subtitle: string; onOpen: () => void }) {
  const music = useMusic();

  return (
    <button
      type="button"
      autoFocus
      onClick={() => {
        music.play();
        onOpen();
      }}
      aria-label="Aç"
      className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_50%_40%,#15101a_0%,#0b0810_70%)] px-6 text-center"
    >
      <LogoMark size={46} variant="compass" />
      <p className="mt-1 font-display text-2xl italic text-bright sm:text-3xl">{title}</p>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber">{subtitle}</p>
      <span className="mt-2 animate-bounce-y font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted motion-reduce:animate-none">
        Zaman Kapsülünü Aç
      </span>
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
 * Full-viewport aperture standing in as the "Aç" gesture in front of the
 * rest of the page. Opening it is the one real user gesture that lets the
 * shared background track start (browsers block unprompted autoplay).
 * `children` is always mounted underneath — nothing extra to fetch or
 * animate in once the gate lifts, it's just uncovered.
 */
export function PageGate({ title, subtitle, musicUrl, children }: PageGateProps) {
  const [opened, setOpened] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

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
      <div className={`fixed inset-0 z-50 ${opened ? "pointer-events-none" : ""}`}>
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={
            reducedMotion
              ? { opacity: opened ? 0 : 1 }
              : { clipPath: opened ? "circle(0% at 50% 50%)" : "circle(76% at 50% 50%)" }
          }
          transition={{ duration: 1.15, ease: [0.65, 0, 0.35, 1] }}
        >
          <GateButton title={title} subtitle={subtitle} onOpen={() => setOpened(true)} />
        </motion.div>
      </div>
      <div ref={contentRef} aria-hidden={!opened}>
        {children}
      </div>
    </MusicProvider>
  );
}
