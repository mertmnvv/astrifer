"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogoMark } from "@/components/LogoMark";

export interface NavLink {
  href: string;
  label: string;
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A crosshair (+) that rotates 45° into a close mark (×) — the same two
 * perpendicular strokes as the spinning LogoMark next to it, just static
 * and interactive instead of animated. Ties the trigger to the brand mark
 * rather than reading as a generic hamburger icon.
 */
function MenuGlyph({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" width={16} height={16} viewBox="0 0 16 16" fill="none">
      <g
        className="origin-center transition-transform duration-300 ease-out"
        style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
      >
        <line x1="8" y1="1" x2="8" y2="15" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
        <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
      </g>
    </svg>
  );
}

/**
 * Left-side sliding panel for the mobile/tablet nav — shares `links` with
 * the desktop bar so there is one list to update. Trigger and panel both
 * use the site's shared glass-card language (hairline `border-text/10`,
 * translucent surface) rather than a boxed hamburger button.
 */
export function MobileNav({ links }: { links: NavLink[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const openButton = openButtonRef.current;
    const panel = panelRef.current;
    const focusables = panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    focusables?.[0]?.focus();

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      (previouslyFocused ?? openButton)?.focus();
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={openButtonRef}
        type="button"
        aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center text-text/70 transition-colors hover:text-amber sm:hidden"
      >
        <MenuGlyph open={isOpen} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-void/70 backdrop-blur-sm sm:hidden"
              aria-hidden="true"
            />
            <motion.div
              key="panel"
              id={panelId}
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menü"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-[78vw] max-w-xs flex-col border-r border-text/10 bg-void/95 px-6 py-5 shadow-2xl shadow-black/50 backdrop-blur-xl sm:hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <LogoMark size={18} />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Astrifer</span>
                </div>
                <button
                  type="button"
                  aria-label="Menüyü kapat"
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center text-text/60 transition-colors hover:text-amber"
                >
                  <MenuGlyph open />
                </button>
              </div>

              <nav className="mt-8 flex flex-col">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`border-b border-text/10 py-4 font-display text-lg transition-colors first:pt-0 ${
                        isActive ? "text-amber" : "text-text/90 hover:text-amber"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <Link
                href="/create"
                onClick={() => setIsOpen(false)}
                className="mt-auto rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-5 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-ink transition-opacity hover:opacity-90"
              >
                Oluştur
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
