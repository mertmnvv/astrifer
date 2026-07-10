import Link from "next/link";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { LedgerRule } from "@/components/atlas/LedgerRule";

export function FinalCta() {
  return (
    <section className="bg-ink px-4 py-28 sm:px-8">
      <RevealOnScroll className="mx-auto flex max-w-xl flex-col items-center text-center">
        <LedgerRule tone="parchment" className="w-24" />
        <h2 className="mt-8 font-display text-3xl italic text-parchment sm:text-4xl">
          O anın gökyüzünü kaybetmeyin.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-parchment/60 sm:text-base">
          Birkaç dakikada oluşturun, sonsuza dek geri dönün.
        </p>
        <Link
          href="/create"
          className="mt-8 rounded-full bg-brass px-8 py-4 font-mono text-xs uppercase tracking-widest text-void transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
        >
          Zaman Kapsülünü Oluştur
        </Link>
      </RevealOnScroll>
    </section>
  );
}
