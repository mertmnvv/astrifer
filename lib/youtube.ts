/** Bir YouTube URL'sinden veya doğrudan video kimliğinden video kimliğini çıkarır. */
export function getYoutubeId(url: string | null): string | null {
  if (!url) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;

  const match = url.match(
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i,
  );

  return match ? match[1] : null;
}
