const BRASS = "#c9a86a";

export interface LogoProps {
  /** Rendered width in px; height follows the viewBox aspect ratio. */
  size?: number;
  className?: string;
}

/**
 * Minimal wordmark: "Astrifer" wrapped by a thin tilted orbit line, with a
 * single sparkle sitting on the orbit — the same signature motif as the
 * astrolab chart, distilled to its simplest form for cover/header use.
 */
export function Logo({ size = 160, className }: LogoProps) {
  const height = size * (100 / 260);

  return (
    <svg
      role="img"
      aria-label="Astrifer"
      width={size}
      height={height}
      viewBox="0 0 260 100"
      className={className}
    >
      <ellipse
        cx="130"
        cy="52"
        rx="112"
        ry="24"
        fill="none"
        stroke={BRASS}
        strokeWidth="1"
        opacity="0.55"
        transform="rotate(-5 130 52)"
      />
      <text
        x="130"
        y="59"
        textAnchor="middle"
        fill={BRASS}
        style={{
          fontFamily: "var(--font-display), serif",
          fontStyle: "italic",
          fontWeight: 600,
          letterSpacing: "0.4px",
        }}
        fontSize="34"
      >
        Astrifer
      </text>
      {/* Sparkle sits exactly on the orbit ellipse's boundary (t=-20°), like a lit point on the path. */}
      <g transform="rotate(-5 130 52) translate(235.25 43.79)" stroke={BRASS} strokeWidth="0.9" strokeLinecap="round">
        <line x1="-4.5" y1="0" x2="4.5" y2="0" />
        <line x1="0" y1="-4.5" x2="0" y2="4.5" />
        <circle cx="0" cy="0" r="1.1" fill={BRASS} stroke="none" />
      </g>
    </svg>
  );
}
