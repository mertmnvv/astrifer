import type { CSSProperties } from "react";

const AMBER = "#e6b877";

export interface LogoMarkProps {
  /** Rendered width and height in px (the mark is square). */
  size?: number;
  /** `crosshair` (2 lines, faster spin) for header/footer/compact use; `compass` (adds two diagonals, slower spin) for the larger book-cover/gate faces. */
  variant?: "crosshair" | "compass";
  className?: string;
  style?: CSSProperties;
}

/**
 * Icon-only Hatırname symbol: a slowly-rotating crosshair/compass, without the
 * wordmark. For contexts too small (or too busy) for legible text —
 * favicons, book-cover faces, tiny thumbnails.
 */
export function LogoMark({ size = 20, variant = "crosshair", className, style }: LogoMarkProps) {
  const isCompass = variant === "compass";

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={AMBER}
      strokeWidth={isCompass ? 1.2 : 1.8}
      strokeLinecap="round"
      className={className}
      style={style}
    >
      <g
        className={isCompass ? "animate-logo-spin-slow motion-reduce:animate-none" : "animate-logo-spin motion-reduce:animate-none"}
        style={{ transformOrigin: "12px 12px" }}
      >
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        {isCompass && (
          <>
            <line x1="5" y1="5" x2="19" y2="19" opacity="0.45" />
            <line x1="19" y1="5" x2="5" y2="19" opacity="0.45" />
          </>
        )}
      </g>
    </svg>
  );
}
