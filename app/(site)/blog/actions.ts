"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { and, count, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { blogComments, blogPosts, user } from "@/db/schema";
import { getClient } from "@/lib/request";
import { verifyTurnstile } from "@/lib/turnstile";
import { ownerEmail, sendMail } from "@/lib/mail";
import { getSiteSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site-config";

export type CommentState = {
  ok: boolean;
  message: string;
  values?: Record<string, string>;
};

const schema = z.object({
  postId: z.string().uuid(),
  name: z.string().trim().min(2, "Please enter your name").max(60),
  email: z.string().trim().email("Enter a valid email").max(200),
  body: z
    .string()
    .trim()
    .min(5, "Write a little more (at least 5 characters)")
    .max(1500, "That comment is too long (1500 characters max)"),
});

export async function submitCommentAction(
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  // Honeypot: real visitors never fill this hidden field.
  if (String(formData.get("website") ?? "").trim()) {
    return { ok: true, message: "Thanks! Your comment is waiting for approval." };
  }

  const values = Object.fromEntries(
    [...formData].filter((e): e is [string, string] => typeof e[1] === "string"),
  );
  const fail = (message: string): CommentState => ({ ok: false, message, values });

  const parsed = schema.safeParse(values);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  const d = parsed.data;

  if ((d.body.match(/https?:\/\//gi) ?? []).length > 2) {
    return fail("Please remove some links from your comment.");
  }

  const { ip, ipHash } = getClient(await headers());
  if (!(await verifyTurnstile(values["cf-turnstile-response"] ?? "", ip))) {
    return fail("Please complete the security check and try again.");
  }

  const settings = await getSiteSettings();
  if (!settings.blog.comments) return fail("Comments are turned off.");

  const [post] = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      commentsEnabled: blogPosts.commentsEnabled,
      authorEmail: user.email,
    })
    .from(blogPosts)
    .leftJoin(user, eq(user.id, blogPosts.authorId))
    .where(
      and(
        eq(blogPosts.id, d.postId),
        eq(blogPosts.status, "published"),
        lte(blogPosts.publishedAt, new Date()),
      ),
    );
  if (!post || !post.commentsEnabled) return fail("Comments are closed on this post.");

  if (ipHash) {
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const [{ recent }] = await db
      .select({ recent: count() })
      .from(blogComments)
      .where(and(eq(blogComments.ipHash, ipHash), gte(blogComments.createdAt, since)));
    if (recent >= 5) return fail("Too many comments. Please try again later.");
  }

  await db.insert(blogComments).values({
    postId: post.id,
    name: d.name,
    email: d.email,
    body: d.body,
    ipHash,
  });

  // Alert the owner and the post's author that a comment needs approval.
  const to = [
    ...new Set(
      [ownerEmail(settings.contact.email), post.authorEmail].filter(
        (e): e is string => Boolean(e),
      ),
    ),
  ];
  after(async () => {
    for (const address of to) {
      await sendMail({
        to: address,
        subject: `New comment on "${post.title}" is waiting for approval`,
        text: `${d.name} (${d.email}) wrote:\n\n${d.body}\n\nReview it: ${siteConfig.url}/admin/comments`,
      });
    }
  });

  return { ok: true, message: "Thanks! Your comment is waiting for approval." };
}