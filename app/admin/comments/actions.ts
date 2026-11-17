"use server";

import { revalidatePath, updateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { blogComments, blogPosts } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { COMMENT_STATUSES } from "@/lib/comment-status";

export type CommentResult = { ok: boolean; message: string };
const ALLOWED = ["superadmin", "admin", "author"] as const;

// Authors can only moderate comments on their own posts.
async function check(id: string): Promise<CommentResult | null> {
  const { session, role } = await requireRole([...ALLOWED]);
  const [row] = await db
    .select({ postAuthor: blogPosts.authorId })
    .from(blogComments)
    .innerJoin(blogPosts, eq(blogPosts.id, blogComments.postId))
    .where(eq(blogComments.id, id));
  if (!row) return { ok: false, message: "Comment not found" };
  if (role === "author" && row.postAuthor !== session.user.id) {
    return { ok: false, message: "You can only moderate comments on your own posts" };
  }
  return null;
}

function refresh() {
  updateTag("comments");
  revalidatePath("/admin/comments");
  revalidatePath("/admin");
}

export async function setCommentStatusAction(
  id: string,
  status: string,
): Promise<CommentResult> {
  if (!(COMMENT_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, message: "Invalid status" };
  }
  const blocked = await check(id);
  if (blocked) return blocked;
  await db
    .update(blogComments)
    .set({ status, updatedAt: new Date() })
    .where(eq(blogComments.id, id));
  refresh();
  return { ok: true, message: "Updated" };
}

export async function deleteCommentAction(id: string): Promise<CommentResult> {
  const blocked = await check(id);
  if (blocked) return blocked;
  await db.delete(blogComments).where(eq(blogComments.id, id));
  refresh();
  return { ok: true, message: "Deleted" };
}