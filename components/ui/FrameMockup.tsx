import type { ReactNode } from "react";
import type { FrameOption } from "@/lib/pricing";

interface FrameStyle {
  background: string;
  padding: string;
  radius: string;
  /** Inner white mat between the frame and the art, e.g. black-wood-white-mat. */
  matPadding?: string;
}

const FRAME_STYLES: Record<FrameOption, FrameStyle | null> = {
  frameless: null,
  "black-wood-white-mat": {
    background: "linear-gradient(135deg, #1c1a18, #0d0c0b)",
    padding: "4.5%",
    radius: "4px",
    matPadding: "5%",
  },
  "thin-black-metal": { background: "#141416", padding: "1.6%", radius: "2px" },
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

  const framed = (
    <div style={{ background: style.background, padding: style.padding, borderRadius: style.radius }}>
      {style.matPadding ? <div style={{ background: "#f4f2ec", padding: style.matPadding }}>{children}</div> : children}
    </div>
  );

  return <div className={`shadow-2xl shadow-black/50 ${className ?? ""}`}>{framed}</div>;
}
