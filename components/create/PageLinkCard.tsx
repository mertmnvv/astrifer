"use client";

import { useState } from "react";
import Link from "next/link";

export interface PageLinkCardProps {
  host: string;
  slug: string;
  className?: string;
}

/**
 * "Sayfanın Linki" preview card — slug highlighted like an engraved plate on
 * the dim URL, copy button for quick access, and a Web Share API "Paylaş"
 * button (native share dialog on mobile, clipboard fallback on desktop).
 */
export function PageLinkCard({ host, slug, className }: PageLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const pageUrl = `https://${host}/s/${slug}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable — address is still visible below.
    }
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Astrifer — Dijital Sayfa",
          text: "Seninle bu anı paylaşmak istedim ✨",
          url: pageUrl,
        });
      } catch {
        // User cancelled or share failed — silently ignore.
      }
    } else {
      // Fallback: copy to clipboard on desktop
      try {
        await navigator.clipboard.writeText(pageUrl);
        setShared(true);
        setTimeout(() => setShared(false), 1800);
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div className={`rounded-xl border border-iris-light/25 bg-iris-light/[0.05] px-4 py-3 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-dim">
          Kalıcı Adresin
        </span>
        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Linki kopyala"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-iris-light/30 text-iris-light transition-colors hover:bg-iris-light/10"
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
        {host}/s/<span className="font-semibold text-iris-light">{slug}</span>
      </p>

      {/* Action buttons row */}
      <div className="mt-3 flex gap-2">
        {/* View button */}
        <Link
          href={`/s/${slug}`}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-iris-light/30 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-iris-light transition-colors hover:bg-iris-light/10"
        >
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
            <path fillRule="evenodd" d="M.664 9.576a1.002 1.002 0 010-.152 9.61 9.61 0 0118.672 0 1.002 1.002 0 010 .152 9.61 9.61 0 01-18.672 0zM10 14a4 4 0 100-8 4 4 0 000 8z" clipRule="evenodd" />
          </svg>
          Görüntüle
        </Link>

        {/* Share button */}
        <button
          type="button"
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-br from-iris to-flare px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-white transition-opacity hover:opacity-90"
        >
          {shared ? (
            <>
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Kopyalandı
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Paylaş
            </>
          )}
        </button>
      </div>
    </div>
  );
}
