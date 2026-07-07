import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo size={140} />
      <h1 className="max-w-2xl font-display text-4xl italic text-text sm:text-5xl">
        Gökyüzü o an, sonsuza dek sizin.
      </h1>
      <p className="max-w-md text-sm text-haze">
        Bu sayfa henüz yer tutucu — ana tanıtım sayfası ayrı bir görevde
        inşa edilecek. Konfigüratörü denemek için aşağıdaki bağlantıyı
        kullanın.
      </p>
      <Link
        href="/create"
        className="rounded-full border border-brass-dim px-6 py-3 font-mono text-xs uppercase tracking-widest text-brass transition-colors hover:bg-brass hover:text-void focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass"
      >
        Haritanı Oluştur
      </Link>
    </main>
  );
}
