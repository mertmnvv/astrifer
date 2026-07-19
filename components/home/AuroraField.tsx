export interface AuroraFieldProps {
  className?: string;
}

/**
 * Ambient drifting nebula blobs (iris/flare/glow) used behind homepage
 * sections to carry the "aurora" background language. Purely decorative.
 */
export function AuroraField({ className }: AuroraFieldProps) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className ?? ""}`}>
      <div className="absolute -left-[10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-iris/20 blur-[110px] animate-aurora-drift" />
      <div className="absolute -right-[8%] top-[20%] h-[380px] w-[380px] rounded-full bg-flare/15 blur-[110px] animate-aurora-drift-slow" />
      <div className="absolute bottom-[-15%] left-[30%] h-[440px] w-[440px] rounded-full bg-glow/15 blur-[120px] animate-aurora-drift" />
    </div>
  );
}
