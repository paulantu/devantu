import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPosts } from "@/lib/blog";
import { getSiteSettings } from "@/lib/settings";
import { formatDate } from "@/lib/format";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogFilters } from "@/components/blog/blog-filters";
import { PageSections } from "@/components/sections/page-sections";

export const metadata: Metadata = { title: "Blog" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const PAGE_SIZE = 9;

async function BlogContent({ searchParams }: { searchParams: SP }) {
  const settings = await getSiteSettings();
  if (!settings.modules.blog) notFound();

  const sp = await searchParams;
  const category = one(sp.category);
  const tag = one(sp.tag);
  const q = one(sp.q)?.toLowerCase().trim();
  const page = Math.max(1, parseInt(one(sp.page) ?? "1", 10) || 1);

  const all = await getPublishedPosts();

  const categories = [
    ...new Map(
      all
        .filter((p) => p.categorySlug)
        .map((p) => [p.categorySlug!, { slug: p.categorySlug!, name: p.categoryName! }]),
    ).values(),
  ];
  const tags = [
    ...new Map(all.flatMap((p) => p.tags).map((t) => [t.slug, t])).values(),
  ].sort((a, b) => a.name.localeCompare(b.name));

  const filtered = all.filter(
    (p) =>
      (!category || p.categorySlug === category) &&
      (!tag || p.tags.some((t) => t.slug === tag)) &&
      (!q || `${p.title} ${p.excerpt}`.toLowerCase().includes(q)),
  );

  const unfiltered = !q && !category && !tag && page === 1;
  const featured = unfiltered ? all.find((p) => p.featured) : undefined;
  const list = filtered.filter((p) => p.id !== featured?.id);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const pageHref = (n: number) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (category) p.set("category", category);
    if (tag) p.set("tag", tag);
    if (n > 1) p.set("page", String(n));
    const qs = p.toString();
    return qs ? `/blog?${qs}` : "/blog";
  };

  return (
    <section className="container-page py-16 md:py-24">
      <p className="font-mono text-sm text-primary">blog</p>
      <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
        Notes &amp; experience<span className="text-primary">.</span>
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        Things I&apos;ve learned building websites, written down.
      </p>

      <div className="mt-10">
        <Suspense fallback={null}>
          <BlogFilters categories={categories} tags={tags} />
        </Suspense>
      </div>

      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="group mt-10 grid overflow-hidden rounded-2xl border border-border bg-surface transition-colors hover:border-primary md:grid-cols-2"
        >
          <div className="relative aspect-[16/10] bg-elevated md:aspect-auto md:min-h-72">
            {featured.coverUrl && (
              <Image
                src={featured.coverUrl}
                alt={featured.title}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            )}
          </div>
          <div className="flex flex-col justify-center p-6 md:p-10">
            <p className="font-mono text-xs text-primary">
              Featured{featured.categoryName ? ` · ${featured.categoryName}` : ""}
            </p>
            <h2 className="mt-3 font-heading text-2xl font-bold md:text-3xl">
              {featured.title}
            </h2>
            {featured.excerpt && <p className="mt-3 text-muted">{featured.excerpt}</p>}
            <p className="mt-5 font-mono text-xs text-muted">
              {formatDate(featured.publishedAt)} · {featured.readingMinutes} min read
            </p>
          </div>
        </Link>
      )}

      {visible.length === 0 && !featured ? (
        <p className="mt-12 text-muted">
          {all.length === 0 ? "Posts will appear here soon." : "No posts match these filters."}
        </p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <BlogCard key={p.id} post={p} />
          ))}
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

export default function BlogPage({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <Suspense fallback={<div className="container-page py-24" />}>
        <BlogContent searchParams={searchParams} />
      </Suspense>
      <PageSections pageKey="blog" />
    </>
  );
}