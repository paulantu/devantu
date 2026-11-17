"use server";

import { revalidatePath, updateTag } from "next/cache";
import { and, eq, inArray, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { blogCategories, blogPosts, blogPostTags, blogTags } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { slugify } from "@/lib/slug";
import { emptyDoc, readingMinutes } from "@/lib/blog-content";

export type BlogResult = { ok: boolean; message: string; id?: string };
const STAFF = ["superadmin", "admin", "editor", "author"] as const;
const MANAGERS = ["superadmin", "admin", "editor"] as const;
const fail = (message: string): BlogResult => ({ ok: false, message });

function refresh() {
  updateTag("blog");
  revalidatePath("/admin/blog");
}

async function uniquePostSlug(base: string, ignoreId?: string) {
  const root = base || "post";
  let slug = root;
  let n = 2;
  for (;;) {
    const hit = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(
        ignoreId
          ? and(eq(blogPosts.slug, slug), ne(blogPosts.id, ignoreId))
          : eq(blogPosts.slug, slug),
      );
    if (hit.length === 0) return slug;
    slug = `${root}-${n++}`;
  }
}

// Authors may only touch their own posts.
type LoadedPost =
  | { ok: false; message: string }
  | { ok: true; row: typeof blogPosts.$inferSelect; role: string };

// Authors may only touch their own posts.
async function loadPost(id: string): Promise<LoadedPost> {
  const { session, role } = await requireRole([...STAFF]);
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
  if (!row) return { ok: false, message: "Post not found" };
  if (role === "author" && row.authorId !== session.user.id) {
    return { ok: false, message: "You can only change your own posts" };
  }
  return { ok: true, row, role };
}

export async function createPostAction(title: string): Promise<BlogResult> {
  const { session } = await requireRole([...STAFF]);
  const t = title.trim();
  if (t.length < 2) return fail("Enter a post title");

  const slug = await uniquePostSlug(slugify(t));
  const [row] = await db
    .insert(blogPosts)
    .values({
      title: t.slice(0, 160),
      slug,
      authorId: session.user.id,
      content: emptyDoc,
    })
    .returning({ id: blogPosts.id });

  refresh();
  return { ok: true, message: "Created", id: row.id };
}

const postSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(160),
  slug: z.string().trim().max(100),
  excerpt: z.string().trim().max(300),
  coverUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https:\/\//.test(v), "Cover image must be a https link"),
  categoryId: z.union([z.literal(""), z.string().uuid()]),
  commentsEnabled: z.boolean(),
  tags: z.string().max(400),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  seoTitle: z.string().trim().max(70),
  seoDescription: z.string().trim().max(160),
  publishedAt: z.union([z.literal(""), z.string().datetime()]),
  content: z
    .object({ type: z.literal("doc"), content: z.array(z.unknown()).optional() })
    .passthrough(),
});

export async function updatePostAction(
  id: string,
  input: unknown,
): Promise<BlogResult> {
  const found = await loadPost(id);
    if (!found.ok) return fail(found.message);
  const { row: current, role } = found;

  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue?.path.length ? `${issue.path.join(" > ")}: ` : "";
    return fail(`${where}${issue?.message ?? "Invalid input"}`);
  }
  const d = parsed.data;
  if (JSON.stringify(d.content).length > 400_000) return fail("The post is too large");

  const slug = await uniquePostSlug(slugify(d.slug || d.title), id);

  let categoryId: string | null = null;
  if (d.categoryId) {
    const [cat] = await db
      .select({ id: blogCategories.id })
      .from(blogCategories)
      .where(eq(blogCategories.id, d.categoryId));
    categoryId = cat?.id ?? null;
  }

  const publishedAt = d.publishedAt
    ? new Date(d.publishedAt)
    : d.status === "published"
      ? new Date()
      : null;

  await db
    .update(blogPosts)
    .set({
      title: d.title,
      slug,
      excerpt: d.excerpt,
      coverUrl: d.coverUrl,
      content: d.content as Record<string, unknown>,
      status: d.status,
      // Only Editors and above can feature a post.
      featured: role === "author" ? current.featured : d.featured,
      commentsEnabled: d.commentsEnabled,
      publishedAt,
      categoryId,
      seoTitle: d.seoTitle,
      seoDescription: d.seoDescription,
      readingMinutes: readingMinutes(d.content),
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, id));

  // Tags: free text, comma separated.
  const seen = new Set<string>();
  const tagList: { slug: string; name: string }[] = [];
  for (const raw of d.tags.split(",")) {
    const name = raw.trim().slice(0, 30);
    const tagSlug = slugify(name);
    if (!name || !tagSlug || seen.has(tagSlug)) continue;
    seen.add(tagSlug);
    tagList.push({ slug: tagSlug, name });
    if (tagList.length === 8) break;
  }
  if (tagList.length > 0) {
    await db.insert(blogTags).values(tagList).onConflictDoNothing();
  }
  const tagRows =
    tagList.length > 0
      ? await db
          .select({ id: blogTags.id })
          .from(blogTags)
          .where(inArray(blogTags.slug, tagList.map((t) => t.slug)))
      : [];
  await db.delete(blogPostTags).where(eq(blogPostTags.postId, id));
  if (tagRows.length > 0) {
    await db
      .insert(blogPostTags)
      .values(tagRows.map((t) => ({ postId: id, tagId: t.id })));
  }

  refresh();
  return { ok: true, message: "Saved" };
}

export async function deletePostAction(id: string): Promise<BlogResult> {
  const found = await loadPost(id);
  if (!found.ok) return fail(found.message);
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  refresh();
  return { ok: true, message: "Deleted" };
}

export async function createCategoryAction(name: string): Promise<BlogResult> {
  await requireRole([...MANAGERS]);
  const n = name.trim().slice(0, 60);
  const slug = slugify(n);
  if (n.length < 2 || !slug) return fail("Enter a category name");

  const clash = await db
    .select({ id: blogCategories.id })
    .from(blogCategories)
    .where(eq(blogCategories.slug, slug));
  if (clash.length > 0) return fail("That category already exists");

  await db.insert(blogCategories).values({ name: n, slug });
  updateTag("blog");
  revalidatePath("/admin/blog/categories");
  return { ok: true, message: "Created" };
}

export async function renameCategoryAction(
  id: string,
  name: string,
): Promise<BlogResult> {
  await requireRole([...MANAGERS]);
  const n = name.trim().slice(0, 60);
  const slug = slugify(n);
  if (n.length < 2 || !slug) return fail("Enter a category name");

  const clash = await db
    .select({ id: blogCategories.id })
    .from(blogCategories)
    .where(and(eq(blogCategories.slug, slug), ne(blogCategories.id, id)));
  if (clash.length > 0) return fail("Another category already uses that name");

  await db.update(blogCategories).set({ name: n, slug }).where(eq(blogCategories.id, id));
  updateTag("blog");
  revalidatePath("/admin/blog/categories");
  return { ok: true, message: "Saved" };
}

export async function deleteCategoryAction(id: string): Promise<BlogResult> {
  await requireRole([...MANAGERS]);
  await db.delete(blogCategories).where(eq(blogCategories.id, id));
  updateTag("blog");
  revalidatePath("/admin/blog/categories");
  return { ok: true, message: "Deleted" };
}