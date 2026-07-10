"use client";

export interface RadioCardOption<Value extends string> {
  value: Value;
  label: string;
  description?: string;
}

export interface RadioCardGroupProps<Value extends string> {
  options: RadioCardOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  name: string;
  ariaLabel: string;
  /** Tailwind grid-cols classes; defaults to a 2/3-column responsive grid. */
  columnsClassName?: string;
  /** Visual register: "dark" (default, night/void panels) or "light" (parchment panels). */
  tone?: "dark" | "light";
}

export function RadioCardGroup<Value extends string>({
  options,
  value,
  onChange,
  name,
  ariaLabel,
  columnsClassName,
  tone = "dark",
}: RadioCardGroupProps<Value>) {
  const unchecked =
    tone === "light"
      ? "border-ink/20 bg-parchment-dim hover:border-ink/40"
      : "border-brass-dim/40 bg-panel-navy hover:border-brass-dim";
  const titleColor = tone === "light" ? "text-ink" : "text-text";
  const descColor = tone === "light" ? "text-ink/60" : "text-haze";

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={`grid gap-2.5 ${columnsClassName ?? "grid-cols-2 sm:grid-cols-3"}`}>
      {options.map((option) => {
        const checked = value === option.value;
        return (
          <label
            key={option.value}
            className={`cursor-pointer rounded-lg border px-3 py-3 text-center transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brass ${
              checked ? "border-brass bg-brass-dim/20" : unchecked
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span className={`block font-display text-base italic ${titleColor}`}>{option.label}</span>
            {option.description && (
              <span className={`mt-0.5 block text-[11px] leading-snug ${descColor}`}>{option.description}</span>
            )}
          </label>
        );
      })}
    </div>
  );
}
