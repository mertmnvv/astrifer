export default function SharedStarMapPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center text-haze">
      <p className="font-mono text-sm">
        /s/{params.slug} — paylaşılan harita sayfası henüz inşa edilmedi.
      </p>
    </main>
  );
}
