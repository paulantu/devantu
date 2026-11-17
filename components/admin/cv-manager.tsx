"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import {
  createCvEntryAction,
  deleteCvEntryAction,
  moveCvEntryAction,
  toggleCvEntryAction,
  updateCvEntryAction,
} from "@/app/admin/cv/actions";
import { Button } from "@/components/ui/button";
import { cvKindDefs, type CvKind } from "@/lib/cv-schema";
import { cn } from "@/lib/utils";
import { FieldInput } from "./field-input";

export type CvRow = {
  id: string;
  title: string;
  organization: string;
  isVisible: boolean;
  updatedAt: string;
  values: Record<string, unknown>;
};

function EntryEditor({ row, kind }: { row: CvRow; kind: CvKind }) {
  const def = cvKindDefs[kind];
  const [values, setValues] = useState(row.values);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="space-y-4 border-t border-border p-4">
      {def.fields.map((f) => (
        <FieldInput
          key={f.name}
          field={f}
          value={values[f.name]}
          disabled={f.name === "endDate" && values.current === true}
          onChange={(v) =>
            setValues(
              f.name === "current" && v === true
                ? { ...values, current: true, endDate: "" }
                : { ...values, [f.name]: v },
            )
          }
        />
      ))}
      <div className="flex items-center gap-3">
        <Button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await updateCvEntryAction(row.id, values);
              setMsg({ ok: r.ok, text: r.message });
            })
          }
        >
          {pending ? "Saving..." : "Save"}
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

function EntryCard({
  row,
  kind,
  first,
  last,
  open,
  onToggleOpen,
}: {
  row: CvRow;
  kind: CvKind;
  first: boolean;
  last: boolean;
  open: boolean;
  onToggleOpen: () => void;
}) {
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; message: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) alert(r.message);
    });
  const icon = "rounded-md p-2 hover:bg-elevated disabled:opacity-40";

  return (
    <div className={cn("rounded-lg border border-border bg-surface", !row.isVisible && "opacity-60")}>
      <div className="flex flex-wrap items-center gap-2 p-3">
        <button className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={onToggleOpen}>
          <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} />
          <span className="truncate font-medium">{row.title || "Untitled"}</span>
          {row.organization && (
            <span className="truncate text-sm text-muted">· {row.organization}</span>
          )}
          {!row.isVisible && <span className="text-xs text-muted">hidden</span>}
        </button>
        <button disabled={pending || first} aria-label="Move up" className={icon} onClick={() => run(() => moveCvEntryAction(row.id, -1))}>
          <ArrowUp className="size-4" />
        </button>
        <button disabled={pending || last} aria-label="Move down" className={icon} onClick={() => run(() => moveCvEntryAction(row.id, 1))}>
          <ArrowDown className="size-4" />
        </button>
        <button disabled={pending} aria-label="Show or hide" className={icon} onClick={() => run(() => toggleCvEntryAction(row.id, !row.isVisible))}>
          {row.isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
        <button
          disabled={pending}
          aria-label="Delete"
          className={`${icon} text-red-400`}
          onClick={() => {
            if (confirm("Delete this entry?")) run(() => deleteCvEntryAction(row.id));
          }}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      {open && <EntryEditor key={row.updatedAt} row={row} kind={kind} />}
    </div>
  );
}

export function CvManager({ kind, rows }: { kind: CvKind; rows: CvRow[] }) {
  const def = cvKindDefs[kind];
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await createCvEntryAction(kind);
              if (!r.ok || !r.id) alert(r.message);
              else setOpenId(r.id);
            })
          }
        >
          <Plus className="size-4" /> Add {def.label}
        </Button>
        <p className="text-sm text-muted">{def.hint}</p>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
          Nothing here yet.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <EntryCard
              key={r.id}
              row={r}
              kind={kind}
              first={i === 0}
              last={i === rows.length - 1}
              open={openId === r.id}
              onToggleOpen={() => setOpenId(openId === r.id ? null : r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}