"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Star, Trash2 } from "lucide-react";
import { createPostAction, deletePostAction } from "@/app/admin/blog/actions";
import { Button } from "@/components/ui/button";

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  state: "draft" | "scheduled" | "published";
  featured: boolean;
  authorName: string | null;
  date: string;
};

const stateColor = {
  draft: "text-muted",
  scheduled: "text-amber-400",
  published: "text-green-500",
};

const inputCls =
  "w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm";

export function PostsList({
  rows,
  canCategories,
}: {
  rows: PostRow[];
  canCategories: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const icon = "rounded-md p-2 hover:bg-elevated disabled:opacity-40";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            start(async () => {
              const r = await createPostAction(title);
              if (!r.ok || !r.id) return setError(r.message);
              router.push(`/admin/blog/${r.id}`);
            });
          }}
        >
          <input
            className={inputCls}
            placeholder="New post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button disabled={pending || title.trim().length < 2}>Write post</Button>
        </form>
        {canCategories && (
          <Link href="/admin/blog/categories" className="text-sm text-primary underline">
            Manage categories
          </Link>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
          No posts yet.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-surface">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-2 p-3">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-medium">
                  {r.title}
                  {r.featured && <Star className="size-3.5 fill-primary text-primary" />}
                </p>
                <p className="truncate font-mono text-xs text-muted">
                  {r.authorName ?? "Unknown"} · {r.date}
                </p>
              </div>
              <span className={`text-xs ${stateColor[r.state]}`}>{r.state}</span>
              <Link href={`/admin/blog/${r.id}`} aria-label="Edit" className={icon}>
                <Pencil className="size-4" />
              </Link>
              <button
                disabled={pending}
                aria-label="Delete"
                className={`${icon} text-red-400`}
                onClick={() => {
                  if (!confirm(`Delete "${r.title}"?`)) return;
                  start(async () => {
                    const res = await deletePostAction(r.id);
                    if (!res.ok) alert(res.message);
                  });
                }}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}