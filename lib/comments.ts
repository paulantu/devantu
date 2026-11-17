import { cacheLife, cacheTag } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { blogComments } from "@/db/schema";

// Only approved comments. Approving or deleting one refreshes this list.
export async function getApprovedComments(postId: string) {
  "use cache";
  cacheTag("comments");
  cacheLife("minutes");

  return db
    .select({
      id: blogComments.id,
      name: blogComments.name,
      body: blogComments.body,
      createdAt: blogComments.createdAt,
    })
    .from(blogComments)
    .where(and(eq(blogComments.postId, postId), eq(blogComments.status, "approved")))
    .orderBy(asc(blogComments.createdAt));
}