"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useJournalTheme } from "./JournalThemeContext";

export interface BookFlipProps {
  pages: React.ReactNode[];
  onPageChange?: (index: number) => void;
  className?: string;
}

export function BookFlip({ pages, onPageChange, className = "" }: BookFlipProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next
  const [isAnimating, setIsAnimating] = useState(false);
  const theme = useJournalTheme();

  // Notify parent of active page
  useEffect(() => {
    onPageChange?.(currentPage);
  }, [currentPage, onPageChange]);

  const totalPages = pages.length;

  const handleNext = () => {
    if (isAnimating) return;
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

    if (isDesktop) {
      if (currentPage === 0) {
        setDirection(1);
        setIsAnimating(true);
        setCurrentPage(1);
      } else if (currentPage < totalPages - 1) {
        const currentLeft = currentPage % 2 === 1 ? currentPage : currentPage - 1;
        const nextLeft = currentLeft + 2;
        const maxLeft = totalPages % 2 === 0 ? totalPages - 1 : totalPages - 2;
        if (nextLeft <= maxLeft) {
          setDirection(1);
          setIsAnimating(true);
          setCurrentPage(nextLeft);
        }
      }
    } else {
      if (currentPage < totalPages - 1) {
        setDirection(1);
        setIsAnimating(true);
        setCurrentPage(currentPage + 1);
      }
    }
  };

  const handlePrev = () => {
    if (isAnimating) return;
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;

    if (isDesktop) {
      if (currentPage > 0) {
        if (currentPage <= 2) {
          setDirection(-1);
          setIsAnimating(true);
          setCurrentPage(0);
        } else {
          const currentLeft = currentPage % 2 === 1 ? currentPage : currentPage - 1;
          setDirection(-1);
          setIsAnimating(true);
          setCurrentPage(Math.max(1, currentLeft - 2));
        }
      }
    } else {
      if (currentPage > 0) {
        setDirection(-1);
        setIsAnimating(true);
        setCurrentPage(currentPage - 1);
      }
    }
  };

  // Determine pages to show on desktop double-page spread
  // spreadIndex:
  // 0 -> [null, page 0] (Cover)
  // 1 -> [page 1, page 2]
  // 2 -> [page 3, page 4]
  // ...
  // Last spread -> [page N-1, null] or [page N-1, page N]

  // Let's compute which pages are currently visible
  let leftPageIdx: number | null = null;
  let rightPageIdx: number | null = null;

  if (currentPage === 0) {
    // Cover page is always on the right side of the spread
    rightPageIdx = 0;
  } else {
    // For odd pages, it's the left page of a spread
    if (currentPage % 2 === 1) {
      leftPageIdx = currentPage;
      rightPageIdx = currentPage + 1 < totalPages ? currentPage + 1 : null;
    } else {
      leftPageIdx = currentPage - 1;
      rightPageIdx = currentPage;
    }
  }

  // Animation variants for page transition
  const pageVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Book Container */}
      <div className="relative flex w-full max-w-4xl aspect-[1.5/1] md:aspect-[1.5/1] items-center justify-center px-4">
        
        {/* Leather Hardback Backing - creates the physical book border */}
        <div 
          className="absolute inset-0 rounded-2xl shadow-2xl transition-all duration-300"
          style={{
            background: `linear-gradient(to right, ${theme.leather.gradientStops.join(", ")})`,
            border: `1px solid ${theme.accentMetal}33`,
            padding: "8px 12px 12px 12px",
            boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1px ${theme.accentMetal}1a`,
          }}
        />

        {/* Dynamic Pages Area */}
        <div className="relative w-full h-full overflow-hidden rounded-lg flex bg-void/40">
          
          {/* Desktop Spread Layout (Side-by-side) */}
          <div className="hidden md:flex w-full h-full">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentPage}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                onAnimationComplete={() => setIsAnimating(false)}
                className="absolute inset-0 w-full h-full flex"
              >
                {/* Left Page Column */}
                <div className="w-1/2 h-full bg-[#0d122b]/5 relative overflow-hidden flex items-center justify-center border-r border-black/30">
                  {leftPageIdx !== null ? (
                    <div className="w-full h-full relative flex items-center justify-center">
                      {pages[leftPageIdx]}
                      {/* Left Crease Shadow */}
                      <div className="pointer-events-none absolute right-0 inset-y-0 w-8 bg-gradient-to-r from-transparent to-black/35 shadow-[inset_-8px_0_12px_-8px_rgba(0,0,0,0.5)]" />
                    </div>
                  ) : (
                    // Inside Cover Leather Texture for empty left page
                    <div 
                      className="w-full h-full opacity-60"
                      style={{
                        background: `linear-gradient(to right, ${theme.leather.gradientStops.join(", ")})`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20" />
                    </div>
                  )}
                </div>

                {/* Right Page Column */}
                <div className="w-1/2 h-full bg-[#0d122b]/5 relative overflow-hidden flex items-center justify-center">
                  {rightPageIdx !== null ? (
                    <div className="w-full h-full relative flex items-center justify-center">
                      {pages[rightPageIdx]}
                      {/* Right Crease Shadow */}
                      <div className="pointer-events-none absolute left-0 inset-y-0 w-8 bg-gradient-to-l from-transparent to-black/35 shadow-[inset_8px_0_12px_-8px_rgba(0,0,0,0.5)]" />
                    </div>
                  ) : (
                    // Inside Cover Leather Texture for empty right page
                    <div 
                      className="w-full h-full opacity-60"
                      style={{
                        background: `linear-gradient(to right, ${theme.leather.gradientStops.join(", ")})`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-l from-black/50 via-transparent to-black/20" />
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile Single Page Layout */}
          <div className="flex md:hidden w-full h-full">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentPage}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                onAnimationComplete={() => setIsAnimating(false)}
                className="absolute inset-0 w-full h-full flex items-center justify-center"
              >
                {pages[currentPage]}
                <div className="pointer-events-none absolute left-0 inset-y-0 w-6 bg-gradient-to-r from-black/20 to-transparent" />
                <div className="pointer-events-none absolute right-0 inset-y-0 w-6 bg-gradient-to-l from-black/20 to-transparent" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Golden Center spine ribbon/line overlay */}
          <div 
            className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 pointer-events-none hidden md:block"
            style={{
              background: `linear-gradient(to bottom, rgba(0,0,0,0.5), ${theme.accentMetal}80, rgba(0,0,0,0.5))`
            }}
          />
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-6 mt-6">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage === 0 || isAnimating}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-text/10 bg-text/[0.04] text-text hover:border-amber/50 hover:text-amber disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Önceki Sayfa"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="font-mono text-[10px] uppercase tracking-widest text-dim">
          Sayfa {currentPage === 0 ? "Kapak" : `${currentPage} / ${totalPages - 1}`}
        </span>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage >= totalPages - 1 || isAnimating}
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
