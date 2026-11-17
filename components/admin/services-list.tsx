"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import {
  createServiceAction,
  deleteServiceAction,
  moveServiceAction,
} from "@/app/admin/services/actions";
import { Button } from "@/components/ui/button";

export type ServiceRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

const inputCls =
  "w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm";

export function ServicesList({
  rows,
  canManage,
}: {
  rows: ServiceRow[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const run = (fn: () => Promise<{ ok: boolean; message: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) alert(r.message);
    });

  const icon = "rounded-md p-2 hover:bg-elevated disabled:opacity-40";

  return (
    <div className="space-y-6">
      {canManage && (
        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            start(async () => {
              const r = await createServiceAction(title);
              if (!r.ok || !r.id) return setError(r.message);
              router.push(`/admin/services/${r.id}`);
            });
          }}
        >
          <input
            className={inputCls}
            placeholder="New service title (e.g. Web Design)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Button disabled={pending || title.trim().length < 2}>Add service</Button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      )}

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
          No services yet.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-surface">
          {rows.map((r, i) => (
            <div key={r.id} className="flex flex-wrap items-center gap-2 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{r.title}</p>
                <p className="font-mono text-xs text-muted">/services/{r.slug}</p>
              </div>
              <span
                className={
                  r.status === "published"
                    ? "text-xs text-green-500"
                    : "text-xs text-muted"
                }
              >
                {r.status}
              </span>
              {canManage && (
                <>
                  <button disabled={pending || i === 0} aria-label="Move up" className={icon} onClick={() => run(() => moveServiceAction(r.id, -1))}>
                    <ArrowUp className="size-4" />
                  </button>
                  <button disabled={pending || i === rows.length - 1} aria-label="Move down" className={icon} onClick={() => run(() => moveServiceAction(r.id, 1))}>
                    <ArrowDown className="size-4" />
                  </button>
                </>
              )}
              <Link href={`/admin/services/${r.id}`} aria-label="Edit" className={icon}>
                <Pencil className="size-4" />
              </Link>
              {canManage && (
                <button
                  disabled={pending}
                  aria-label="Delete"
                  className={`${icon} text-red-400`}
                  onClick={() => {
                    if (confirm(`Delete "${r.title}"?`)) run(() => deleteServiceAction(r.id));
                  }}
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}