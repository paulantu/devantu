import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site-config";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { seo } = await getSiteSettings();

  if (seo.noindex) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/login", "/unsubscribe"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}