"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { LogoMark } from "@/components/LogoMark";

const NAV_LINKS = [
  { href: "/#nasil-calisir", label: "Nasıl Çalışır" },
  { href: "/#urunler", label: "Ürünler" },
];

/** Fixed top bar: logo + a couple of nav links + primary CTA. Same layout at every width — shrinks, never restructures into an app-style drawer/hamburger. */
export function SiteHeader() {
  const { scrollY } = useScroll();
  const background = useTransform(scrollY, [0, 96], ["rgba(5,6,13,0)", "rgba(5,6,13,0.86)"]);
  const borderOpacity = useTransform(scrollY, [0, 96], [0, 1]);

  return (
    <motion.header style={{ backgroundColor: background }} className="fixed inset-x-0 top-0 z-40 backdrop-blur-md">
      <motion.div style={{ opacity: borderOpacity }} className="absolute inset-x-0 bottom-0 h-px bg-brass-dim/40" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-8 sm:py-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Astrifer anasayfa">
          <LogoMark size={20} />
          <span className="hidden font-display text-lg italic text-text sm:inline">Astrifer</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hidden font-mono text-[10px] uppercase tracking-widest text-haze transition-colors hover:text-brass sm:inline"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/create"
            className="rounded-full border border-brass-dim px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-widest text-brass transition-colors hover:bg-brass hover:text-void focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass sm:px-5 sm:py-2 sm:text-xs"
          >
            Oluştur
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}
