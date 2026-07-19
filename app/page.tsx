import { computeSky } from "@/lib/astronomy/computeSky";
import { DEMO_STAR_MAP } from "@/lib/starmaps";
import { AuroraHeader } from "@/components/home/AuroraHeader";
import { AuroraFooter } from "@/components/home/AuroraFooter";
import { Hero } from "@/components/home/Hero";
import { FeatureShowcase } from "@/components/home/FeatureShowcase";
import { ConceptSection } from "@/components/home/ConceptSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ProductsTeaser } from "@/components/home/ProductsTeaser";
import { Testimonials } from "@/components/home/Testimonials";
import { Faq } from "@/components/home/Faq";
import { FAQ_ITEMS } from "@/components/home/faqData";
import { FinalCta } from "@/components/home/FinalCta";
import { getPricingConfig } from "@/lib/pricingConfig";

export const dynamic = "force-dynamic";

function StructuredData({ siteUrl }: { siteUrl: string }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Astrifer",
    url: siteUrl,
    email: "destek@astrifer.net",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </>
  );
}

export default async function HomePage() {
  const sky = computeSky({
    date: DEMO_STAR_MAP.eventDateUtc,
    latitude: DEMO_STAR_MAP.latitude,
    longitude: DEMO_STAR_MAP.longitude,
  });

  const pricing = await getPricingConfig();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://astrifer.com";

  const productsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: [
      {
        "@type": "Product",
        name: "Astrifer Dijital Sayfa",
        description: "Gerçek astronomik verilerle hesaplanmış, kişiye özel kalıcı bir dijital yıldız haritası sayfası.",
        offers: {
          "@type": "Offer",
          price: pricing.digitalPrice,
          priceCurrency: "TRY",
          url: `${siteUrl}/urun/dijital`,
        },
      },
      {
        "@type": "Product",
        name: "Astrifer Deri Defter",
        description: "Kişiye özel yıldız haritanızı içeren, suni deri kaplı, el yapımı fiziksel defter.",
        offers: {
          "@type": "Offer",
          price: pricing.journalPrice,
          priceCurrency: "TRY",
          url: `${siteUrl}/urun/defter`,
        },
      },
    ],
  };

  return (
    <>
      <StructuredData siteUrl={siteUrl} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productsJsonLd) }} />
      <div className="bg-nebula">
        <AuroraHeader />
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
        <AuroraFooter />
      </div>
    </>
  );
}
