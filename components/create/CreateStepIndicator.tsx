"use client";

export interface CreateStep {
  n: number;
  label: string;
}

export interface CreateStepIndicatorProps {
  steps: CreateStep[];
  currentStep: number;
  furthestStep: number;
  onStepClick: (step: number) => void;
}

/**
 * Wizard progress row for /create — numbered pills connected by a rule,
 * reusing the site's iris-accent mono-uppercase numbering language
 * (SectionLabel in CreateForm.tsx, "01".."05") instead of introducing a
 * new visual vocabulary. Only steps <= furthestStep are clickable, so
 * users can revisit but not skip ahead of what they've completed.
 */
export function CreateStepIndicator({ steps, currentStep, furthestStep, onStepClick }: CreateStepIndicatorProps) {
  const activeLabel = steps.find((step) => step.n === currentStep)?.label ?? "";

  return (
    <nav aria-label="Oluşturma adımları" className="mb-2">
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {steps.map((step, index) => {
          const isCurrent = step.n === currentStep;
          const isDone = step.n < currentStep;
          const isReachable = step.n <= furthestStep;
          return (
            <li key={step.n} className="flex flex-1 items-center gap-1.5 sm:gap-2 last:flex-none">
              <button
                type="button"
                onClick={() => isReachable && onStepClick(step.n)}
                disabled={!isReachable}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`${step.n}. adım: ${step.label}`}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] transition-colors ${
                  isCurrent
                    ? "border-iris-light bg-iris-light/10 text-iris-light"
                    : isDone
                      ? "border-iris-light/50 text-iris-light/80 hover:border-iris-light"
                      : "cursor-not-allowed border-text/15 text-dim"
                }`}
              >
                {isDone ? (
                  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M3 8.5l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  step.n
                )}
              </button>
              {index < steps.length - 1 && <div className={`h-px flex-1 ${isDone ? "bg-iris-light/40" : "bg-text/10"}`} />}
            </li>
          );
        })}
      </ol>
      <p className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
        <span className="text-iris-light">{String(currentStep).padStart(2, "0")}</span>
        &nbsp;&nbsp;{activeLabel}
      </p>
    </nav>
  );
}
