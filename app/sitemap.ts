import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog";
import { getPublishedProjects } from "@/lib/projects";
import { getPublishedServices } from "@/lib/services";
import { getSiteSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const { modules } = await getSiteSettings();

  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  if (modules.services) {
    entries.push({ url: `${base}/services`, priority: 0.8 });
    for (const s of await getPublishedServices()) {
      entries.push({ url: `${base}/services/${s.slug}`, priority: 0.8 });
    }
  }
  if (modules.projects) {
    entries.push({ url: `${base}/projects`, priority: 0.8 });
    for (const p of await getPublishedProjects()) {
      entries.push({ url: `${base}/projects/${p.slug}`, priority: 0.7 });
    }
  }
  if (modules.blog) {
    entries.push({ url: `${base}/blog`, changeFrequency: "weekly", priority: 0.8 });
    for (const p of await getPublishedPosts()) {
      entries.push({
        url: `${base}/blog/${p.slug}`,
        lastModified: p.publishedAt,
        priority: 0.6,
      });
    }
  }
  if (modules.pricing) entries.push({ url: `${base}/pricing`, priority: 0.6 });
  if (modules.gallery) entries.push({ url: `${base}/gallery`, priority: 0.4 });

  return entries;
}