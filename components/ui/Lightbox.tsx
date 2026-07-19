"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface LightboxProps {
  url: string | null;
  caption?: string;
  onClose: () => void;
}

export function Lightbox({ url, caption, onClose }: LightboxProps) {
  // Close on Escape key press
  useEffect(() => {
    if (!url) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [url, onClose]);

  return (
    <AnimatePresence>
      {url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 md:p-8 bg-black/75 backdrop-blur-md cursor-zoom-out"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            type="button"
            className="absolute top-4 right-4 md:top-6 md:right-6 rounded-full bg-white/10 p-2 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Container */}
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-sm sm:max-w-md w-full max-h-[70vh] overflow-hidden rounded-lg shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={caption ?? "Büyütülmüş fotoğraf"}
              className="max-w-full max-h-[62vh] object-contain rounded-lg"
            />
            {caption && (
              <div className="w-full bg-neutral-900/90 border-t border-white/5 py-3 px-4 text-center">
                <p className="font-display italic text-xs md:text-sm text-white/90">
                  {caption}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
