"use client";

import { useState } from "react";

interface ShareButtonProps {
  slug: string;
  className?: string;
}

const siteUrl =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://astrifer.com";

/**
 * Web Share API button — opens native share dialog on mobile,
 * copies URL to clipboard on desktop as fallback.
 */
export function ShareButton({ slug, className }: ShareButtonProps) {
  const [done, setDone] = useState(false);
  const pageUrl = `${siteUrl}/s/${slug}`;

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Astrifer — Dijital Sayfa",
          text: "Seninle bu anı paylaşmak istedim ✨",
          url: pageUrl,
        });
      } catch {
        // User cancelled — no-op
      }
    } else {
      try {
        await navigator.clipboard.writeText(pageUrl);
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-6 py-3 font-mono text-xs uppercase tracking-widest text-ink shadow-[0_6px_24px_-6px_rgba(230,163,92,0.5)] transition-opacity hover:opacity-90 ${className ?? ""}`}
    >
      {done ? (
        <>
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2}>
            <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Kopyalandı
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
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
  );
}
