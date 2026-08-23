import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StarMapViewV2 } from "@/components/v2/StarMapViewV2";
import { ArchiveHeader, ArchiveFooter } from "@/components/v2/ArchiveChrome";
import { getDemoStarMap, DIGITAL_DEMO_SHOWCASES } from "@/lib/demoStarMaps";

export function generateStaticParams() {
  return DIGITAL_DEMO_SHOWCASES.map((s) => ({ palette: s.paletteId }));
}

export function generateMetadata({ params }: { params: { palette: string } }): Metadata {
  const demo = getDemoStarMap(params.palette);
  if (!demo) return {};
  return {
    title: `${demo.moodTitle} Teması Örneği — Astrifer Dijital Sayfa`,
    description: demo.moodDescription,
  };
}

/**
 * Marketing-only "gerçek deneyim" demo — renders the exact StarMapViewV2 a
 * paying customer's finished /s/[slug] page would (no preview banner, no
 * owner controls), populated with a full timeline and real music, so
 * /urun/dijital can link out to something indistinguishable from the real
 * product instead of a static mockup. See lib/demoStarMaps.ts.
 */
export default function DigitalDemoPage({ params }: { params: { palette: string } }) {
  const demo = getDemoStarMap(params.palette);
  if (!demo) notFound();

  return (
    <>
      <ArchiveHeader compact />
      <StarMapViewV2 starMap={demo.starMap} isPreview={false} isOwner={false} />
      <ArchiveFooter />
    </>
  );
}
