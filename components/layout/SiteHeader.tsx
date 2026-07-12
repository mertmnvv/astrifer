"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Logo } from "@/components/Logo";
import { LogoMark } from "@/components/LogoMark";
import { MobileNav } from "@/components/layout/MobileNav";

const NAV_LINKS = [
  { href: "/#nasil-calisir", label: "Nasıl Çalışır" },
  { href: "/#urunler", label: "Ürünler" },
];

/** Fixed top bar: logo + nav links + primary CTA. Below `sm` the text links collapse behind a hamburger that opens a right-side drawer (MobileNav) sharing this same NAV_LINKS list. */
export function SiteHeader() {
  const { scrollY } = useScroll();
  const background = useTransform(scrollY, [0, 96], ["rgba(11,8,16,0)", "rgba(11,8,16,0.72)"]);
  const borderOpacity = useTransform(scrollY, [0, 96], [0, 1]);

  return (
    <motion.header style={{ backgroundColor: background }} className="fixed inset-x-0 top-0 z-40 backdrop-blur-md">
      <motion.div style={{ opacity: borderOpacity }} className="absolute inset-x-0 bottom-0 h-px bg-text/10" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8 sm:py-4">
        <Link href="/" className="flex items-center" aria-label="Astrifer anasayfa">
          <LogoMark size={22} className="sm:hidden" />
          <Logo size={26} className="hidden sm:inline-block" />
        </Link>
        <nav className="flex items-center gap-4 sm:gap-7">
          <MobileNav links={NAV_LINKS} />
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden font-mono text-[10px] uppercase tracking-widest text-muted transition-colors hover:text-amber sm:inline"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/create"
            className="rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-ink transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber sm:px-5 sm:py-2 sm:text-xs"
          >
            Oluştur
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
