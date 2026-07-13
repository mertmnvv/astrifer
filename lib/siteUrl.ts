/** Public site origin — no trailing slash. Falls back to localhost for dev/preview environments. */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
