"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

export function MobileNav({
  items,
  logoutAction,
}: {
  items: NavItem[];
  logoutAction: () => void;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <span className="shrink-0 font-mono text-xs uppercase tracking-[0.3em] text-iris-light">Astrifer Admin</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-text/10 text-subtle transition-colors hover:text-bright"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-[57px] z-40 bg-void/70 backdrop-blur-sm"
          />
          <nav className="fixed inset-x-0 top-[57px] z-50 border-t border-text/10 bg-panel px-3 py-4 shadow-2xl">
            <div className="space-y-1">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                      active ? "bg-text/[0.06] text-bright" : "text-subtle hover:bg-text/[0.04] hover:text-bright"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className={`h-4 w-4 shrink-0 transition-colors ${active ? "text-amber" : "text-dim"}`}
                    >
                      {item.icon}
                    </svg>
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-3 border-t border-text/10 pt-3">
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-xs uppercase tracking-wider text-subtle transition-colors hover:bg-text/[0.04] hover:text-rose"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 shrink-0">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18 12H9m9 0-3-3m3 3-3 3"
                    />
                  </svg>
                  Çıkış yap
                </button>
              </form>
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
