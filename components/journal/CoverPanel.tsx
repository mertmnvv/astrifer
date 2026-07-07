"use client";

import { useEffect, useRef } from "react";
import { Logo } from "@/components/Logo";
import { drawLeatherTexture } from "./drawLeatherTexture";

export interface CoverPanelProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function CoverPanel({ title, subtitle, className }: CoverPanelProps) {
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
      const size = container.clientWidth;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawLeatherTexture(ctx, size);
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative aspect-square overflow-hidden rounded-md shadow-2xl shadow-black/60 ${className ?? ""}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
        <Logo size={150} />
        {title && (
          <p className="mt-1 font-display text-lg italic text-parchment sm:text-xl">{title}</p>
        )}
        {subtitle && (
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brass/80">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
