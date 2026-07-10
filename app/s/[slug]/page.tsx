import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StarMapView } from "@/components/starmap/StarMapView";
import { getStarMapBySlug } from "@/lib/starmaps";

export const revalidate = 3600;

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://astrifer.com";
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const starMap = await getStarMapBySlug(params.slug);
  if (!starMap) return {};

  const description = starMap.message ?? `${starMap.locationName} üzerindeki gerçek gökyüzü.`;
  return {
    title: `${starMap.title} — Astrifer`,
    description,
    openGraph: {
      title: `${starMap.title} — Astrifer`,
      description,
      url: `${siteUrl()}/s/${starMap.slug}`,
      type: "website",
    },
  };
}

export default async function SharedStarMapPage({
  params,
}: {
  params: { slug: string };
}) {
  const starMap = await getStarMapBySlug(params.slug);
  if (!starMap) notFound();

  return <StarMapView starMap={starMap} />;
}
