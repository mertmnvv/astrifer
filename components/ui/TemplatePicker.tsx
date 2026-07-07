"use client";

import type { TemplateOption } from "@/lib/templates";

export interface TemplatePickerProps {
  templates: TemplateOption[];
  value: string;
  onChange: (slug: string) => void;
  name: string;
}

export function TemplatePicker({ templates, value, onChange, name }: TemplatePickerProps) {
  return (
    <div role="radiogroup" aria-label="Şablon" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {templates.map((template) => {
        const checked = value === template.slug;
        return (
          <label
            key={template.slug}
            className={`cursor-pointer rounded-lg border px-3 py-3 text-center transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brass ${
              checked
                ? "border-brass bg-brass-dim/20"
                : "border-brass-dim/40 bg-panel-navy hover:border-brass-dim"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={template.slug}
              checked={checked}
              onChange={() => onChange(template.slug)}
              className="sr-only"
            />
            <span className="block font-display text-base italic text-text">{template.name}</span>
            <span className="mt-0.5 block text-[11px] leading-snug text-haze">{template.description}</span>
          </label>
        );
      })}
    </div>
  );
}
