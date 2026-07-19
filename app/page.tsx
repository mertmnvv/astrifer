import { computeSky } from "@/lib/astronomy/computeSky";
import { DEMO_STAR_MAP } from "@/lib/starmaps";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Hero } from "@/components/home/Hero";
import { FeatureShowcase } from "@/components/home/FeatureShowcase";
import { ConceptSection } from "@/components/home/ConceptSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ProductsTeaser } from "@/components/home/ProductsTeaser";
import { Testimonials } from "@/components/home/Testimonials";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { getPricingConfig } from "@/lib/pricingConfig";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sky = computeSky({
    date: DEMO_STAR_MAP.eventDateUtc,
    latitude: DEMO_STAR_MAP.latitude,
    longitude: DEMO_STAR_MAP.longitude,
  });

  const pricing = await getPricingConfig();

  return (
    <>
      <SiteHeader />
      <main>
        <Hero sky={sky} />
        <FeatureShowcase />
        <ConceptSection />
        <HowItWorks />
        <ProductsTeaser pricing={pricing} />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
