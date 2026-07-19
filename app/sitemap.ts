import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://astrifer.com";

  const routes = [
    { path: "/", changeFrequency: "weekly" as const, priority: 1 },
    { path: "/create", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/urun/dijital", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/urun/defter", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/sozlesmeler/kvkk", changeFrequency: "yearly" as const, priority: 0.2 },
    { path: "/sozlesmeler/kullanim-kosullari", changeFrequency: "yearly" as const, priority: 0.2 },
    { path: "/sozlesmeler/mesafeli-satis", changeFrequency: "yearly" as const, priority: 0.2 },
    { path: "/sozlesmeler/on-bilgilendirme", changeFrequency: "yearly" as const, priority: 0.2 },
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
