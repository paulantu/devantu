import { cacheLife, cacheTag } from "next/cache";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { galleryAlbums, galleryItems } from "@/db/schema";
import { getEmbedUrl } from "@/lib/video";

export type GalleryItem = Awaited<ReturnType<typeof getGalleryItems>>[number];

export async function getGalleryItems() {
  "use cache";
  cacheTag("gallery");
  cacheLife("minutes");

  const rows = await db
    .select({
      id: galleryItems.id,
      type: galleryItems.type,
      imageUrl: galleryItems.imageUrl,
      videoUrl: galleryItems.videoUrl,
      thumbUrl: galleryItems.thumbUrl,
      width: galleryItems.width,
      height: galleryItems.height,
      caption: galleryItems.caption,
      location: galleryItems.location,
      takenOn: galleryItems.takenOn,
      albumId: galleryItems.albumId,
      albumSlug: galleryAlbums.slug,
      albumTitle: galleryAlbums.title,
    })
    .from(galleryItems)
    .leftJoin(galleryAlbums, eq(galleryAlbums.id, galleryItems.albumId))
    .where(
      and(
        eq(galleryItems.isVisible, true),
        or(isNull(galleryItems.albumId), eq(galleryAlbums.status, "published")),
      ),
    )
    .orderBy(desc(galleryItems.takenOn), desc(galleryItems.createdAt));

  return rows.map((r) => ({
    ...r,
    embedUrl: r.type === "video" ? (getEmbedUrl(r.videoUrl) ?? "") : "",
  }));
}

export async function getGalleryAlbums() {
  "use cache";
  cacheTag("gallery");
  cacheLife("minutes");

  const [albums, items] = await Promise.all([
    db
      .select()
      .from(galleryAlbums)
      .where(eq(galleryAlbums.status, "published"))
      .orderBy(desc(galleryAlbums.takenOn), galleryAlbums.title),
    getGalleryItems(),
  ]);

  return albums
    .map((a) => {
      const its = items.filter((i) => i.albumId === a.id);
      const first = its[0];
      return {
        id: a.id,
        slug: a.slug,
        title: a.title,
        description: a.description,
        takenOn: a.takenOn,
        count: its.length,
        cover:
          a.coverUrl || (first ? (first.type === "image" ? first.imageUrl : first.thumbUrl) : ""),
      };
    })
    .filter((a) => a.count > 0);
}