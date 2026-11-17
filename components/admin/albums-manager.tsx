"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import {
  createAlbumAction,
  deleteAlbumAction,
  updateAlbumAction,
} from "@/app/admin/gallery/actions";
import { Button } from "@/components/ui/button";
import { albumFields } from "@/lib/gallery-schema";
import { cn } from "@/lib/utils";
import { FieldInput } from "./field-input";

export type AlbumRow = {
  id: string;
  title: string;
  values: Record<string, unknown>;
};

const inputCls =
  "w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm";

function AlbumCard({ row }: { row: AlbumRow }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(row.values);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex items-center gap-2 p-3">
        <button className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => setOpen(!open)}>
          <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} />
          <span className="truncate font-medium">{String(values.title || row.title)}</span>
          <span className={cn("text-xs", values.status === "published" ? "text-green-500" : "text-muted")}>
            {String(values.status)}
          </span>
        </button>
        <button
          disabled={pending}
          aria-label="Delete"
          className="rounded-md p-2 text-red-400 hover:bg-elevated"
          onClick={() => {
            if (!confirm("Delete this album? Its photos stay and become unassigned.")) return;
            start(async () => {
              const r = await deleteAlbumAction(row.id);
              if (!r.ok) alert(r.message);
            });
          }}
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          {albumFields.map((f) => (
            <FieldInput
              key={f.name}
              field={f}
              value={values[f.name]}
              onChange={(v) => setValues({ ...values, [f.name]: v })}
            />
          ))}
          <div className="flex items-center gap-3">
            <Button
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await updateAlbumAction(row.id, values);
                  setMsg({ ok: r.ok, text: r.message });
                })
              }
            >
              {pending ? "Saving..." : "Save album"}
            </Button>
            {msg && (
              <p className={msg.ok ? "text-sm text-green-500" : "text-sm text-red-400"}>
                {msg.text}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AlbumsManager({ rows }: { rows: AlbumRow[] }) {
  const [title, setTitle] = useState("");
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
            const r = await createAlbumAction(title);
            if (!r.ok) return setError(r.message);
            setTitle("");
          });
        }}
      >
        <input className={inputCls} placeholder="New album title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Button disabled={pending || title.trim().length < 2}>Add album</Button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
          No albums yet.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <AlbumCard key={r.id} row={r} />
          ))}
        </div>
      )}
    </div>
  );
}