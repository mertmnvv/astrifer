"use client";

import { useState } from "react";
import { NightCoverPage } from "@/components/journal/night/NightCoverPage";

export interface JournalTiltCoverProps {
  names: string;
  className?: string;
}

/**
 * Physical-product mockup of the journal cover: mouse-tilt perspective,
 * a gilded page-block edge, a bookmark ribbon and a moving light glint —
 * same recipe as the homepage's ProductsTeaser 3D book, extracted so the
 * product page can look like a photographed object, not a flat canvas.
 */
export function JournalTiltCover({ names, className = "" }: JournalTiltCoverProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const maxRotate = 10;
    setTilt({ x: -(y / (rect.height / 2)) * maxRotate, y: (x / (rect.width / 2)) * maxRotate });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div className={`relative select-none ${className}`}>
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovered(true)}
        className="relative mx-auto w-full max-w-[240px] cursor-pointer sm:max-w-[300px] lg:max-w-[320px]"
        style={{ perspective: "1200px" }}
      >
        <div
          className="relative w-full overflow-hidden rounded-r-2xl rounded-l-md shadow-[10px_18px_40px_-8px_rgba(0,0,0,0.7)]"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`,
            transition: isHovered ? "transform 0.05s ease-out" : "transform 0.5s ease-out",
            transformStyle: "preserve-3d",
          }}
        >
          <NightCoverPage names={names} />

          {/* Gilded page-block edge */}
          <div className="pointer-events-none absolute inset-y-[3px] right-0 z-20 w-[5px] rounded-r-sm border-l border-amber/15 bg-gradient-to-r from-[#ffe4be] via-[#e6b877] to-[#8d622a] shadow-md" />

          {/* Silk bookmark ribbon */}
          <div className="pointer-events-none absolute bottom-0 right-6 z-20 h-14 w-2.5 rounded-b-sm border-t border-black/10 bg-gradient-to-b from-amber-deep to-amber/80 shadow-md" />

          {/* Moving light glint */}
          <div
            className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 140px at ${tilt.y * -3 + 150}px ${tilt.x * 3 + 210}px, rgba(251,246,238,0.12) 0%, rgba(251,246,238,0) 80%)`,
              opacity: isHovered ? 1 : 0,
            }}
          />
        </div>

        {/* Contact shadow grounding the book like a photographed object */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-full mt-2 h-5 w-[85%] -translate-x-1/2 rounded-[100%] bg-black/50 blur-lg"
        />
      </div>
    </div>
  );
}
