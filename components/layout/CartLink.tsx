"use client";

import Link from "next/link";
import { useCart } from "@/lib/useCart";

/** Persistent cart icon + item-count badge, linking to /sepet — visible from every page that renders SiteHeader. */
export function CartLink() {
  const items = useCart();
  const count = items.length;

  return (
    <Link
      href="/sepet"
      aria-label={count > 0 ? `Sepet, ${count} ürün` : "Sepet"}
      className="relative flex h-8 w-8 items-center justify-center text-muted transition-colors hover:text-amber"
    >
      <svg aria-hidden="true" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8h12l-1.2 10.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber px-1 font-mono text-[9px] font-bold text-ink">
          {count}
        </span>
      )}
    </Link>
  );
}
