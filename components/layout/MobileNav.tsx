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
 * Two asymmetric horizontal strokes — deliberately NOT star/crosshair-shaped
 * (that mark is already the logo right next to this button) and NOT a
 * generic three-line hamburger. Collapses into a single short dash when
 * open, echoing the panel's own thin gold rule.
 */
function MenuGlyph({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" width={18} height={14} viewBox="0 0 18 14" fill="none">
      <line
        x1="1"
        y1="2"
        x2="17"
        y2="2"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        className="origin-left transition-all duration-300"
        style={open ? { transform: "translateY(5px) scaleX(0.55)" } : undefined}
      />
      <line
        x1="1"
        y1="12"
        x2="11"
        y2="12"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        className="origin-left transition-all duration-300"
        style={open ? { transform: "translateY(-5px) scaleX(1.5)" } : undefined}
      />
    </svg>
  );
}

/**
 * Left-side sliding panel for the mobile/tablet nav — shares `links` with
 * the desktop bar so there is one list to update. Triggered by the thin-line
 * star mark (brand-consistent) rather than a generic three-line hamburger.
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
        className="flex h-9 w-9 items-center justify-center rounded-full border border-text/15 text-text/80 transition-colors hover:border-amber/50 hover:text-amber sm:hidden"
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
              className="fixed inset-y-0 left-0 z-50 flex w-[78vw] max-w-xs flex-col border-r border-amber/20 bg-panel px-6 py-5 sm:hidden"
            >
              <div className="flex items-center gap-2.5">
                <LogoMark size={18} />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Astrifer</span>
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
