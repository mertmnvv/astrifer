import QRCode from "qrcode";

// Deliberately NOT `"server-only"` — this helper must also run inside a
// browser (live preview) and inside Puppeteer's page context (print
// render), which is exactly a browser too.

export interface QrCodeOptions {
  url: string;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

/**
 * Generates a real, scannable QR code as raw `<svg>...</svg>` markup —
 * resolution-independent, so one generated string renders crisply at any
 * print size. Never decorative/fake: the payload always encodes a real
 * order's digital page URL.
 */
export async function generateQrSvg(options: QrCodeOptions): Promise<string> {
  return QRCode.toString(options.url, {
    type: "svg",
    margin: options.margin ?? 1,
    color: {
      dark: options.darkColor ?? "#0a0a12",
      light: options.lightColor ?? "#00000000",
    },
  });
}
