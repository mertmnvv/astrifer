export interface LedgerEntryProps {
  number: string;
  title: string;
  description: string;
  /** Suppresses the connecting line below this entry — pass true on the last item of a list. */
  isLast?: boolean;
  className?: string;
}

/** Numbered ledger/timeline row — used for step-by-step and concept lists. */
export function LedgerEntry({ number, title, description, isLast, className }: LedgerEntryProps) {
  return (
    <div className={`relative flex gap-5 pb-10 ${className ?? ""}`}>
      <div className="flex flex-col items-center">
        <span className="font-mono text-[10px] font-medium tracking-widest text-amber">{number}</span>
        {!isLast && <span className="mt-2 w-px flex-1 bg-text/10" aria-hidden />}
      </div>
      <div className="flex-1">
        <h3 className="font-display text-lg italic text-text">{title}</h3>
        <p className="mt-2 text-xs leading-relaxed text-muted">{description}</p>
      </div>
    </div>
  );
}
