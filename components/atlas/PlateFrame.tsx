import { LedgerRule } from "./LedgerRule";

export interface PlateFrameProps {
  /** The (dark) canvas content to mount, e.g. <StarChart />. Sized to fill its aspect-square slot. */
  children: React.ReactNode;
  caption?: string;
  className?: string;
}

/** Mounts a dark StarChart canvas inside a parchment mat, like a photographic plate bound into an atlas page. */
export function PlateFrame({ children, caption, className }: PlateFrameProps) {
  return (
    <div className={`w-full rounded-sm border border-ink/10 bg-parchment-dim p-4 shadow-xl shadow-black/20 sm:p-6 ${className ?? ""}`}>
      <div className="aspect-square w-full overflow-hidden rounded-[2px] bg-void shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] ring-1 ring-ink/40">
        {children}
      </div>
      {caption && (
        <div className="mt-4">
          <LedgerRule tone="ink" />
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-leather-lt">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
}
