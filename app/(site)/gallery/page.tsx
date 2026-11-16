import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGalleryAlbums, getGalleryItems } from "@/lib/gallery";
import { getSiteSettings } from "@/lib/settings";
import { formatDate } from "@/lib/format";
import { GalleryFilters } from "@/components/gallery/gallery-filters";
import { GalleryGrid, type GalleryItemView } from "@/components/gallery/gallery-grid";
import { PageSections } from "@/components/sections/page-sections";

export const metadata: Metadata = { title: "Gallery" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const PAGE_SIZE = 24;

async function GalleryContent({ searchParams }: { searchParams: SP }) {
  const settings = await getSiteSettings();
  if (!settings.modules.gallery) notFound();

  const sp = await searchParams;
  const albumSlug = one(sp.album);
  const type = one(sp.type);
  const year = one(sp.year);
  const page = Math.max(1, parseInt(one(sp.page) ?? "1", 10) || 1);

  const [albums, all] = await Promise.all([getGalleryAlbums(), getGalleryItems()]);
  const album = albums.find((a) => a.slug === albumSlug);
  const years = [...new Set(all.map((i) => i.takenOn.slice(0, 4)).filter(Boolean))]
    .sort()
    .reverse();

  const filtered = all.filter(
    (i) =>
      (!albumSlug || i.albumSlug === albumSlug) &&
      (!type || i.type === type) &&
      (!year || i.takenOn.startsWith(year)),
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const views: GalleryItemView[] = visible.map((i) => ({
    id: i.id,
    type: i.type === "video" ? "video" : "image",
    src: i.type === "video" ? i.thumbUrl : i.imageUrl,
    fullSrc: i.imageUrl,
    embedUrl: i.embedUrl,
    width: i.width,
    height: i.height,
    caption: i.caption,
    location: i.location,
    date: i.takenOn,
  }));

  const pageHref = (n: number) => {
    const p = new URLSearchParams();
    if (albumSlug) p.set("album", albumSlug);
    if (type) p.set("type", type);
    if (year) p.set("year", year);
    if (n > 1) p.set("page", String(n));
    const qs = p.toString();
    return qs ? `/gallery?${qs}` : "/gallery";
  };

  const showAlbums = albums.length > 0 && !albumSlug && !type && !year;

  return (
    <section className="container-page py-16 md:py-24">
      {album ? (
        <>
          <Link href="/gallery" className="font-mono text-sm text-primary">
            ← gallery
          </Link>
          <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
            {album.title}
            <span className="text-primary">.</span>
          </h1>
          {album.description && <p className="mt-4 max-w-xl text-muted">{album.description}</p>}
          {album.takenOn && (
            <p className="mt-2 font-mono text-xs text-muted">{formatDate(new Date(album.takenOn))}</p>
          )}
        </>
      ) : (
        <>
          <p className="font-mono text-sm text-primary">gallery</p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
            Memories<span className="text-primary">.</span>
          </h1>
          <p className="mt-4 max-w-xl text-muted">
            Moments from work, travel and everything in between.
          </p>
        </>
      )}

      {showAlbums && (
        <div className="mt-12">
          <h2 className="mb-5 font-heading text-xl font-bold">Albums</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((a) => (
              <Link
                key={a.id}
                href={`/gallery?album=${a.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-primary"
              >
                <div className="relative aspect-[4/3] bg-elevated">
                  {a.cover && (
                    <Image
                      src={a.cover}
                      alt={a.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-heading font-bold">{a.title}</h3>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {a.count} item{a.count === 1 ? "" : "s"}
                    {a.takenOn && ` · ${formatDate(new Date(a.takenOn))}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className={showAlbums ? "mt-14" : "mt-10"}>
        {showAlbums && <h2 className="mb-5 font-heading text-xl font-bold">All memories</h2>}
        <Suspense fallback={null}>
          <GalleryFilters albums={albums.map((a) => ({ slug: a.slug, title: a.title }))} years={years} />
        </Suspense>
      </div>

      {views.length === 0 ? (
        <p className="mt-10 text-muted">
          {all.length === 0 ? "Photos will appear here soon." : "Nothing matches these filters."}
        </p>
      ) : (
        <div className="mt-8">
          <GalleryGrid items={views} />
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-3 text-sm">
          {current > 1 && (
            <Link href={pageHref(current - 1)} className="rounded-md border border-border px-4 py-2 hover:border-primary">
              ← Newer
            </Link>
          )}
          <span className="font-mono text-muted">
            {current} / {pages}
          </span>
          {current < pages && (
            <Link href={pageHref(current + 1)} className="rounded-md border border-border px-4 py-2 hover:border-primary">
              Older →
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}

export default function GalleryPage({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <Suspense fallback={<div className="container-page py-24" />}>
        <GalleryContent searchParams={searchParams} />
      </Suspense>
      <PageSections pageKey="gallery" />
    </>
  );
}