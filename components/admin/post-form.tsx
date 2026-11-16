"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { JSONContent } from "@tiptap/react";
import { updatePostAction } from "@/app/admin/blog/actions";
import { Button } from "@/components/ui/button";
import { FieldInput, inputClass } from "./field-input";
import { RichEditor } from "./rich-editor";

type Initial = {
  title: string;
  slug: string;
  excerpt: string;
  coverUrl: string;
  categoryId: string;
  tags: string;
  status: string;
  featured: boolean;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
  content: JSONContent;
  commentsEnabled: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");
function toLocalInput(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-muted">{text}</span>
      {children}
    </label>
  );
}

export function PostForm({
  id,
  initial,
  categories,
  canFeature,
}: {
  id: string;
  initial: Initial;
  categories: { id: string; name: string }[];
  canFeature: boolean;
}) {
  const [v, setV] = useState(initial);
  const [publishedLocal, setPublishedLocal] = useState("");
  const contentRef = useRef<JSONContent>(initial.content);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Local time zone is only known in the browser.
  useEffect(() => {
    setPublishedLocal(toLocalInput(initial.publishedAt));
  }, [initial.publishedAt]);

  const set = <K extends keyof Initial>(key: K, value: Initial[K]) =>
    setV((p) => ({ ...p, [key]: value }));

  function save() {
    if (publishedLocal && Number.isNaN(new Date(publishedLocal).getTime())) {
      return setMsg({ ok: false, text: "The publish date is not valid" });
    }
    start(async () => {
      const r = await updatePostAction(id, {
        title: v.title,
        slug: v.slug,
        excerpt: v.excerpt,
        coverUrl: v.coverUrl,
        categoryId: v.categoryId,
        tags: v.tags,
        status: v.status,
        featured: v.featured,
        commentsEnabled: v.commentsEnabled,
        seoTitle: v.seoTitle,
        seoDescription: v.seoDescription,
        publishedAt: publishedLocal ? new Date(publishedLocal).toISOString() : "",
        content: contentRef.current,
      });
      setMsg({ ok: r.ok, text: r.message });
    });
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="space-y-4 rounded-lg border border-border bg-surface p-5">
        <Label text="Title">
          <input className={inputClass} value={v.title} onChange={(e) => set("title", e.target.value)} />
        </Label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Label text="URL slug">
            <input className={inputClass} value={v.slug} onChange={(e) => set("slug", e.target.value)} />
          </Label>
          <Label text="Category">
            <select className={inputClass} value={v.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Label>
        </div>
        <Label text="Tags (comma separated, up to 8)">
          <input className={inputClass} placeholder="wordpress, elementor, performance" value={v.tags} onChange={(e) => set("tags", e.target.value)} />
        </Label>
        <Label text="Excerpt (shown on cards and in search results)">
          <textarea rows={3} className={inputClass} value={v.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
        </Label>
        <FieldInput
          field={{ name: "coverUrl", label: "Cover image", kind: "image" }}
          value={v.coverUrl}
          onChange={(x) => set("coverUrl", String(x))}
        />
      </div>

      <RichEditor
        initial={initial.content}
        onChange={(doc) => {
          contentRef.current = doc;
        }}
      />

      <div className="grid gap-4 rounded-lg border border-border bg-surface p-5 sm:grid-cols-2">
        <Label text="Status">
          <select className={inputClass} value={v.status} onChange={(e) => set("status", e.target.value)}>
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published</option>
          </select>
        </Label>
        <Label text="Publish date (a future date schedules the post)">
          <input type="datetime-local" className={inputClass} value={publishedLocal} onChange={(e) => setPublishedLocal(e.target.value)} />
        </Label>
        {canFeature && (
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" className="size-4 accent-[var(--primary)]" checked={v.featured} onChange={(e) => set("featured", e.target.checked)} />
            Featured post (shown large at the top of the blog)
          </label>
        )}
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" className="size-4 accent-[var(--primary)]" checked={v.commentsEnabled} onChange={(e) => set("commentsEnabled", e.target.checked)} />
          Allow comments on this post
        </label>
        <Label text="SEO title (optional)">
          <input className={inputClass} value={v.seoTitle} onChange={(e) => set("seoTitle", e.target.value)} />
        </Label>
        <Label text="SEO description (optional)">
          <input className={inputClass} value={v.seoDescription} onChange={(e) => set("seoDescription", e.target.value)} />
        </Label>
      </div>

      <div className="flex items-center gap-3">
        <Button disabled={pending} onClick={save}>
          {pending ? "Saving..." : "Save post"}
        </Button>
        {msg && (
          <p className={msg.ok ? "text-sm text-green-500" : "text-sm text-red-400"}>
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
}