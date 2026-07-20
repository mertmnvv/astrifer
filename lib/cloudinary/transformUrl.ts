/**
 * Injects a Cloudinary transform segment (width cap + automatic
 * format/quality) into an already-uploaded `secure_url` so the browser
 * downloads a size appropriate to where it's displayed instead of the
 * original upload — a phone photo can be several MB at full resolution,
 * which is wasted bandwidth/decode cost for a thumbnail on mobile.
 * Non-Cloudinary URLs (e.g. seed/demo data) are returned unchanged.
 */
export function cloudinaryTransform(url: string, widthPx: number): string {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/w_${widthPx},q_auto,f_auto,c_limit/`);
}
