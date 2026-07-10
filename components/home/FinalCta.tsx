import Link from "next/link";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden px-4 py-28 sm:px-8">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_50%,rgba(230,184,119,0.1),transparent_70%)]"
      />
      <RevealOnScroll className="relative mx-auto flex max-w-xl flex-col items-center text-center">
        <span aria-hidden className="h-px w-20 bg-amber/50" />
        <h2 className="mt-8 font-display text-3xl italic text-bright sm:text-4xl">
          O anın gökyüzünü kaybetmeyin.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-subtle sm:text-base">
          Birkaç dakikada oluşturun, sonsuza dek geri dönün.
        </p>
        <Link
          href="/create"
          className="mt-8 rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-8 py-4 font-mono text-xs uppercase tracking-widest text-ink transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        >
          Zaman Kapsülünü Oluştur
        </Link>
      </RevealOnScroll>
    </section>
  );
}
