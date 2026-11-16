import { Suspense } from "react";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { galleryAlbums } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { AlbumsManager } from "@/components/admin/albums-manager";

async function AlbumsContent() {
  await requireRole(["superadmin", "admin", "editor"]);
  const rows = await db
    .select()
    .from(galleryAlbums)
    .orderBy(desc(galleryAlbums.takenOn), desc(galleryAlbums.createdAt));

  return (
    <AlbumsManager
      rows={rows.map((r) => ({
        id: r.id,
        title: r.title,
        values: {
          title: r.title,
          slug: r.slug,
          status: r.status,
          takenOn: r.takenOn,
          description: r.description,
          coverUrl: r.coverUrl,
        },
      }))}
    />
  );
}

export default function AlbumsPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/gallery" className="text-sm text-muted hover:text-primary">
          ← Gallery
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold">Albums</h1>
        <p className="text-sm text-muted">
          Only published albums with at least one visible item show on the site.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <AlbumsContent />
      </Suspense>
    </div>
  );
}