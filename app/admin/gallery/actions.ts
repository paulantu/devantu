"use server";

import { revalidatePath, updateTag } from "next/cache";
import { and, eq, inArray, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { galleryAlbums, galleryItems, mediaFiles } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { slugify } from "@/lib/slug";
import { getVideoInfo } from "@/lib/video";
import { DATE_RE, albumSchema } from "@/lib/gallery-schema";

export type GalleryResult = { ok: boolean; message: string; id?: string };
const STAFF = ["superadmin", "admin", "editor"] as const;
const fail = (message: string): GalleryResult => ({ ok: false, message });
const today = () => new Date().toISOString().slice(0, 10);

function refresh() {
  updateTag("gallery");
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/gallery/albums");
}

async function validAlbumId(albumId: string) {
  if (!albumId) return null;
  const [a] = await db
    .select({ id: galleryAlbums.id })
    .from(galleryAlbums)
    .where(eq(galleryAlbums.id, albumId));
  return a?.id ?? null;
}

async function vimeoThumb(id: string) {
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${id}`)}`,
      { signal: AbortSignal.timeout(5000), cache: "no-store" },
    );
    if (!res.ok) return "";
    const data = (await res.json()) as { thumbnail_url?: string };
    const t = data.thumbnail_url ?? "";
    return /^https:\/\/[\w.-]+\.vimeocdn\.com\//.test(t) ? t : "";
  } catch {
    return "";
  }
}

export async function addGalleryImagesAction(
  urls: unknown,
  albumId: string,
): Promise<GalleryResult> {
  await requireRole([...STAFF]);
  const list = z.array(z.string().url()).min(1).max(60).safeParse(urls);
  if (!list.success) return fail("No photos selected");

  // Only files that exist in the media library are accepted.
  const media = await db
    .select({
      url: mediaFiles.url,
      width: mediaFiles.width,
      height: mediaFiles.height,
      contentType: mediaFiles.contentType,
    })
    .from(mediaFiles)
    .where(inArray(mediaFiles.url, list.data));
  const images = media.filter((m) => m.contentType.startsWith("image/"));
  if (images.length === 0) return fail("No valid images were selected");

  const album = await validAlbumId(albumId);
  await db.insert(galleryItems).values(
    images.map((m) => ({
      albumId: album,
      type: "image",
      imageUrl: m.url,
      width: m.width,
      height: m.height,
      takenOn: today(),
    })),
  );
  refresh();
  return { ok: true, message: `Added ${images.length} photo${images.length === 1 ? "" : "s"}` };
}

export async function addGalleryVideoAction(
  url: string,
  albumId: string,
): Promise<GalleryResult> {
  await requireRole([...STAFF]);
  const info = getVideoInfo(url.trim());
  if (!info) return fail("Paste a YouTube or Vimeo link");

  const thumb = info.thumb || (await vimeoThumb(info.id));
  const album = await validAlbumId(albumId);
  await db.insert(galleryItems).values({
    albumId: album,
    type: "video",
    videoUrl: url.trim(),
    thumbUrl: thumb,
    takenOn: today(),
  });
  refresh();
  return { ok: true, message: "Video added" };
}

const itemSchema = z.object({
  caption: z.string().trim().max(200),
  location: z.string().trim().max(100),
  takenOn: z.string().regex(DATE_RE, "Date must look like 2026-11-20"),
  albumId: z.union([z.literal(""), z.string().uuid()]),
  isVisible: z.boolean(),
});

export async function updateGalleryItemAction(
  id: string,
  input: unknown,
): Promise<GalleryResult> {
  await requireRole([...STAFF]);
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  const d = parsed.data;

  const album = await validAlbumId(d.albumId);
  await db
    .update(galleryItems)
    .set({
      caption: d.caption,
      location: d.location,
      takenOn: d.takenOn,
      albumId: album,
      isVisible: d.isVisible,
      updatedAt: new Date(),
    })
    .where(eq(galleryItems.id, id));
  refresh();
  return { ok: true, message: "Saved" };
}

export async function deleteGalleryItemAction(id: string): Promise<GalleryResult> {
  await requireRole([...STAFF]);
  await db.delete(galleryItems).where(eq(galleryItems.id, id));
  refresh();
  return { ok: true, message: "Deleted" };
}

async function uniqueAlbumSlug(base: string, ignoreId?: string) {
  const root = base || "album";
  let slug = root;
  let n = 2;
  for (;;) {
    const hit = await db
      .select({ id: galleryAlbums.id })
      .from(galleryAlbums)
      .where(
        ignoreId
          ? and(eq(galleryAlbums.slug, slug), ne(galleryAlbums.id, ignoreId))
          : eq(galleryAlbums.slug, slug),
      );
    if (hit.length === 0) return slug;
    slug = `${root}-${n++}`;
  }
}

export async function createAlbumAction(title: string): Promise<GalleryResult> {
  await requireRole([...STAFF]);
  const t = title.trim();
  if (t.length < 2) return fail("Enter an album title");
  const [row] = await db
    .insert(galleryAlbums)
    .values({ title: t.slice(0, 120), slug: await uniqueAlbumSlug(slugify(t)) })
    .returning({ id: galleryAlbums.id });
  refresh();
  return { ok: true, message: "Created", id: row.id };
}

export async function updateAlbumAction(
  id: string,
  input: unknown,
): Promise<GalleryResult> {
  await requireRole([...STAFF]);
  const parsed = albumSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(issue?.message ?? "Invalid input");
  }
  const d = parsed.data as {
    title: string;
    slug: string;
    status: string;
    takenOn: string;
    description: string;
    coverUrl: string;
  };

  if (d.title.trim().length < 2) return fail("Title is required");
  if (d.takenOn && !DATE_RE.test(d.takenOn)) return fail("Date must look like 2026-11-20");
  if (d.coverUrl && !/^https:\/\//.test(d.coverUrl)) return fail("Cover must be a https link");

  const slug = slugify(d.slug || d.title);
  if (!slug) return fail("Slug is required");
  const clash = await db
    .select({ id: galleryAlbums.id })
    .from(galleryAlbums)
    .where(and(eq(galleryAlbums.slug, slug), ne(galleryAlbums.id, id)));
  if (clash.length > 0) return fail("That slug is already used by another album");

  await db
    .update(galleryAlbums)
    .set({
      title: d.title.trim(),
      slug,
      status: d.status,
      takenOn: d.takenOn,
      description: d.description,
      coverUrl: d.coverUrl,
      updatedAt: new Date(),
    })
    .where(eq(galleryAlbums.id, id));
  refresh();
  return { ok: true, message: "Saved" };
}

export async function deleteAlbumAction(id: string): Promise<GalleryResult> {
  await requireRole([...STAFF]);
  await db.delete(galleryAlbums).where(eq(galleryAlbums.id, id));
  refresh();
  return { ok: true, message: "Deleted" };
}