export interface LogoWordmarkProps {
  /** Font size in px. */
  size?: number;
  className?: string;
}

/**
 * The "Astrifer" text mark on its own: Spectral, amber-to-rose gradient fill.
 * No icon — pair with `LogoMark` (see `Logo`) where the rotating accent belongs.
 */
export function LogoWordmark({ size = 27, className }: LogoWordmarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block bg-gradient-to-r from-amber-light to-rose bg-clip-text font-logo font-medium leading-none text-transparent ${className ?? ""}`}
      style={{ fontSize: size, letterSpacing: "0.5px" }}
    >
      Astrifer
    </span>
  );
}
