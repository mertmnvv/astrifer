export interface LedgerEntryProps {
  number: string;
  title: string;
  description: string;
  tone?: "ink" | "parchment";
  /** Suppresses the connecting line below this entry — pass true on the last item of a list. */
  isLast?: boolean;
  className?: string;
}

/** Numbered ledger/timeline row — the vertical-list replacement for the old boxed-card grid. */
export function LedgerEntry({ number, title, description, tone = "ink", isLast, className }: LedgerEntryProps) {
  const titleColor = tone === "ink" ? "text-ink" : "text-parchment";
  const descColor = tone === "ink" ? "text-ink/70" : "text-parchment/70";
  const lineColor = tone === "ink" ? "bg-ink/15" : "bg-brass-dim/25";

  return (
    <div className={`relative flex gap-5 pb-10 ${className ?? ""}`}>
      <div className="flex flex-col items-center">
        <span className="font-mono text-xs font-bold tracking-wider text-brass">{number}</span>
        {!isLast && <span className={`mt-2 w-px flex-1 ${lineColor}`} aria-hidden />}
      </div>
      <div className="flex-1">
        <h3 className={`font-display text-xl italic ${titleColor}`}>{title}</h3>
        <p className={`mt-2 text-sm leading-relaxed ${descColor}`}>{description}</p>
      </div>
    </div>
  );
}
