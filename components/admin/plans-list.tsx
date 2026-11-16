"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Star, Trash2 } from "lucide-react";
import {
  createPlanAction,
  deletePlanAction,
  movePlanAction,
} from "@/app/admin/pricing/actions";
import { Button } from "@/components/ui/button";

export type PlanRow = {
  id: string;
  name: string;
  status: string;
  highlighted: boolean;
  serviceTitle: string | null;
};

const inputCls =
  "w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm";

export function PlansList({
  rows,
  canManage,
}: {
  rows: PlanRow[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
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
              const r = await createPlanAction(name);
              if (!r.ok || !r.id) return setError(r.message);
              router.push(`/admin/pricing/${r.id}`);
            });
          }}
        >
          <input
            className={inputCls}
            placeholder="New plan name (e.g. Business)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button disabled={pending || name.trim().length < 2}>Add plan</Button>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      )}

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
          No plans yet.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-surface">
          {rows.map((r, i) => (
            <div key={r.id} className="flex flex-wrap items-center gap-2 p-3">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-medium">
                  {r.name}
                  {r.highlighted && <Star className="size-3.5 fill-primary text-primary" />}
                </p>
                <p className="font-mono text-xs text-muted">
                  {r.serviceTitle ?? "General"}
                </p>
              </div>
              <span className={r.status === "published" ? "text-xs text-green-500" : "text-xs text-muted"}>
                {r.status}
              </span>
              {canManage && (
                <>
                  <button disabled={pending || i === 0} aria-label="Move up" className={icon} onClick={() => run(() => movePlanAction(r.id, -1))}>
                    <ArrowUp className="size-4" />
                  </button>
                  <button disabled={pending || i === rows.length - 1} aria-label="Move down" className={icon} onClick={() => run(() => movePlanAction(r.id, 1))}>
                    <ArrowDown className="size-4" />
                  </button>
                </>
              )}
              <Link href={`/admin/pricing/${r.id}`} aria-label="Edit" className={icon}>
                <Pencil className="size-4" />
              </Link>
              {canManage && (
                <button
                  disabled={pending}
                  aria-label="Delete"
                  className={`${icon} text-red-400`}
                  onClick={() => {
                    if (confirm(`Delete "${r.name}"?`)) run(() => deletePlanAction(r.id));
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