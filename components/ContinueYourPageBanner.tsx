"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLastCreatedPage, type LastCreatedPage } from "@/lib/lastCreatedPage";

/**
 * Offers to bind this product's configurator to the visitor's own digital
 * page instead of the generic demo — reads a localStorage convenience
 * pointer set by CreateForm.tsx. Purely a UX shortcut: the product page
 * still re-verifies real ownership server-side before using any real data.
 */
export function ContinueYourPageBanner() {
  const pathname = usePathname();
  const [lastPage, setLastPage] = useState<LastCreatedPage | null>(null);

  useEffect(() => {
    setLastPage(getLastCreatedPage());
  }, []);

  if (!lastPage) return null;

  return (
    <div className="archive-frame mb-8 flex flex-wrap items-center justify-between gap-4 border-[#c79a52]/35 p-5">
      <p className="text-sm text-[#aeb5ba]">
        <span className="font-display text-xl italic text-white">&ldquo;{lastPage.title}&rdquo;</span> sayfan için mi? Bu
        ürünü doğrudan o sayfaya bağlayabilirsin.
      </p>
      <Link
        href={`${pathname}?slug=${encodeURIComponent(lastPage.slug)}`}
        className="archive-button-primary shrink-0 !min-h-10"
      >
        Sayfamdan Devam Et
      </Link>
    </div>
  );
}
