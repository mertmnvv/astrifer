"use client";

import { useEffect, useRef } from "react";
import { drawPaperTexture } from "./drawPaperTexture";
import { drawLeatherTexture } from "@/components/journal/drawLeatherTexture";

export type AtlasTone = "parchment" | "parchment-dim" | "leather" | "ink";

const TONE_CLASSES: Record<AtlasTone, string> = {
  parchment: "bg-parchment text-ink border-ink/15",
  "parchment-dim": "bg-parchment-dim text-ink border-ink/15",
  leather: "bg-leather text-parchment border-brass-dim/30",
  ink: "bg-ink text-parchment border-brass-dim/20",
};

const PADDING_CLASSES = {
  none: "",
  md: "p-6 sm:p-8",
  lg: "p-7 sm:p-10",
} as const;

export interface AtlasPanelProps {
  tone: AtlasTone;
  /** Mounts a canvas texture (paper grain for light tones, leather grain for dark tones) behind the content. Reserve for a few showcase moments — not every panel needs a canvas mounted. */
  textured?: boolean;
  padding?: keyof typeof PADDING_CLASSES;
  className?: string;
  children?: React.ReactNode;
}

/** Shared "printed plate / ledger page" panel — the flat, hairline-bordered replacement for the old backdrop-blur glass card. */
export function AtlasPanel({ tone, textured, padding = "md", className, children }: AtlasPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDark = tone === "leather" || tone === "ink";

  useEffect(() => {
    if (!textured) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (isDark) {
        drawLeatherTexture(ctx, width, height);
      } else {
        drawPaperTexture(ctx, width, height);
      }
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(container);
    return () => observer.disconnect();
  }, [textured, isDark]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-sm border shadow-xl shadow-black/20 ${TONE_CLASSES[tone]} ${
        textured ? "" : PADDING_CLASSES[padding]
      } ${className ?? ""}`}
    >
      {textured && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />}
      <div className={`relative ${textured ? PADDING_CLASSES[padding] : ""}`}>{children}</div>
    </div>
  );
}
