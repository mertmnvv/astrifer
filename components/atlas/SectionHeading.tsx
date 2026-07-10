export interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  align?: "left" | "center";
  tone?: "ink" | "parchment";
  className?: string;
}

/** Shared eyebrow + italic h2 block used at the top of every atlas-register section. */
export function SectionHeading({ eyebrow, title, align = "center", tone = "ink", className }: SectionHeadingProps) {
  const alignClass = align === "center" ? "mx-auto max-w-xl text-center" : "text-left";
  const eyebrowColor = tone === "ink" ? "text-leather-lt" : "text-brass-dim";
  const titleColor = tone === "ink" ? "text-ink" : "text-parchment";

  return (
    <div className={`${alignClass} ${className ?? ""}`}>
      <p className={`font-mono text-[10px] uppercase tracking-[0.35em] ${eyebrowColor}`}>{eyebrow}</p>
      <h2 className={`mt-4 font-display text-3xl italic sm:text-4xl ${titleColor}`}>{title}</h2>
    </div>
  );
}
