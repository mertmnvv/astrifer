import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { StarMapView } from "@/components/starmap/StarMapView";
import { AuroraHeader } from "@/components/home/AuroraHeader";
import { getStarMapBySlug } from "@/lib/starmaps";
import { ownerCookieName, verifyOwnerToken } from "@/lib/starmapOwnerToken";

// Owner-cookie personalization (see SharedStarMapPage below) means this can
// no longer be a static/ISR page — cookies() forces dynamic rendering.
export const dynamic = "force-dynamic";

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

  // Owner cookie check personalizes this render per-visitor, so the page is
  // effectively dynamic from here on — the `revalidate` export above no
  // longer applies once cookies() is read (Next.js opts out automatically).
  const ownerToken = cookies().get(ownerCookieName(params.slug))?.value;
  const isOwner = await verifyOwnerToken(params.slug, ownerToken);

  return (
    <>
      <AuroraHeader
        links={[{ href: "/", label: "Ana Sayfa" }]}
        cta={{ href: "/urun/defter", label: "Deri Defter Sipariş Et" }}
        showCart={false}
      />
      <StarMapView starMap={starMap} isOwner={isOwner} />
    </>
  );
}
