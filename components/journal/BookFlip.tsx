"use client";

import { useCallback, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { useJournalTheme } from "./JournalThemeContext";

export interface BookFlipProps {
  pages: React.ReactNode[];
  onPageChange?: (index: number) => void;
  className?: string;
}

/** Physical page ratio matches every page component's own `aspect-[3/4]` fallback layout — see NightPageShell. */
const PAGE_WIDTH = 450;
const PAGE_HEIGHT = 600;

/**
 * Real page-turn physics via `react-pageflip` (the `page-flip` engine) —
 * corner-drag, paper curl and dynamic shadow come from the library itself
 * rather than a hand-rolled CSS approximation. `showCover` treats the first
 * and last children (cover / back-cover) as single, hard-bound pages that
 * open like a real book cover; everything else flips as a soft leaf.
 */
export function BookFlip({ pages, onPageChange, className = "" }: BookFlipProps) {
  const theme = useJournalTheme();
  // react-pageflip ships no TS types for the underlying page-flip engine, so
  // its ref/event payloads are typed `any` upstream — kept local to this file.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flipBookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = pages.length;

  const handleFlip = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      const page = Number(e.data);
      setCurrentPage(page);
      onPageChange?.(page);
    },
    [onPageChange],
  );

  const goPrev = () => flipBookRef.current?.pageFlip()?.flipPrev();
  const goNext = () => flipBookRef.current?.pageFlip()?.flipNext();

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: `linear-gradient(to right, ${theme.leather.gradientStops.join(", ")})`,
          border: `1px solid ${theme.accentMetal}33`,
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1px ${theme.accentMetal}1a`,
        }}
      >
        <HTMLFlipBook
          ref={flipBookRef}
          width={PAGE_WIDTH}
          height={PAGE_HEIGHT}
          size="stretch"
          minWidth={220}
          maxWidth={1000}
          minHeight={293}
          maxHeight={1333}
          startPage={0}
          drawShadow
          maxShadowOpacity={0.55}
          flippingTime={650}
          showCover
          usePortrait
          startZIndex={10}
          autoSize
          mobileScrollSupport={false}
          swipeDistance={20}
          showPageCorners
          disableFlipByClick={false}
          clickEventForward
          useMouseEvents
          className="mx-auto"
          style={{}}
          onFlip={handleFlip}
        >
          {pages.map((page, index) => (
            <div
              key={index}
              className="page bg-void"
              data-density={index === 0 || index === totalPages - 1 ? "hard" : undefined}
            >
              {page}
            </div>
          ))}
        </HTMLFlipBook>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-6 mt-6">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentPage === 0}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-text/10 bg-text/[0.04] text-text hover:border-amber/50 hover:text-amber disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Önceki Sayfa"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="font-mono text-[10px] uppercase tracking-widest text-dim">
          {currentPage === 0 ? "Kapak — köşesinden çevirin" : `Sayfa ${currentPage} / ${totalPages - 1}`}
        </span>

        <button
          type="button"
          onClick={goNext}
          disabled={currentPage >= totalPages - 1}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-text/10 bg-text/[0.04] text-text hover:border-amber/50 hover:text-amber disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Sonraki Sayfa"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
