export interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  align?: "left" | "center";
  className?: string;
}

/** Shared eyebrow + italic h2 block used at the top of every section. */
export function SectionHeading({ eyebrow, title, align = "center", className }: SectionHeadingProps) {
  const alignClass = align === "center" ? "mx-auto max-w-xl text-center" : "text-left";

  return (
    <div className={`${alignClass} ${className ?? ""}`}>
      <p className="font-mono text-[11px] uppercase tracking-[0.34em] text-amber">{eyebrow}</p>
      <h2 className="mt-4 font-display text-3xl italic text-text sm:text-4xl">{title}</h2>
    </div>
  );
}
