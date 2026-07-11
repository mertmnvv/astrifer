import "server-only";

// Gates /print/[slug]: that route paints a full, chrome-less, print-resolution
// canvas with no auth wall of its own, so it must never be reachable without
// a token minted by our own render pipeline (see lib/printRender.ts). Reuses
// ADMIN_SESSION_SECRET rather than adding a new env var — same trust boundary
// (server-only secret, never shipped to the client).
const TOKEN_TTL_MS = 60 * 1000;

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

/** Mints a ~60s token scoped to one slug, for the render pipeline to hand to its own headless-browser request. */
export async function createPrintRenderToken(slug: string): Promise<string> {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${slug}.${expiresAt}`;
  const signature = await sign(payload);
  return `${expiresAt}.${signature}`;
}

export async function verifyPrintRenderToken(slug: string, token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expiresAtStr, signature] = token.split(".");
  if (!expiresAtStr || !signature) return false;

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expectedSignature = await sign(`${slug}.${expiresAt}`);
  return signature === expectedSignature;
}
