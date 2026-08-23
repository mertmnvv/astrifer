import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ContinueYourPageBanner } from "@/components/ContinueYourPageBanner";
import { ArchiveHeader, ArchiveFooter } from "@/components/v2/ArchiveChrome";
import { JournalProductV2 } from "@/components/v2/JournalProductV2";
import { computeSky } from "@/lib/astronomy/computeSky";
import { getPricingConfig } from "@/lib/pricingConfig";
import { DEMO_STAR_MAP, getStarMapBySlug } from "@/lib/starmaps";
import { ownerCookieName, verifyOwnerToken } from "@/lib/starmapOwnerToken";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Deri Defter — Astrifer",
  description: "Gerçek gökyüzünüzü içeren 26 sayfalık, premium vegan/suni deri kaplı kişisel zaman kapsülü.",
};

export default async function JournalProductPage({
  searchParams,
}: {
  searchParams: { slug?: string };
}) {
  const ownStarMap = searchParams.slug ? await getStarMapBySlug(searchParams.slug) : null;
  const ownerToken = ownStarMap ? cookies().get(ownerCookieName(ownStarMap.slug))?.value : undefined;
  const isVerifiedOwner = ownStarMap ? await verifyOwnerToken(ownStarMap.slug, ownerToken) : false;
  const source = isVerifiedOwner && ownStarMap ? ownStarMap : DEMO_STAR_MAP;
  const sky = computeSky({ date: source.eventDateUtc, latitude: source.latitude, longitude: source.longitude });
  const first = source.entries.find((entry) => entry.isInitial) ?? source.entries[0];
  const pricing = await getPricingConfig();

  return (
    <div className="archive-shell">
      <ArchiveHeader />
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-8">
        <ContinueYourPageBanner />
      </div>
      <JournalProductV2
        sky={sky}
        title={source.title}
        eventDateUtc={source.eventDateUtc}
        timezone={source.timezone}
        locationName={source.locationName}
        latitude={source.latitude}
        longitude={source.longitude}
        photos={first?.photos ?? []}
        price={pricing.journalPrice}
        originalPrice={pricing.journalOriginalPrice}
      />
      <ArchiveFooter />
    </div>
  );
}
