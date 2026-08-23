"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Logo } from "@/components/Logo";
import { CartLink } from "@/components/layout/CartLink";

const NAV_LINKS = [
  { href: "/#nasil-calisir", label: "Nasıl Çalışır" },
  { href: "/#urunler", label: "Ürünler" },
];

/**
 * Fixed top bar: logo + nav links + primary CTA. There are only two nav
 * links, so below `sm` they render inline in a second thin row (own hairline
 * divider) rather than behind a menu button — no hamburger/drawer needed.
 */
export function SiteHeader() {
  const { scrollY } = useScroll();
  const background = useTransform(scrollY, [0, 96], ["rgba(11,8,16,0)", "rgba(11,8,16,0.72)"]);
  const borderOpacity = useTransform(scrollY, [0, 96], [0, 1]);

  return (
    <motion.header style={{ backgroundColor: background }} className="fixed inset-x-0 top-0 z-40 backdrop-blur-md">
      <motion.div style={{ opacity: borderOpacity }} className="absolute inset-x-0 bottom-0 h-px bg-text/10" />
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4">
          <Link href="/" className="flex items-center" aria-label="Hatırname anasayfa">
            <Logo size={22} className="sm:hidden" />
            <Logo size={26} className="hidden sm:inline-block" />
          </Link>
          <nav className="flex items-center gap-4 sm:gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hidden font-mono text-[10px] uppercase tracking-widest text-muted transition-colors hover:text-amber sm:inline"
              >
                {link.label}
              </Link>
            ))}
            <CartLink />
            <Link
              href="/create"
              className="rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber sm:px-5 sm:py-2 sm:text-xs"
            >
              Oluştur
            </Link>
          </nav>
        </div>
        <nav className="flex items-center gap-5 border-t border-text/10 py-2.5 sm:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-[10px] uppercase tracking-widest text-muted transition-colors hover:text-amber"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </motion.header>
  );
}
