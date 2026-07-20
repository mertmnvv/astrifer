import Link from "next/link";
import type { ReactNode } from "react";

/** Paylaşılan admin dashboard bileşenleri — tüm /admin sayfaları bunları kullanır. */

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-text/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl italic text-bright">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-subtle">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Card({
  title,
  className = "",
  children,
}: {
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-text/10 bg-panel p-5 shadow-lg ${className}`}>
      {title && (
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-dim border-b border-text/5 pb-2">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

const STAT_TONES = {
  default: "text-bright",
  amber: "text-amber",
  iris: "text-iris-light",
} as const;

export function StatCard({
  label,
  value,
  tone = "default",
  href,
  glow = false,
}: {
  label: string;
  value: ReactNode;
  tone?: keyof typeof STAT_TONES;
  href?: string;
  glow?: boolean;
}) {
  const content = (
    <>
      {glow && (
        <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-amber/5 blur-xl" />
      )}
      <p className="font-mono text-[10px] uppercase tracking-widest text-dim transition-colors group-hover:text-amber">
        {label}
      </p>
      <p className={`mt-2 font-display text-3xl italic ${STAT_TONES[tone]}`}>{value}</p>
    </>
  );

  const baseClass = "group relative overflow-hidden rounded-2xl border border-text/10 bg-panel p-6 shadow-lg";

  if (href) {
    return (
      <Link href={href} className={`${baseClass} transition-all hover:border-amber/40`}>
        {content}
      </Link>
    );
  }

  return <div className={baseClass}>{content}</div>;
}

const BADGE_TONES = {
  neutral: "border-text/15 bg-text/[0.04] text-subtle",
  amber: "border-amber/20 bg-amber/[0.08] text-amber",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  danger: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  iris: "border-iris/30 bg-iris/10 text-iris-light",
} as const;

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof BADGE_TONES;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-text/10 bg-text/[0.01] p-12 text-center">
      <p className="text-sm text-subtle">{children}</p>
    </div>
  );
}

export const FIELD_CLASS =
  "w-full rounded-md border border-text/[0.14] bg-text/[0.04] px-3 py-2 text-sm text-text focus:border-amber/40 focus:outline-none transition-colors";
export const FIELD_LABEL_CLASS = "block font-mono text-[10px] uppercase tracking-widest text-dim";
