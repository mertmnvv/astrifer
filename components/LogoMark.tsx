const BRASS = "#c9a86a";

export interface LogoMarkProps {
  /** Rendered width and height in px (the mark is square). */
  size?: number;
  className?: string;
}

/**
 * Icon-only Astrifer symbol: the orbit ellipse + center star + a lit point
 * on the orbit, without the wordmark. For contexts too small to render
 * legible text — compact thumbnails, favicons, app icons.
 */
export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <svg
      role="img"
      aria-label="Astrifer"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
    >
      <ellipse
        cx="50"
        cy="50"
        rx="36"
        ry="22"
        fill="none"
        stroke={BRASS}
        strokeWidth="4"
        opacity="0.65"
        transform="rotate(-12 50 50)"
      />
      <circle cx="50" cy="50" r="6" fill={BRASS} />
      <g transform="rotate(-12 50 50) translate(82.63 40.70)" stroke={BRASS} strokeWidth="2.4" strokeLinecap="round">
        <line x1="-7" y1="0" x2="7" y2="0" />
        <line x1="0" y1="-7" x2="0" y2="7" />
        <circle cx="0" cy="0" r="2.2" fill={BRASS} stroke="none" />
      </g>
    </svg>
  );
}
