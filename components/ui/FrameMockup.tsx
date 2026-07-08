import type { ReactNode } from "react";
import type { FrameOption } from "@/lib/pricing";

const FRAME_STYLES: Record<FrameOption, { background: string; padding: string } | null> = {
  none: null,
  black: { background: "linear-gradient(155deg, #2b2b2f, #121214 60%, #050506)", padding: "3%" },
  oak: { background: "linear-gradient(155deg, #a9764f, #7a5133 55%, #5c3b23)", padding: "3%" },
};

export interface FrameMockupProps {
  frame: FrameOption;
  children: ReactNode;
  className?: string;
}

export function FrameMockup({ frame, children, className }: FrameMockupProps) {
  const style = FRAME_STYLES[frame];

  if (!style) {
    return (
      <div className={`bg-parchment p-[4%] shadow-2xl shadow-black/50 ${className ?? ""}`}>{children}</div>
    );
  }

  return (
    <div
      className={`shadow-2xl shadow-black/50 ${className ?? ""}`}
      style={{ background: style.background, padding: style.padding }}
    >
      <div className="bg-parchment p-[3%]">{children}</div>
    </div>
  );
}
