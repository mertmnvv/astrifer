"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { PlaceResult } from "@/lib/geocode/cities";
import { searchBuiltinPlaces } from "@/lib/geocode/search";

export interface PlaceComboboxProps {
  label: string;
  placeholder?: string;
  value: PlaceResult | null;
  onChange: (place: PlaceResult) => void;
  required?: boolean;
  /** Visual register: "dark" (default, night/void panels) or "light" (parchment panels). */
  tone?: "dark" | "light";
}

function dedupe(places: PlaceResult[]): PlaceResult[] {
  const seen = new Set<string>();
  const out: PlaceResult[] = [];
  for (const place of places) {
    const key = `${place.name.toLowerCase()}|${place.latitude.toFixed(1)}|${place.longitude.toFixed(1)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(place);
  }
  return out;
}

export function PlaceCombobox({ label, placeholder, value, onChange, required, tone = "dark" }: PlaceComboboxProps) {
  const inputId = useId();
  const isLight = tone === "light";
  const listboxId = useId();
  const [query, setQuery] = useState(value?.name ?? "");
  const [apiResults, setApiResults] = useState<PlaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const localResults = useMemo(() => searchBuiltinPlaces(query), [query]);
  const results = useMemo(() => dedupe([...localResults, ...apiResults]).slice(0, 8), [localResults, apiResults]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setApiResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
        .then((response) => (response.ok ? response.json() : { results: [] }))
        .then((data: { results: PlaceResult[] }) => setApiResults(data.results ?? []))
        .catch(() => setApiResults([]));
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectPlace = (place: PlaceResult) => {
    onChange(place);
    setQuery(place.name);
    setOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!open || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const chosen = results[activeIndex] ?? (results.length === 1 ? results[0] : undefined);
      if (chosen) selectPlace(chosen);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor={inputId}
        className={`mb-1.5 block font-mono text-xs uppercase tracking-widest ${isLight ? "text-leather-lt" : "text-haze"}`}
      >
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        required={required}
        autoComplete="off"
        value={query}
        placeholder={placeholder ?? "Şehir ara..."}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className={`w-full rounded-md border px-3 py-2.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass ${
          isLight
            ? "border-ink/25 bg-parchment-dim text-ink placeholder:text-ink/40"
            : "border-brass-dim/60 bg-panel-navy text-text placeholder:text-haze/60"
        }`}
      />
      {value && query === value.name ? (
        <p className={`mt-1 font-mono text-[11px] ${isLight ? "text-ink/60" : "text-haze/80"}`}>
          {value.latitude.toFixed(2)}°, {value.longitude.toFixed(2)}° · {value.timezone}
        </p>
      ) : null}
      {open && results.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className={`absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border shadow-xl ${
            isLight ? "border-ink/25 bg-parchment-dim" : "border-brass-dim/60 bg-panel-navy"
          }`}
        >
          {results.map((place, index) => (
            <li
              key={`${place.name}-${place.latitude}-${place.longitude}`}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => {
                event.preventDefault();
                selectPlace(place);
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={`cursor-pointer px-3 py-2 text-sm ${
                index === activeIndex
                  ? isLight
                    ? "bg-brass-dim/20 text-ink"
                    : "bg-brass-dim/30 text-text"
                  : isLight
                    ? "text-ink/70"
                    : "text-haze"
              }`}
            >
              {place.name}
              <span className={isLight ? "text-ink/50" : "text-haze/70"}>
                {place.country ? `, ${place.country}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
