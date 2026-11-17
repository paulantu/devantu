import { db } from "@/db";
import {
  blogCategories,
  blogPosts,
  blogPostTags,
  blogTags,
  cvEntries,
  galleryAlbums,
  galleryItems,
  mediaFiles,
  pageSections,
  pricingPlans,
  projectServices,
  projects,
  services,
  siteSettings,
} from "@/db/schema";
import { requireRole } from "@/lib/session";

export async function GET() {
  await requireRole(["superadmin"]);

  const [
    settings, sections, svc, proj, projSvc, plans, cv, cats, tags, posts,
    postTags, albums, items, media,
  ] = await Promise.all([
    db.select().from(siteSettings),
    db.select().from(pageSections),
    db.select().from(services),
    db.select().from(projects),
    db.select().from(projectServices),
    db.select().from(pricingPlans),
    db.select().from(cvEntries),
    db.select().from(blogCategories),
    db.select().from(blogTags),
    db.select().from(blogPosts),
    db.select().from(blogPostTags),
    db.select().from(galleryAlbums),
    db.select().from(galleryItems),
    db.select().from(mediaFiles),
  ]);

  const body = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      siteSettings: settings,
      pageSections: sections,
      services: svc,
      projects: proj,
      projectServices: projSvc,
      pricingPlans: plans,
      cvEntries: cv,
      blogCategories: cats,
      blogTags: tags,
      blogPosts: posts,
      blogPostTags: postTags,
      galleryAlbums: albums,
      galleryItems: items,
      mediaFiles: media,
    },
    null,
    2,
  );

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="portfolio-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json"`,
    },
  });
}