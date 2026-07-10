import { Logo } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-amber/10 px-4 py-10 sm:px-8 sm:py-11">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-6 text-center sm:justify-between sm:text-left">
        <Logo size={23} />
        <p className="max-w-xs text-xs text-dim">
          Gerçek astronomik verilerle hesaplanmış, kişiye özel bir zaman kapsülü.
        </p>
        <span className="font-mono text-[9.5px] uppercase tracking-widest text-faint">
          © {new Date().getFullYear()} Astrifer
        </span>
      </div>
    </footer>
  );
}
