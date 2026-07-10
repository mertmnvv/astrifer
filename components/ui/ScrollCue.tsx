"use client";

import { useEffect, useState } from "react";

/** Bouncing "scroll for more" chevron; fades out once the visitor starts scrolling. */
export function ScrollCue() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 40) setDismissed(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      className={`mt-6 flex justify-center transition-opacity duration-500 ${dismissed ? "opacity-0" : "opacity-100"}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="animate-bounce-y text-dim motion-reduce:animate-none"
      >
        <path d="M4 9l8 8 8-8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
