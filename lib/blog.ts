import { cacheLife, cacheTag } from "next/cache";
import { and, desc, eq, inArray, lte } from "drizzle-orm";
import { db } from "@/db";
import {
  blogCategories,
  blogPosts,
  blogPostTags,
  blogTags,
  user,
} from "@/db/schema";

type Tag = { slug: string; name: string };

async function tagsFor(ids: string[]) {
  const map = new Map<string, Tag[]>();
  if (ids.length === 0) return map;
  const rows = await db
    .select({ postId: blogPostTags.postId, slug: blogTags.slug, name: blogTags.name })
    .from(blogPostTags)
    .innerJoin(blogTags, eq(blogTags.id, blogPostTags.tagId))
    .where(inArray(blogPostTags.postId, ids));
  for (const r of rows) {
    map.set(r.postId, [...(map.get(r.postId) ?? []), { slug: r.slug, name: r.name }]);
  }
  return map;
}

export type PostCardData = Awaited<ReturnType<typeof getPublishedPosts>>[number];

// Scheduled posts (future publish date) show up here within a few minutes
// of their date, because this list refreshes about once a minute.
export async function getPublishedPosts() {
  "use cache";
  cacheTag("blog");
  cacheLife("minutes");

  const rows = await db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      excerpt: blogPosts.excerpt,
      coverUrl: blogPosts.coverUrl,
      featured: blogPosts.featured,
      publishedAt: blogPosts.publishedAt,
      readingMinutes: blogPosts.readingMinutes,
      categoryId: blogPosts.categoryId,
      categorySlug: blogCategories.slug,
      categoryName: blogCategories.name,
      authorName: user.name,
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogCategories.id, blogPosts.categoryId))
    .leftJoin(user, eq(user.id, blogPosts.authorId))
    .where(and(eq(blogPosts.status, "published"), lte(blogPosts.publishedAt, new Date())))
    .orderBy(desc(blogPosts.publishedAt));

  const tags = await tagsFor(rows.map((r) => r.id));
  return rows.map((r) => ({
    ...r,
    publishedAt: r.publishedAt as Date,
    tags: tags.get(r.id) ?? [],
  }));
}

export async function getPostBySlug(slug: string) {
  "use cache";
  cacheTag("blog");
  cacheLife("minutes");

  const [row] = await db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      excerpt: blogPosts.excerpt,
      coverUrl: blogPosts.coverUrl,
      content: blogPosts.content,
      publishedAt: blogPosts.publishedAt,
      readingMinutes: blogPosts.readingMinutes,
      commentsEnabled: blogPosts.commentsEnabled,
      seoTitle: blogPosts.seoTitle,
      seoDescription: blogPosts.seoDescription,
      categoryId: blogPosts.categoryId,
      categorySlug: blogCategories.slug,
      categoryName: blogCategories.name,
      authorName: user.name,
      authorRole: user.role,
    })
    .from(blogPosts)
    .leftJoin(blogCategories, eq(blogCategories.id, blogPosts.categoryId))
    .leftJoin(user, eq(user.id, blogPosts.authorId))
    .where(
      and(
        eq(blogPosts.slug, slug),
        eq(blogPosts.status, "published"),
        lte(blogPosts.publishedAt, new Date()),
      ),
    );
  if (!row) return null;

  const tags = await tagsFor([row.id]);
  return { ...row, publishedAt: row.publishedAt as Date, tags: tags.get(row.id) ?? [] };
}