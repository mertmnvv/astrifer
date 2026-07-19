"use client";

import { useEffect, useRef, useState } from "react";
import type { ComputeSkyResult } from "@/lib/astronomy/computeSky";
import { drawStarChart } from "./drawStarChart";
import type { SkyPalette } from "./palettes";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

export interface StarChartProps {
  sky: ComputeSkyResult | null;
  className?: string;
  /** Accessible label describing what the chart depicts, e.g. a place/date summary. */
  label: string;
  /** Name labels next to bright stars/Sun/Moon/planets. Defaults to true; pass false for small decorative previews. */
  showLabels?: boolean;
  /** Color scheme. Defaults to "Gece Mavisi" (see components/astrolab/palettes.ts). */
  palette?: SkyPalette;
  /** Enables dragging and rotation controls. */
  interactive?: boolean;
  /** Overlays a lock icon and preview badge. */
  isPreviewMode?: boolean;
  /** Controls if the spin state is managed externally. */
  isSpinningExternal?: boolean;
  /** Trigger to reset rotation externally. */
  resetTrigger?: number;
  /** Show or hide internal controls. */
  showControls?: boolean;
  /** Event triggered when the spinning state changes. */
  onSpinChange?: (spinning: boolean) => void;
  /** Scales ambient drift speed and twinkle amplitude/frequency for livelier decorative backdrops. Defaults to 1 (unchanged). */
  intensity?: number;
}

export function StarChart({
  sky,
  className,
  label,
  showLabels,
  palette,
  interactive = false,
  isPreviewMode = false,
  isSpinningExternal,
  resetTrigger,
  showControls = true,
  onSpinChange,
  intensity,
}: StarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  const [isSpinningInternal, setIsSpinningInternal] = useState(false);
  const isSpinning = isSpinningExternal !== undefined ? isSpinningExternal : isSpinningInternal;
  const setIsSpinning = (val: boolean) => {
    setIsSpinningInternal(val);
    onSpinChange?.(val);
  };
  const isSpinningRef = useRef(false);
  isSpinningRef.current = isSpinning;

  const manualRotation = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    if (resetTrigger !== undefined && resetTrigger > 0) {
      manualRotation.current = 0;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cssWidth = 0;
    let cssHeight = 0;

    const resize = () => {
      cssWidth = container.clientWidth;
      cssHeight = container.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    let lastTime: number | null = null;
    let rotationTime = 0;

    const draw = (timestampMs: number) => {
      if (lastTime === null) {
        lastTime = timestampMs;
      }
      const dt = (timestampMs - lastTime) / 1000;
      lastTime = timestampMs;

      if (isSpinningRef.current) {
        rotationTime += dt * 15; // Rotate 25x faster
      } else {
        rotationTime += dt;
      }

      drawStarChart(ctx, sky, {
        width: cssWidth,
        height: cssHeight,
        time: rotationTime,
        reducedMotion,
        showLabels,
        palette,
        isPreviewMode,
        manualRotationDeg: manualRotation.current,
        isSpinning: isSpinningRef.current,
        intensity,
      });
    };

    const handleResize = () => {
      resize();
      draw(reducedMotion ? 0 : performance.now());
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    const isLooping = !reducedMotion || isSpinning;

    let loopFrame = 0;
    const loop = (timestampMs: number) => {
      draw(timestampMs);
      loopFrame = requestAnimationFrame(loop);
    };

    if (isLooping) {
      loopFrame = requestAnimationFrame(loop);
    }

    // Drag-to-rotate event listeners
    let isDragging = false;
    let startAngle = 0;
    let baseRotation = 0;

    const getAngle = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left - cssWidth / 2;
      const y = clientY - rect.top - cssHeight / 2;
      return Math.atan2(y, x) * (180 / Math.PI);
    };

    const onStart = (clientX: number, clientY: number) => {
      isDragging = true;
      startAngle = getAngle(clientX, clientY);
      baseRotation = manualRotation.current;
    };

    const onMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const currentAngle = getAngle(clientX, clientY);
      const diff = currentAngle - startAngle;
      manualRotation.current = baseRotation + diff;

      if (!isLooping) {
        draw(performance.now());
      }
    };

    const onEnd = () => {
      isDragging = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      onStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      onMove(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    if (interactive) {
      canvas.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", onEnd);
      canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", onEnd);
    }

    // Stabilize layout on initial page load
    const backupTimeout = setTimeout(handleResize, 200);

    return () => {
      clearTimeout(backupTimeout);
      cancelAnimationFrame(loopFrame);
      observer.disconnect();
      if (interactive) {
        canvas.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", onEnd);
        canvas.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", onEnd);
      }
    };
  }, [sky, reducedMotion, showLabels, palette, interactive, isPreviewMode, isSpinning, resetTrigger, intensity]);

  return (
    <div className={`flex flex-col items-center gap-4 ${className ?? ""}`}>
      <div
        ref={containerRef}
        className="relative w-full flex-1 select-none overflow-hidden"
        role="img"
        aria-label={label}
      >
        <canvas ref={canvasRef} className={interactive ? "cursor-grab active:cursor-grabbing" : ""} />
      </div>
      {interactive && showControls && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSpinning(!isSpinning)}
            className="flex items-center gap-2 rounded-full border border-amber/30 bg-void/60 px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-amber transition-all hover:border-amber hover:bg-amber/10 active:scale-95"
          >
            {isSpinning ? (
              <>
                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                Durdur
              </>
            ) : (
              <>
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Gökyüzünü Döndür
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              manualRotation.current = 0;
              setIsSpinning(false);
            }}
            className="rounded-full bg-amber/[0.06] px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-muted transition-all hover:bg-amber/15 hover:text-bright active:scale-95"
          >
            Sıfırla
          </button>
        </div>
      )}
    </div>
  );
}
