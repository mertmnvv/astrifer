import "server-only";

// No accounts exist anywhere in this app, so "page owner" is proven by
// possession of this signed, slug-scoped token rather than a DB-backed
// session — same crypto.subtle HMAC approach as lib/printRenderToken.ts.
// A dedicated secret (not ADMIN_SESSION_SECRET) so rotating the admin
// password doesn't silently lock customers out of their own page. Long
// TTL: this needs to keep working for years, not seconds.
const TOKEN_TTL_MS = 10 * 365 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.STARMAP_OWNER_SECRET;
  if (!secret) {
    throw new Error("STARMAP_OWNER_SECRET tanımlı değil — .env.local dosyasını kontrol et.");
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

/** Mints a long-lived token scoped to one slug, handed to the page's creator as their private "manage" link. */
export async function createOwnerToken(slug: string): Promise<string> {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${slug}.${expiresAt}`;
  const signature = await sign(payload);
  return `${expiresAt}.${signature}`;
}

export async function verifyOwnerToken(slug: string, token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expiresAtStr, signature] = token.split(".");
  if (!expiresAtStr || !signature) return false;

  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const expectedSignature = await sign(`${slug}.${expiresAt}`);
  return signature === expectedSignature;
}

/** Cookie set by app/s/[slug]/claim/route.ts once a visitor proves ownership. */
export function ownerCookieName(slug: string): string {
  return `starmap_owner_${slug}`;
}
