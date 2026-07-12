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
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <nav className="flex items-center gap-5">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-amber">Astrifer Admin</span>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-mono text-xs uppercase tracking-widest text-subtle transition-colors hover:text-amber"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAction}>
            <button
              type="submit"
              className="font-mono text-[10px] uppercase tracking-widest text-subtle transition-colors hover:text-amber"
            >
              Çıkış yap
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
    </div>
  );
}
