import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPublishedPosts } from "@/lib/blog";
import { collectHeadings } from "@/lib/blog-content";
import { formatDate } from "@/lib/format";
import { getSiteSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site-config";
import { BlogCard } from "@/components/blog/blog-card";
import { RichContent } from "@/components/blog/rich-content";
import { ShareButtons } from "@/components/blog/share-buttons";

import { CommentsSection } from "@/components/blog/comments-section";
import { NewsletterForm } from "@/components/site/newsletter-form";

import { JsonLd } from "@/components/seo/json-ld";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    openGraph: {
      type: "article",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      publishedTime: post.publishedAt.toISOString(),
      images: [post.coverUrl || `/og?title=${encodeURIComponent(post.title)}`],
    },
  };
}

async function PostContent({ params }: Props) {
  const { slug } = await params;
  const settings = await getSiteSettings();
  if (!settings.modules.blog) notFound();

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const all = await getPublishedPosts();
  const related = all
    .filter(
      (p) =>
        p.id !== post.id &&
        ((post.categoryId && p.categoryId === post.categoryId) ||
          p.tags.some((t) => post.tags.some((pt) => pt.slug === t.slug))),
    )
    .slice(0, 3);

  const headings = collectHeadings(post.content);
  const isOwner = post.authorRole === "superadmin";
  const { general, profile } = settings;
  const authorName = isOwner ? general.name : post.authorName;
  const url = `${siteConfig.url}/blog/${post.slug}`;

  const showComments = settings.blog.comments && post.commentsEnabled;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.seoDescription || post.excerpt,
          datePublished: post.publishedAt.toISOString(),
          image: post.coverUrl || undefined,
          author: { "@type": "Person", name: authorName ?? general.name },
          mainEntityOfPage: url,
        }}
      />
        <article className="container-page max-w-4xl pb-16 pt-16 md:pb-24 md:pt-24">
        <Link href="/blog" className="font-mono text-sm text-primary">
          ← blog
        </Link>

        {post.categoryName && (
          <p className="mt-6">
            <Link
              href={`/blog?category=${post.categorySlug}`}
              className="rounded-full border border-border px-3 py-1 font-mono text-xs hover:border-primary hover:text-primary"
            >
              {post.categoryName}
            </Link>
          </p>
        )}
        <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
          {post.title}
        </h1>
        <p className="mt-4 font-mono text-sm text-muted">
          {authorName && `${authorName} · `}
          {formatDate(post.publishedAt)} · {post.readingMinutes} min read
        </p>

        {post.coverUrl && (
          <div className="relative mt-10 aspect-video overflow-hidden rounded-2xl border border-border">
            <Image
              src={post.coverUrl}
              alt={post.title}
              fill
              priority
              sizes="(min-width: 1024px) 896px, 100vw"
              className="object-cover"
            />
          </div>
        )}

        {headings.length >= 3 && (
          <nav className="mt-10 rounded-xl border border-border bg-surface p-5">
            <p className="font-mono text-xs text-muted">On this page</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {headings.map((h) => (
                <li key={h.id} className={h.level === 3 ? "pl-4" : undefined}>
                  <a href={`#${h.id}`} className="text-muted hover:text-primary">
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="mt-10">
          <RichContent doc={post.content} />
        </div>

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <Link
                key={t.slug}
                href={`/blog?tag=${t.slug}`}
                className="rounded-full bg-elevated px-3 py-1 font-mono text-xs text-muted hover:text-primary"
              >
                #{t.name}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 border-t border-border pt-6">
          <ShareButtons url={url} title={post.title} />
        </div>

        {authorName && (
          <div className="mt-10 flex items-start gap-4 rounded-xl border border-border bg-surface p-5">
            {isOwner && profile.photoUrl && (
              <div className="relative size-16 shrink-0 overflow-hidden rounded-full">
                <Image src={profile.photoUrl} alt={authorName} fill sizes="64px" className="object-cover" />
              </div>
            )}
            <div>
              <p className="font-mono text-xs text-muted">Written by</p>
              <p className="font-heading font-semibold">{authorName}</p>
              {isOwner && profile.summary && (
                <p className="mt-1 text-sm text-muted">{profile.summary}</p>
              )}
            </div>
          </div>
        )}

                {settings.blog.newsletterBox && (
          <div className="mt-10 rounded-xl border border-border bg-elevated p-6 text-center">
            <h2 className="font-heading text-xl font-bold">Get new posts by email</h2>
            <p className="mb-4 mt-1 text-sm text-muted">
              No spam. Unsubscribe any time.
            </p>
            <NewsletterForm source="blog" />
          </div>
        )}

        {showComments && (
          <Suspense fallback={null}>
            <CommentsSection postId={post.id} />
          </Suspense>
        )}
      </article>

      {related.length > 0 && (
        <section className="container-page pb-16 md:pb-24">
          <h2 className="font-heading text-2xl font-bold">Keep reading</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default function PostPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="container-page py-24" />}>
      <PostContent params={params} />
    </Suspense>
  );
}