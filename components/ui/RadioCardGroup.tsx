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
  /** Text alignment within each card; defaults to centered. */
  align?: "left" | "center";
}

export function RadioCardGroup<Value extends string>({
  options,
  value,
  onChange,
  name,
  ariaLabel,
  columnsClassName,
  align = "center",
}: RadioCardGroupProps<Value>) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={`grid gap-2.5 ${columnsClassName ?? "grid-cols-2 sm:grid-cols-3"}`}>
      {options.map((option) => {
        const checked = value === option.value;
        return (
          <label
            key={option.value}
            className={`cursor-pointer rounded-lg border px-3 py-3 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-amber ${
              align === "left" ? "text-left" : "text-center"
            } ${checked ? "border-amber/60 bg-amber/10" : "border-text/10 bg-text/[0.03] hover:border-text/25"}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <span className="block font-display text-base italic text-text">{option.label}</span>
            {option.description && (
              <span className="mt-0.5 block text-[11px] leading-snug text-muted">{option.description}</span>
            )}
          </label>
        );
      })}
    </div>
  );
}
