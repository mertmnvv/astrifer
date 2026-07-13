"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface ScaledPreviewProps {
  /** The fixed pixel size `children` is designed/rendered at — usually a print-target size. */
  designWidth: number;
  designHeight: number;
  children: ReactNode;
  className?: string;
}

/**
 * Renders `children` at their real fixed-pixel design size, then scales the
 * whole thing down (via CSS transform, not font-size tricks) to fit
 * whatever width the container actually has. Used for plain-HTML print
 * page previews (e.g. StarKeyPage, EssayPage) whose text sizes are tuned
 * for a ~600-900px page and would otherwise overflow a small İçindekiler
 * grid cell — canvas-based previews (StarMapSpreadPage, NightCoverPage)
 * don't need this since they already redraw at whatever size they're given.
 */
export function ScaledPreview({ designWidth, designHeight, children, className }: ScaledPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / designWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [designWidth]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className ?? ""}`}
      style={{ aspectRatio: `${designWidth} / ${designHeight}` }}
    >
      <div
        style={{
          width: designWidth,
          height: designHeight,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          visibility: scale > 0 ? "visible" : "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
