import { LogoMark } from "@/components/LogoMark";
import { LogoWordmark } from "@/components/LogoWordmark";

export interface LogoProps {
  /** Wordmark font size in px; the accent icon scales with it. */
  size?: number;
  className?: string;
}

/**
 * Full lockup: the gradient "Astrifer" wordmark with the rotating crosshair
 * accent sitting on its shoulder, top-right. Used in header/footer. For
 * cover/gate faces (share-page gate, journal cover), use `LogoMark
 * variant="compass"` alone instead — those already carry their own title.
 */
export function Logo({ size = 27, className }: LogoProps) {
  const iconSize = Math.round(size * 0.48);

  return (
    <span
      role="img"
      aria-label="Astrifer"
      className={`relative inline-block leading-none ${className ?? ""}`}
    >
      <LogoWordmark size={size} />
      <LogoMark
        size={iconSize}
        variant="crosshair"
        className="absolute"
        style={{ top: size * -0.18, right: size * -0.42 }}
      />
    </span>
  );
}
