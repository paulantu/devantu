import { getPublishedPosts } from "@/lib/blog";
import { getSiteSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site-config";

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function GET() {
  const [posts, settings] = await Promise.all([getPublishedPosts(), getSiteSettings()]);
  const base = siteConfig.url;

  const items = posts
    .slice(0, 30)
    .map(
      (p) => `<item>
<title>${esc(p.title)}</title>
<link>${base}/blog/${p.slug}</link>
<guid isPermaLink="true">${base}/blog/${p.slug}</guid>
<pubDate>${p.publishedAt.toUTCString()}</pubDate>
<description>${esc(p.excerpt)}</description>
</item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${esc(settings.general.name)} - Blog</title>
<link>${base}/blog</link>
<description>${esc(settings.general.description)}</description>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}