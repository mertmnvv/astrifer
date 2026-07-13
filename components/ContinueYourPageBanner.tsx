"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AtlasPanel } from "@/components/atlas/AtlasPanel";
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
    <AtlasPanel padding="md" className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-text">
        <span className="font-display italic text-bright">&ldquo;{lastPage.title}&rdquo;</span> sayfan için mi? Bu
        ürünü doğrudan o sayfaya bağlayabilirsin.
      </p>
      <Link
        href={`${pathname}?slug=${encodeURIComponent(lastPage.slug)}`}
        className="shrink-0 rounded-full border border-amber/40 px-5 py-2 font-mono text-[11px] uppercase tracking-widest text-amber transition-colors hover:bg-amber/10"
      >
        Sayfamdan Devam Et
      </Link>
    </AtlasPanel>
  );
}
