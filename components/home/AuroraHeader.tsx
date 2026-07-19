"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Logo } from "@/components/Logo";
import { CartLink } from "@/components/layout/CartLink";

const NAV_LINKS = [
  { href: "/#nasil-calisir", label: "Nasıl Çalışır" },
  { href: "/#urunler", label: "Ürünler" },
];

export interface AuroraHeaderProps {
  /** Override the default homepage nav links (e.g. a simplified set for non-marketing pages). */
  links?: { href: string; label: string }[];
  /** Override the trailing CTA button — pass null to hide it entirely. */
  cta?: { href: string; label: string } | null;
  /** Hide the cart icon (irrelevant outside the shopping flow). */
  showCart?: boolean;
}

/** Navbar in the aurora/nebula visual language — defaults to the homepage nav, but reusable elsewhere via props. */
export function AuroraHeader({ links = NAV_LINKS, cta = { href: "/create", label: "Oluştur" }, showCart = true }: AuroraHeaderProps) {
  const { scrollY } = useScroll();
  const background = useTransform(scrollY, [0, 96], ["rgba(7,5,15,0)", "rgba(7,5,15,0.72)"]);
  const borderOpacity = useTransform(scrollY, [0, 96], [0, 1]);

  return (
    <motion.header style={{ backgroundColor: background }} className="fixed inset-x-0 top-0 z-40 backdrop-blur-md">
      <motion.div
        style={{ opacity: borderOpacity }}
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-iris/40 to-transparent"
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4">
          <Link href="/" className="flex items-center" aria-label="Astrifer anasayfa">
            <Logo size={22} className="sm:hidden" />
            <Logo size={26} className="hidden sm:inline-block" />
          </Link>
          <nav className="flex items-center gap-4 sm:gap-7">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hidden font-mono text-[10px] uppercase tracking-widest text-muted transition-colors hover:text-iris-light sm:inline"
              >
                {link.label}
              </Link>
            ))}
            {showCart && <CartLink />}
            {cta && (
              <Link
                href={cta.href}
                className="rounded-full bg-gradient-to-br from-iris to-flare px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-light sm:px-5 sm:py-2 sm:text-xs"
              >
                {cta.label}
              </Link>
            )}
          </nav>
        </div>
        <nav className="flex items-center gap-5 border-t border-text/10 py-2.5 sm:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-[10px] uppercase tracking-widest text-muted transition-colors hover:text-iris-light"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </motion.header>
  );
}
