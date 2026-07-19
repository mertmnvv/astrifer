import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

export const metadata = {
  title: "Astrifer Admin",
  robots: { index: false, follow: false },
};

const NAV_ITEMS = [
  { href: "/admin", label: "Özet" },
  { href: "/admin/orders", label: "Siparişler" },
  { href: "/admin/templates", label: "Şablonlar" },
  { href: "/admin/pricing", label: "Fiyatlar" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-void text-text">
      <header className="border-b border-text/10 bg-panel">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <span className="shrink-0 font-mono text-xs uppercase tracking-[0.3em] text-iris-light">Astrifer Admin</span>
            <form action={logoutAction} className="sm:hidden">
              <button
                type="submit"
                className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-subtle transition-colors hover:text-iris-light"
              >
                Çıkış yap
              </button>
            </form>
          </div>
          <nav className="flex items-center gap-5 overflow-x-auto sm:ml-5">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 font-mono text-xs uppercase tracking-widest text-subtle transition-colors hover:text-iris-light"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction} className="hidden sm:block">
            <button
              type="submit"
              className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-subtle transition-colors hover:text-iris-light"
            >
              Çıkış yap
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">{children}</div>
    </div>
  );
}
