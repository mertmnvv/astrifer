export interface HomeSectionHeadingProps {
  eyebrow: string;
  title: string;
  align?: "left" | "center";
  className?: string;
}

/** Aurora-theme eyebrow + gradient italic h2, used only across the homepage sections. */
export function HomeSectionHeading({ eyebrow, title, align = "center", className }: HomeSectionHeadingProps) {
  const alignClass = align === "center" ? "mx-auto max-w-xl text-center" : "text-left";

  return (
    <div className={`${alignClass} ${className ?? ""}`}>
      <p className="font-mono text-[9.5px] font-medium uppercase tracking-[0.38em] text-iris-light">{eyebrow}</p>
      <h2 className="mt-4 font-display text-2xl font-light italic text-text sm:text-3xl">
        <span className="bg-gradient-to-r from-iris-light via-text to-flare-light bg-clip-text text-transparent">
          {title}
        </span>
      </h2>
    </div>
  );
}
