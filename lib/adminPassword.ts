import "server-only";
import { timingSafeEqual } from "node:crypto";

/**
 * Node-only — never import this from middleware.ts (Edge runtime can't
 * bundle node:crypto). Session verification lives in lib/adminAuth.ts instead.
 */
export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD tanımlı değil — .env.local dosyasını kontrol et.");
  }

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  // Uzunluklar farklıysa timingSafeEqual atar; boyutu eşitleyip false döndürüyoruz.
  if (a.length !== b.length) {
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}
