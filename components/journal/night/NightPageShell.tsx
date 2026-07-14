"use client";

import type { CSSProperties, ReactNode } from "react";
import { useJournalTheme } from "@/components/journal/JournalThemeContext";

export interface NightPageShellProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Fixed pixel size for the print render; omit for a responsive live-preview aspect box. */
  widthPx?: number;
  heightPx?: number;
  /** Drives data-print-ready for the Puppeteer print route — omit on live-preview usages. */
  printReady?: boolean;
}

/**
 * Common page chrome shared by every journal page: dark ground and the
 * thin foil edge stripe (top+bottom, per the physical spec) every page in
 * the book carries — colored per the active JournalTheme (see
 * journalTheme.ts), not a single fixed "Modern Gece + Altın" look.
 */
export function NightPageShell({ children, className, style, widthPx, heightPx, printReady }: NightPageShellProps) {
  const theme = useJournalTheme();
  const isFixedSize = widthPx !== undefined && heightPx !== undefined;
  return (
    <div
      data-print-ready={printReady !== undefined ? (printReady ? "true" : "false") : undefined}
      className={`relative overflow-hidden ${isFixedSize ? "" : "aspect-[3/4] w-full"} ${className ?? ""}`}
      style={{
        backgroundColor: theme.pageGround,
        ...(isFixedSize ? { width: widthPx, height: heightPx } : {}),
        ...style,
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.4%]" style={{ background: theme.edgeStripeGradient }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.4%]" style={{ background: theme.edgeStripeGradient }} />
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
