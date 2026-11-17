"use client";

import { useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Eye,
  EyeOff,
  Plus,
  Trash2,
} from "lucide-react";
import {
  addSectionAction,
  deleteSectionAction,
  moveSectionAction,
  seedHomeLayoutAction,
  toggleSectionAction,
  updateSectionAction,
} from "@/app/admin/sections/actions";
import { Button } from "@/components/ui/button";
import { sectionDefs, sectionList } from "@/lib/sections/registry";
import { cn } from "@/lib/utils";
import { FieldInput, inputClass } from "./field-input";

export type SectionRow = {
  id: string;
  type: string;
  title: string;
  isVisible: boolean;
  config: Record<string, unknown>;
  updatedAt: string;
};

type Values = Record<string, unknown>;

function SectionEditor({ row }: { row: SectionRow }) {
  const def = sectionDefs[row.type];
  const [title, setTitle] = useState(row.title);
  const [values, setValues] = useState<Values>({ ...def?.defaults, ...row.config });
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!def) return <p className="text-sm text-red-400">Unknown section type.</p>;

  return (
    <div className="space-y-4 border-t border-border p-4">
      <label className="block space-y-1.5 text-sm">
        <span className="text-muted">Admin label (only you see this)</span>
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      {def.fields.map((f) => (
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
              const r = await updateSectionAction(row.id, title, values);
              setMsg({ ok: r.ok, text: r.message });
            })
          }
        >
          {pending ? "Saving..." : "Save section"}
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

function SectionCard({
  row,
  first,
  last,
}: {
  row: SectionRow;
  first: boolean;
  last: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const def = sectionDefs[row.type];

  const run = (fn: () => Promise<{ ok: boolean; message: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) alert(r.message);
    });

  const icon = "rounded-md p-2 hover:bg-elevated disabled:opacity-40";

  return (
    <div className={cn("rounded-lg border border-border bg-surface", !row.isVisible && "opacity-60")}>
      <div className="flex flex-wrap items-center gap-2 p-3">
        <button className="flex flex-1 items-center gap-2 text-left" onClick={() => setOpen(!open)}>
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          <span className="font-medium">{row.title || def?.label}</span>
          <span className="rounded bg-elevated px-2 py-0.5 font-mono text-xs text-muted">
            {def?.label ?? row.type}
          </span>
          {!row.isVisible && <span className="text-xs text-muted">hidden</span>}
        </button>
        <button disabled={pending || first} aria-label="Move up" className={icon} onClick={() => run(() => moveSectionAction(row.id, -1))}>
          <ArrowUp className="size-4" />
        </button>
        <button disabled={pending || last} aria-label="Move down" className={icon} onClick={() => run(() => moveSectionAction(row.id, 1))}>
          <ArrowDown className="size-4" />
        </button>
        <button disabled={pending} aria-label="Show or hide" className={icon} onClick={() => run(() => toggleSectionAction(row.id, !row.isVisible))}>
          {row.isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
        <button
          disabled={pending}
          aria-label="Delete"
          className={`${icon} text-red-400`}
          onClick={() => {
            if (confirm("Delete this section?")) run(() => deleteSectionAction(row.id));
          }}
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      {open && <SectionEditor key={row.updatedAt} row={row} />}
    </div>
  );
}

export function SectionManager({
  pageKey,
  sections,
}: {
  pageKey: string;
  sections: SectionRow[];
}) {
  const [type, setType] = useState(sectionList[0].type);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select className={`${inputClass} max-w-60`} value={type} onChange={(e) => setType(e.target.value)}>
          {sectionList.map((d) => (
            <option key={d.type} value={d.type}>
              {d.label}
            </option>
          ))}
        </select>
        <Button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await addSectionAction(pageKey, type);
              if (!r.ok) alert(r.message);
            })
          }
        >
          <Plus className="size-4" /> Add section
        </Button>
        <p className="text-sm text-muted">{sectionDefs[type]?.description}</p>
      </div>

      {sections.length === 0 ? (
        <div className="space-y-4 rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted">No sections on this page yet.</p>
          {pageKey === "home" && (
            <Button
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await seedHomeLayoutAction();
                  if (!r.ok) alert(r.message);
                })
              }
            >
              Load starter layout
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((s, i) => (
            <SectionCard key={s.id} row={s} first={i === 0} last={i === sections.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}