import { Suspense } from "react";
import Link from "next/link";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { blogComments, blogPosts } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { COMMENT_STATUSES } from "@/lib/comment-status";
import { CommentsManager } from "@/components/admin/comments-manager";
import { cn } from "@/lib/utils";

async function CommentsContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { session, role } = await requireRole(["superadmin", "admin", "author"]);
  const { status } = await searchParams;
  const current = (COMMENT_STATUSES as readonly string[]).includes(status ?? "")
    ? status!
    : "pending";

  // Authors only see comments on their own posts.
  const scope = role === "author" ? eq(blogPosts.authorId, session.user.id) : undefined;

  const counts = await db
    .select({ status: blogComments.status, n: count() })
    .from(blogComments)
    .innerJoin(blogPosts, eq(blogPosts.id, blogComments.postId))
    .where(scope)
    .groupBy(blogComments.status);
  const countOf = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;

  const rows = await db
    .select({
      id: blogComments.id,
      name: blogComments.name,
      email: blogComments.email,
      body: blogComments.body,
      status: blogComments.status,
      createdAt: blogComments.createdAt,
      postTitle: blogPosts.title,
      postSlug: blogPosts.slug,
    })
    .from(blogComments)
    .innerJoin(blogPosts, eq(blogPosts.id, blogComments.postId))
    .where(and(eq(blogComments.status, current), scope))
    .orderBy(desc(blogComments.createdAt))
    .limit(200);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {COMMENT_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/comments?status=${s}`}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm capitalize",
              s === current
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted hover:bg-elevated",
            )}
          >
            {s} ({countOf(s)})
          </Link>
        ))}
      </div>
      <CommentsManager
        rows={rows.map((r) => ({
          ...r,
          createdAt: `${r.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC`,
        }))}
      />
    </>
  );
}

export default function CommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Comments</h1>
        <p className="text-sm text-muted">
          Comments stay hidden until you approve them.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <CommentsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}