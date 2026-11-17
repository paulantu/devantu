"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Check, Trash2, X } from "lucide-react";
import {
  deleteCommentAction,
  setCommentStatusAction,
} from "@/app/admin/comments/actions";
import { Button } from "@/components/ui/button";

export type CommentRow = {
  id: string;
  name: string;
  email: string;
  body: string;
  status: string;
  createdAt: string;
  postTitle: string;
  postSlug: string;
};

function CommentCard({ c }: { c: CommentRow }) {
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; message: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) alert(r.message);
    });

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium">
          {c.name} <span className="text-sm font-normal text-muted">· {c.email}</span>
        </p>
        <span className="font-mono text-xs text-muted">{c.createdAt}</span>
      </div>
      <p className="text-xs text-muted">
        On{" "}
        <Link href={`/blog/${c.postSlug}`} target="_blank" className="text-primary underline">
          {c.postTitle}
        </Link>
      </p>
      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{c.body}</p>
      <div className="flex flex-wrap items-center gap-2">
        {c.status !== "approved" && (
          <Button size="sm" disabled={pending} onClick={() => run(() => setCommentStatusAction(c.id, "approved"))}>
            <Check className="size-4" /> Approve
          </Button>
        )}
        {c.status !== "rejected" && (
          <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setCommentStatusAction(c.id, "rejected"))}>
            <X className="size-4" /> Reject
          </Button>
        )}
        <button
          disabled={pending}
          className="ml-auto flex items-center gap-1 rounded-md px-2 py-2 text-sm text-red-400 hover:bg-elevated"
          onClick={() => {
            if (confirm("Delete this comment permanently?")) run(() => deleteCommentAction(c.id));
          }}
        >
          <Trash2 className="size-4" /> Delete
        </button>
      </div>
    </div>
  );
}

export function CommentsManager({ rows }: { rows: CommentRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
        No comments here.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {rows.map((c) => (
        <CommentCard key={c.id} c={c} />
      ))}
    </div>
  );
}