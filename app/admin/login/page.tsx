import { loginAction } from "./actions";

export const metadata = {
  title: "Admin Girişi — Hatırname",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  const next = searchParams.next ?? "/admin";
  const hasError = searchParams.error === "1";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-void px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber">Hatırname Admin</p>
      <form
        action={loginAction}
        className="w-full max-w-xs space-y-4 rounded-2xl border border-text/10 bg-text/[0.035] p-6"
      >
        <input type="hidden" name="next" value={next} />
        <div className="space-y-1.5">
          <label htmlFor="password" className="block font-mono text-[10px] uppercase tracking-widest text-dim">
            Şifre
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="w-full rounded-md border border-text/[0.14] bg-text/[0.04] px-3 py-2 text-sm text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
          />
        </div>
        {hasError && <p className="text-xs text-red-400">Şifre yanlış.</p>}
        <button
          type="submit"
          className="w-full rounded-full bg-gradient-to-br from-amber-light to-amber-deep px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        >
          Giriş yap
        </button>
      </form>
    </main>
  );
}
