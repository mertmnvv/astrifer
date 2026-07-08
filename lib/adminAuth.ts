import "server-only";

const COOKIE_NAME = "astrifer_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET tanımlı değil — .env.local dosyasını kontrol et.");
  }
  return secret;
}

async function sign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Buffer.from(signature).toString("base64url");
}

/** Şifre doğruysa `admin_session` cookie'sine yazılacak imzalı token'ı üretir. */
export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

/** Middleware ve server component'lerin cookie değerini doğrulamak için kullandığı fonksiyon. */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expectedSignature = await sign(payload);
  return signature === expectedSignature;
}

export { COOKIE_NAME as ADMIN_SESSION_COOKIE };
