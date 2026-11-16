import { Suspense } from "react";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { mediaFiles } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { MediaLibrary } from "@/components/admin/media-library";

async function MediaContent() {
  const { session, role } = await requireRole();
  const rows = await db
    .select()
    .from(mediaFiles)
    .orderBy(desc(mediaFiles.createdAt))
    .limit(300);

  const items = rows.map((r) => ({
    id: r.id,
    url: r.url,
    filename: r.filename,
    contentType: r.contentType,
    size: r.size,
    width: r.width,
    height: r.height,
    alt: r.alt,
    canManage: role !== "author" || r.uploadedBy === session.user.id,
  }));

  return (
    <>
      {!process.env.BLOB_READ_WRITE_TOKEN && (
        <p className="rounded-md border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-400">
          BLOB_READ_WRITE_TOKEN is missing in .env.local. Add it and restart the
          dev server.
        </p>
      )}
      <MediaLibrary items={items} />
    </>
  );
}

export default function MediaPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Media library</h1>
        <p className="text-sm text-muted">
          Images and files used across the site.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <MediaContent />
      </Suspense>
    </div>
  );
}