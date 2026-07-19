import Link from "next/link";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-nebula px-4 py-28 sm:px-8">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_50%,rgba(167,139,250,0.14),transparent_70%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(40%_80%_at_80%_20%,rgba(244,114,182,0.1),transparent_70%)]"
      />
      <RevealOnScroll className="relative mx-auto flex max-w-xl flex-col items-center text-center">
        <span aria-hidden className="h-px w-20 bg-gradient-to-r from-iris to-flare" />
        <h2 className="mt-8 font-display text-3xl italic text-bright sm:text-4xl">
          Şimdi başlayın, sonsuza dek saklayın.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-subtle sm:text-base">
          Birkaç dakikada oluşturun, sonsuza dek geri dönün.
        </p>
        <Link
          href="/create"
          className="mt-8 rounded-full bg-gradient-to-br from-iris to-flare px-8 py-4 font-mono text-xs font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-light"
        >
          Hediyeni Oluştur
        </Link>
        <p className="mt-4 font-mono text-[9px] uppercase tracking-widest text-dim">
          299₺&apos;den başlayan fiyatlarla · Güvenli ödeme (PayTR)
        </p>
      </RevealOnScroll>
    </section>
  );
}
