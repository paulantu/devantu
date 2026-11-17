import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  blogCategories,
  blogPosts,
  blogPostTags,
  blogTags,
} from "@/db/schema";
import { requireRole } from "@/lib/session";
import { PostForm } from "@/components/admin/post-form";

async function EditContent({ params }: { params: Promise<{ id: string }> }) {
  const { session, role } = await requireRole();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
  if (!row) notFound();
  if (role === "author" && row.authorId !== session.user.id) notFound();

  const categories = await db
    .select({ id: blogCategories.id, name: blogCategories.name })
    .from(blogCategories)
    .orderBy(asc(blogCategories.name));
  const tagRows = await db
    .select({ name: blogTags.name })
    .from(blogPostTags)
    .innerJoin(blogTags, eq(blogTags.id, blogPostTags.tagId))
    .where(eq(blogPostTags.postId, id));

  const initial = {
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    coverUrl: row.coverUrl,
    categoryId: row.categoryId ?? "",
    tags: tagRows.map((t) => t.name).join(", "),
    status: row.status,
    featured: row.featured,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : "",
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    content: row.content,
    commentsEnabled: row.commentsEnabled,
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/blog" className="text-sm text-muted hover:text-primary">
          ← All posts
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold">{row.title}</h1>
        {row.status === "published" && (
          <Link href={`/blog/${row.slug}`} target="_blank" className="text-sm text-primary underline">
            View live post
          </Link>
        )}
      </div>
      <PostForm
        id={row.id}
        initial={initial}
        categories={categories}
        canFeature={role !== "author"}
      />
    </div>
  );
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
      <EditContent params={params} />
    </Suspense>
  );
}