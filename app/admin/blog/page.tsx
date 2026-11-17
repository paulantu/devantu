import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts, user } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { PostsList, type PostRow } from "@/components/admin/posts-list";

async function BlogContent() {
  const { session, role } = await requireRole();

  const rows = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      status: blogPosts.status,
      featured: blogPosts.featured,
      publishedAt: blogPosts.publishedAt,
      createdAt: blogPosts.createdAt,
      authorName: user.name,
    })
    .from(blogPosts)
    .leftJoin(user, eq(user.id, blogPosts.authorId))
    .where(role === "author" ? eq(blogPosts.authorId, session.user.id) : undefined)
    .orderBy(desc(blogPosts.createdAt))
    .limit(300);

  const now = Date.now();
  const list: PostRow[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    featured: r.featured,
    authorName: r.authorName,
    state:
      r.status !== "published"
        ? "draft"
        : r.publishedAt && r.publishedAt.getTime() > now
          ? "scheduled"
          : "published",
    date: (r.publishedAt ?? r.createdAt).toISOString().slice(0, 10),
  }));

  return <PostsList rows={list} canCategories={role !== "author"} />;
}

export default function BlogAdminPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Blog</h1>
        <p className="text-sm text-muted">
          Write about your work and experience. Authors see only their own posts.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <BlogContent />
      </Suspense>
    </div>
  );
}