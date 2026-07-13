import type { ReactNode } from "react";

export interface NightPageShellProps {
  children: ReactNode;
  className?: string;
  /** Fixed pixel size for the print render; omit for a responsive live-preview aspect box. */
  widthPx?: number;
  heightPx?: number;
  /** Drives data-print-ready for the Puppeteer print route — omit on live-preview usages. */
  printReady?: boolean;
}

/**
 * Common "Modern Gece + Altın" page chrome shared by every journal page:
 * dark navy-black ground and the thin gold-foil edge stripe (top+bottom,
 * per the physical spec) every page in the book carries.
 */
export function NightPageShell({ children, className, widthPx, heightPx, printReady }: NightPageShellProps) {
  const isFixedSize = widthPx !== undefined && heightPx !== undefined;
  return (
    <div
      data-print-ready={printReady !== undefined ? (printReady ? "true" : "false") : undefined}
      className={`relative overflow-hidden bg-[#05060d] ${isFixedSize ? "" : "aspect-[3/4] w-full"} ${className ?? ""}`}
      style={isFixedSize ? { width: widthPx, height: heightPx } : undefined}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.4%]"
        style={{ background: "linear-gradient(90deg,#a9832f,#fff3cf,#e8c974,#fff3cf,#a9832f)" }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[1.4%]"
        style={{ background: "linear-gradient(90deg,#a9832f,#fff3cf,#e8c974,#fff3cf,#a9832f)" }}
      />
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}
