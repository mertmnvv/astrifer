import Link from "next/link";
import { Logo } from "@/components/Logo";
import { CartLink } from "@/components/layout/CartLink";

export function ArchiveHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1118]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
        <Link href="/" aria-label="Astrifer ana sayfa" className="flex items-center gap-3">
          <Logo size={24} />
          <span className="hidden border-l border-white/15 pl-3 archive-kicker text-[#d8d1c2] sm:block">
            Kişisel gökyüzü arşivi
          </span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-7" aria-label="Ana navigasyon">
          {!compact && (
            <>
              <Link href="/#urunler" className="hidden archive-kicker text-[#d8d1c2] hover:text-white sm:block">Ne alıyorum?</Link>
              <Link href="/#ornek" className="hidden archive-kicker text-[#d8d1c2] hover:text-white sm:block">Canlı örnek</Link>
            </>
          )}
          <CartLink />
          <Link href="/create" className="archive-button-primary !min-h-9 !px-3 sm:!px-5">Sayfanı oluştur</Link>
        </nav>
      </div>
    </header>
  );
}

export function ArchiveFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#080d12] px-4 py-12 sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Logo size={24} />
          <p className="mt-4 max-w-md text-sm leading-6 text-[#aeb4b8]">
            Bir tarihin gerçek gökyüzünü, yeniden ziyaret edilebilen kişisel bir arşive dönüştürür.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-3 archive-kicker text-[#929aa0]">
          <Link href="/sozlesmeler/kvkk">KVKK</Link>
          <Link href="/sozlesmeler/kullanim-kosullari">Koşullar</Link>
          <Link href="mailto:destek@astrifer.net">Destek</Link>
        </div>
      </div>
    </footer>
  );
}
