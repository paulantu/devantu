import { cacheTag } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";

export async function getPublishedServices() {
  "use cache";
  cacheTag("services");

  return db
    .select({
      id: services.id,
      slug: services.slug,
      title: services.title,
      summary: services.summary,
      icon: services.icon,
      coverUrl: services.coverUrl,
    })
    .from(services)
    .where(eq(services.status, "published"))
    .orderBy(asc(services.sortOrder), asc(services.title));
}

export async function getServiceBySlug(slug: string) {
  "use cache";
  cacheTag("services");

  const [row] = await db
    .select()
    .from(services)
    .where(and(eq(services.slug, slug), eq(services.status, "published")));
  return row ?? null;
}