import { computeSky } from "@/lib/astronomy/computeSky";
import { DEMO_STAR_MAP } from "@/lib/starmaps";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Hero } from "@/components/home/Hero";
import { ConceptSection } from "@/components/home/ConceptSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ProductsTeaser } from "@/components/home/ProductsTeaser";
import { FinalCta } from "@/components/home/FinalCta";

export default function HomePage() {
  const sky = computeSky({
    date: DEMO_STAR_MAP.eventDateUtc,
    latitude: DEMO_STAR_MAP.latitude,
    longitude: DEMO_STAR_MAP.longitude,
  });

  return (
    <>
      <SiteHeader />
      <main>
        <Hero sky={sky} />
        <ConceptSection />
        <HowItWorks />
        <ProductsTeaser />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
