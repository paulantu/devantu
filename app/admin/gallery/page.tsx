import { Suspense } from "react";
import Link from "next/link";
import { asc, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { galleryAlbums, galleryItems } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { GalleryAdmin } from "@/components/admin/gallery-admin";

async function GalleryContent({
  searchParams,
}: {
  searchParams: Promise<{ album?: string }>;
}) {
  await requireRole(["superadmin", "admin", "editor"]);
  const { album } = await searchParams;
  const valid = z.string().uuid().safeParse(album).success;
  const filter = album === "none" ? "none" : valid ? album! : "all";

  const albums = await db
    .select({ id: galleryAlbums.id, title: galleryAlbums.title })
    .from(galleryAlbums)
    .orderBy(asc(galleryAlbums.title));

  const rows = await db
    .select()
    .from(galleryItems)
    .where(
      filter === "all"
        ? undefined
        : filter === "none"
          ? isNull(galleryItems.albumId)
          : eq(galleryItems.albumId, filter),
    )
    .orderBy(desc(galleryItems.createdAt))
    .limit(200);

  return (
    <GalleryAdmin
      albums={albums}
      filter={filter}
      items={rows.map((r) => ({
        id: r.id,
        type: r.type,
        thumb: r.type === "image" ? r.imageUrl : r.thumbUrl,
        caption: r.caption,
        location: r.location,
        takenOn: r.takenOn,
        albumId: r.albumId ?? "",
        isVisible: r.isVisible,
      }))}
    />
  );
}

export default function GalleryAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ album?: string }>;
}) {
  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Gallery</h1>
        <p className="text-sm text-muted">
          Photos and videos for your memories page.{" "}
          <Link href="/admin/gallery/albums" className="text-primary underline">
            Manage albums
          </Link>
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <GalleryContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}