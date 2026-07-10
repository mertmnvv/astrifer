const PADDING_CLASSES = {
  none: "",
  md: "p-6 sm:p-8",
  lg: "p-7 sm:p-10",
} as const;

export interface AtlasPanelProps {
  padding?: keyof typeof PADDING_CLASSES;
  className?: string;
  children?: React.ReactNode;
}

/** Shared translucent glass panel — the flat, hairline-bordered card used across every section. */
export function AtlasPanel({ padding = "md", className, children }: AtlasPanelProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-text/10 bg-text/[0.035] shadow-xl shadow-black/20 ${PADDING_CLASSES[padding]} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
