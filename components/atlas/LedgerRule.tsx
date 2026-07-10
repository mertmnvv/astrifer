export interface LedgerRuleProps {
  tone?: "ink" | "parchment";
  className?: string;
}

/** Hairline divider with a small centered brass mark — replaces the old glass-card borders. */
export function LedgerRule({ tone = "ink", className }: LedgerRuleProps) {
  const lineColor = tone === "ink" ? "border-ink/15" : "border-brass-dim/30";

  return (
    <div className={`relative flex items-center ${className ?? ""}`} aria-hidden>
      <div className={`h-px flex-1 border-t ${lineColor}`} />
      <span className="mx-3 text-[10px] text-brass">✦</span>
      <div className={`h-px flex-1 border-t ${lineColor}`} />
    </div>
  );
}
