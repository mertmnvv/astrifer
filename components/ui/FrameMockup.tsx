import type { ReactNode } from "react";
import type { FrameOption } from "@/lib/pricing";

const FRAME_STYLES: Record<FrameOption, { background: string; padding: string; radius: string } | null> = {
  none: null,
  black: { background: "linear-gradient(135deg, #1c1a18, #0d0c0b)", padding: "5.5%", radius: "4px" },
  oak: { background: "linear-gradient(135deg, #8a6a42, #5c4225)", padding: "5.5%", radius: "4px" },
};

export interface FrameMockupProps {
  frame: FrameOption;
  children: ReactNode;
  className?: string;
}

/** Simulates a physical picture frame (or a bare, unmounted print) around its children. */
export function FrameMockup({ frame, children, className }: FrameMockupProps) {
  const style = FRAME_STYLES[frame];

  if (!style) {
    return (
      <div
        className={`rounded-[6px] border border-text/10 bg-[#100b14] p-[3%] shadow-2xl shadow-black/50 ${className ?? ""}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`shadow-2xl shadow-black/50 ${className ?? ""}`}
      style={{ background: style.background, padding: style.padding, borderRadius: style.radius }}
    >
      {children}
    </div>
  );
}
