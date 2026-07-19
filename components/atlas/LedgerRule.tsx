export interface LedgerRuleProps {
  className?: string;
  ruleClassName?: string;
  accentClassName?: string;
}

/** Hairline divider with a small centered mark. */
export function LedgerRule({ className, ruleClassName = "border-text/10", accentClassName = "text-amber" }: LedgerRuleProps) {
  return (
    <div className={`relative flex items-center ${className ?? ""}`} aria-hidden>
      <div className={`h-px flex-1 border-t ${ruleClassName}`} />
      <span className={`mx-3 text-[10px] ${accentClassName}`}>✦</span>
      <div className={`h-px flex-1 border-t ${ruleClassName}`} />
    </div>
  );
}
