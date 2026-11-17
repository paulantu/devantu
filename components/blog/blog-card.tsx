import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { PostCardData } from "@/lib/blog";

export function BlogCard({ post }: { post: PostCardData }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-primary"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-elevated">
        {post.coverUrl && (
          <Image
            src={post.coverUrl}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {post.categoryName && (
          <p className="font-mono text-xs text-primary">{post.categoryName}</p>
        )}
        <h3 className="mt-2 font-heading text-lg font-bold">{post.title}</h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
        )}
        <p className="mt-auto pt-4 font-mono text-xs text-muted">
          {formatDate(post.publishedAt)} · {post.readingMinutes} min read
        </p>
      </div>
    </Link>
  );
}