export interface LedgerRuleProps {
  className?: string;
}

/** Hairline divider with a small centered amber mark. */
export function LedgerRule({ className }: LedgerRuleProps) {
  return (
    <div className={`relative flex items-center ${className ?? ""}`} aria-hidden>
      <div className="h-px flex-1 border-t border-text/10" />
      <span className="mx-3 text-[10px] text-amber">✦</span>
      <div className="h-px flex-1 border-t border-text/10" />
    </div>
  );
}
