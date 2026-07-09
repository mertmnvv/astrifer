import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";

export function SiteFooter() {
  return (
    <footer className="border-t border-brass-dim/15 px-4 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <div className="flex items-center gap-2">
            <LogoMark size={20} />
            <span className="font-display text-base italic text-text">Astrifer</span>
          </div>
          <p className="max-w-xs text-xs text-haze">Gerçek astronomik verilerle hesaplanmış, kişiye özel bir zaman kapsülü.</p>
        </div>
        <nav className="flex gap-6 font-mono text-[10px] uppercase tracking-widest text-haze">
          <Link href="/#nasil-calisir" className="transition-colors hover:text-brass">
            Nasıl Çalışır
          </Link>
          <Link href="/#urunler" className="transition-colors hover:text-brass">
            Ürünler
          </Link>
          <Link href="/create" className="transition-colors hover:text-brass">
            Oluştur
          </Link>
        </nav>
      </div>
      <p className="mt-8 text-center font-mono text-[9px] uppercase tracking-widest text-haze/60">
        © {new Date().getFullYear()} Astrifer
      </p>
    </footer>
  );
}
