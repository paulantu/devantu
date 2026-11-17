import { cacheTag } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pageSections } from "@/db/schema";

// Cached until an admin changes sections; the admin actions expire the tag.
export async function getPageSections(pageKey: string) {
  "use cache";
  cacheTag("sections");

  return db
    .select({
      id: pageSections.id,
      type: pageSections.type,
      config: pageSections.config,
    })
    .from(pageSections)
    .where(and(eq(pageSections.pageKey, pageKey), eq(pageSections.isVisible, true)))
    .orderBy(asc(pageSections.sortOrder), asc(pageSections.createdAt));
}