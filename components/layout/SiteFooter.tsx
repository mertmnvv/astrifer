import Link from "next/link";
import { Logo } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-amber/10 px-4 py-10 sm:px-8 sm:py-11 bg-void/50 backdrop-blur-sm select-none">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo size={23} />
          <p className="max-w-xs text-xs text-dim text-center sm:text-left mt-1">
            Gerçek astronomik verilerle hesaplanmış, kişiye özel bir zaman kapsülü.
          </p>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 font-mono text-[9px] uppercase tracking-widest text-subtle">
          <Link href="/sozlesmeler/kvkk" className="hover:text-amber transition-colors">
            KVKK
          </Link>
          <Link href="/sozlesmeler/kullanim-kosullari" className="hover:text-amber transition-colors">
            Kullanım Koşulları
          </Link>
          <Link href="/sozlesmeler/mesafeli-satis" className="hover:text-amber transition-colors">
            Mesafeli Satış
          </Link>
          <Link href="/sozlesmeler/on-bilgilendirme" className="hover:text-amber transition-colors">
            Ön Bilgilendirme
          </Link>
        </div>

        <div className="text-center sm:text-right flex flex-col items-center sm:items-end gap-1">
          <span className="font-mono text-[9.5px] uppercase tracking-widest text-faint">
            © {new Date().getFullYear()} Astrifer
          </span>
        </div>

      </div>
    </footer>
  );
}
