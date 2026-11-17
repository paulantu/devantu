"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
  renameCategoryAction,
} from "@/app/admin/blog/actions";
import { Button } from "@/components/ui/button";

type Cat = { id: string; name: string; slug: string };

const inputCls =
  "w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm";

function Row({ cat }: { cat: Cat }) {
  const [name, setName] = useState(cat.name);
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2 p-3">
      <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
      <span className="font-mono text-xs text-muted">/{cat.slug}</span>
      <Button
        size="sm"
        variant="outline"
        disabled={pending || name === cat.name}
        onClick={() =>
          start(async () => {
            const r = await renameCategoryAction(cat.id, name);
            if (!r.ok) alert(r.message);
          })
        }
      >
        Save
      </Button>
      <button
        disabled={pending}
        aria-label="Delete"
        className="ml-auto rounded-md p-2 text-red-400 hover:bg-elevated"
        onClick={() => {
          if (!confirm(`Delete "${cat.name}"? Posts in it become uncategorized.`)) return;
          start(async () => {
            const r = await deleteCategoryAction(cat.id);
            if (!r.ok) alert(r.message);
          });
        }}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

export function CategoriesManager({ rows }: { rows: Cat[] }) {
  const [name, setName] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="max-w-2xl space-y-6">
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          start(async () => {
            const r = await createCategoryAction(name);
            if (!r.ok) return setError(r.message);
            setName("");
          });
        }}
      >
        <input className={inputCls} placeholder="New category" value={name} onChange={(e) => setName(e.target.value)} />
        <Button disabled={pending || name.trim().length < 2}>Add category</Button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
          No categories yet.
        </p>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-surface">
          {rows.map((c) => (
            <Row key={c.id} cat={c} />
          ))}
        </div>
      )}
    </div>
  );
}