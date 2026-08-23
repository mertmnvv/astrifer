import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { MobileNav } from "@/components/admin/MobileNav";

export const metadata = {
  title: "Hatırname Admin",
  robots: { index: false, follow: false },
};

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Özet",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10.5 12 3l9 7.5M5.25 9.75V21h13.5V9.75"
      />
    ),
  },
  {
    href: "/admin/orders",
    label: "Siparişler",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5l-1.5 12.75H5.25L3.75 6.75Zm3-3v3m10.5-3v3M9 12h6"
      />
    ),
  },
  {
    href: "/admin/templates",
    label: "Şablonlar",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m12 3 8.25 4.5L12 12 3.75 7.5 12 3Zm-8.25 9L12 16.5l8.25-4.5M3.75 16.5 12 21l8.25-4.5"
      />
    ),
  },
  {
    href: "/admin/pricing",
    label: "Fiyatlar",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.25 7.5v5.379a2.25 2.25 0 0 1-.659 1.591l-7.5 7.5a2.25 2.25 0 0 1-3.182 0l-5.379-5.379a2.25 2.25 0 0 1 0-3.182l7.5-7.5A2.25 2.25 0 0 1 12.621 5H18a2.25 2.25 0 0 1 2.25 2.25ZM15 9h.008v.008H15V9Z"
      />
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-void text-text lg:flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 border-r border-text/10 bg-panel lg:flex lg:flex-col">
        <div className="border-b border-text/10 px-6 py-5">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-iris-light">Hatırname</span>
          <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-dim">Admin Paneli</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-xs uppercase tracking-wider text-subtle transition-colors hover:bg-text/[0.04] hover:text-bright"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 shrink-0 text-dim transition-colors group-hover:text-amber">
                {item.icon}
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-text/10 p-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-xs uppercase tracking-wider text-subtle transition-colors hover:bg-text/[0.04] hover:text-rose"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M18 12H9m9 0-3-3m3 3-3 3" />
              </svg>
              Çıkış yap
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1">
        {/* Top bar (mobile hamburger nav + always-visible) */}
        <header className="border-b border-text/10 bg-panel lg:bg-transparent">
          <MobileNav items={NAV_ITEMS} logoutAction={logoutAction} />
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
