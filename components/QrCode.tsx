"use client";

import { useEffect, useState } from "react";
import { generateQrSvg } from "@/lib/qrcode";

export interface QrCodeProps {
  url: string;
  sizePx: number;
  darkColor?: string;
  lightColor?: string;
  className?: string;
}

/**
 * Renders a real, scannable QR code pointing at `url`. Runs the same
 * generateQrSvg() code path in the live browser preview and inside the
 * headless-Chromium print render, so both surfaces always match.
 */
export function QrCode({ url, sizePx, darkColor, lightColor, className }: QrCodeProps) {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    generateQrSvg({ url, darkColor, lightColor }).then((markup) => {
      if (!cancelled) setSvg(markup);
    });
    return () => {
      cancelled = true;
    };
  }, [url, darkColor, lightColor]);

  return (
    <div
      className={className}
      style={{ width: sizePx, height: sizePx }}
      data-qr-ready={svg ? "true" : "false"}
      // Safe: `svg` is always our own generateQrSvg() output, never user input.
      dangerouslySetInnerHTML={{ __html: svg ?? "" }}
    />
  );
}
