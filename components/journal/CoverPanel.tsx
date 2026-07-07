"use client";

import { useEffect, useRef } from "react";
import { Logo } from "@/components/Logo";
import { drawLeatherTexture } from "./drawLeatherTexture";

export interface CoverPanelProps {
  title?: string;
  subtitle?: string;
  className?: string;
  /** Fills its container's actual width/height instead of forcing a square aspect ratio — used by the fullscreen open gate. */
  fullscreen?: boolean;
  /** Tiny decorative use (e.g. a checkout thumbnail) — shrinks the logo and omits title/subtitle text, which wouldn't fit legibly anyway. */
  compact?: boolean;
  children?: React.ReactNode;
}

export function CoverPanel({ title, subtitle, className, fullscreen, compact, children }: CoverPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Static texture, but every resize (including ResizeObserver's
    // guaranteed first callback) clears the canvas bitmap, so redraw each
    // time — same lesson learned from the astrolab StarChart component.
    const draw = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawLeatherTexture(ctx, width, height);
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-md shadow-2xl shadow-black/60 ${
        fullscreen ? "h-full w-full" : "aspect-square"
      } ${className ?? ""}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center text-center ${
          compact ? "gap-0 px-1" : "gap-3 px-6"
        }`}
      >
        <Logo size={fullscreen ? 190 : compact ? 32 : 150} />
        {!compact && title && (
          <p className={`mt-1 font-display italic text-parchment ${fullscreen ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"}`}>
            {title}
          </p>
        )}
        {!compact && subtitle && (
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brass/80">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  );
}
