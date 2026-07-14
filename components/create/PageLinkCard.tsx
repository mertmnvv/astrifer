"use client";

import { useState } from "react";

export interface PageLinkCardProps {
  host: string;
  slug: string;
  className?: string;
}

/**
 * "Sayfanın Linki" preview card in the /create wizard's live preview — the
 * slug is highlighted like an engraved plate on the otherwise dim URL, with
 * a one-tap copy button instead of the old plain break-all text line.
 */
export function PageLinkCard({ host, slug, className }: PageLinkCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`https://${host}/s/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable (older browser / permission denied) —
      // the address is still fully visible below for a manual copy.
    }
  }

  return (
    <div className={`rounded-xl border border-amber/25 bg-amber/[0.05] px-4 py-3 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-dim">Kalıcı Adresin</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Linki kopyala"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber/30 text-amber transition-colors hover:bg-amber/10"
        >
          {copied ? (
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2}>
              <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.4}>
              <rect x="5.75" y="5.75" width="7.25" height="7.25" rx="1.25" />
              <path d="M4.25 10.25H3.5a1 1 0 01-1-1V3.5a1 1 0 011-1H9a1 1 0 011 1v.75" />
            </svg>
          )}
        </button>
      </div>
      <p className="mt-1.5 break-all font-mono text-[11px] leading-relaxed text-muted">
        {host}/s/<span className="font-semibold text-amber">{slug}</span>
      </p>
    </div>
  );
}
