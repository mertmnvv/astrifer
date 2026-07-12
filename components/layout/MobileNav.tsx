"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export interface NavLink {
  href: string;
  label: string;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Right-side drawer for the mobile/tablet nav — shares `links` with the desktop bar so there is one list to update. */
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
        aria-label="Menü"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen(true)}
        className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] sm:hidden"
      >
        <span className="h-px w-5 bg-text/80" />
        <span className="h-px w-5 bg-text/80" />
        <span className="h-px w-5 bg-text/80" />
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
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="fixed inset-y-0 right-0 z-50 flex w-[78vw] max-w-xs flex-col border-l border-amber/20 bg-panel px-6 py-5 sm:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  Menü
                </span>
                <button
                  type="button"
                  aria-label="Menüyü kapat"
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center text-text/80 transition-colors hover:text-amber"
                >
                  <span aria-hidden="true" className="relative block h-4 w-4">
                    <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
                    <span className="absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
                  </span>
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
