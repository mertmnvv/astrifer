import { BUILTIN_PLACES, type PlaceResult } from "./cities";

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

export function searchBuiltinPlaces(query: string, limit = 8): PlaceResult[] {
  const needle = normalize(query.trim());
  if (!needle) return [];

  return BUILTIN_PLACES.map((place) => {
    const haystack = normalize(`${place.name} ${place.country}`);
    const nameHaystack = normalize(place.name);
    let score = -1;
    if (nameHaystack.startsWith(needle)) score = 2;
    else if (haystack.includes(needle)) score = 1;
    return { place, score };
  })
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.place);
}
