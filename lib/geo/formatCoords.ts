/** Formats a lat/lon pair as e.g. "41.01°K 28.98°D" — used on both the poster text band and CreateForm's live preview. */
export function formatCoords(latitude: number, longitude: number): string {
  const lat = `${Math.abs(latitude).toFixed(2)}°${latitude >= 0 ? "K" : "G"}`;
  const lon = `${Math.abs(longitude).toFixed(2)}°${longitude >= 0 ? "D" : "B"}`;
  return `${lat}   ${lon}`;
}
