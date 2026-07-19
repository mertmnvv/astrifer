import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://astrifer.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/print", "/checkout", "/sepet", "/s/*/claim"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
