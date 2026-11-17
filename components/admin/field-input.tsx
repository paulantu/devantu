"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Field } from "@/lib/sections/registry";
import { MediaPicker } from "./media-picker";

type Values = Record<string, unknown>;

export const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

export function emptyValues(fields: Field[]): Values {
  const v: Values = {};
  for (const f of fields) {
    v[f.name] =
      f.kind === "list"
        ? []
        : f.kind === "boolean"
          ? false
          : f.kind === "select"
            ? f.options[0].value
            : "";
  }
  return v;
}

function swap<T>(arr: T[], i: number, dir: -1 | 1) {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

export function FieldInput({
  field,
  value,
  onChange,
  disabled = false,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  disabled?: boolean;
}) {
  if (field.kind === "list") {
    const items = (Array.isArray(value) ? value : []) as Values[];
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted">{field.label}</p>
        {items.map((item, i) => (
          <div key={i} className="space-y-2 rounded-md border border-border p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted">
                {field.itemLabel} {i + 1}
              </span>
              <div className="flex gap-1">
                <button type="button" aria-label="Move up" className="rounded p-1 hover:bg-elevated" onClick={() => onChange(swap(items, i, -1))}>
                  <ArrowUp className="size-3.5" />
                </button>
                <button type="button" aria-label="Move down" className="rounded p-1 hover:bg-elevated" onClick={() => onChange(swap(items, i, 1))}>
                  <ArrowDown className="size-3.5" />
                </button>
                <button type="button" aria-label="Remove" className="rounded p-1 text-red-400 hover:bg-elevated" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
            {field.fields.map((sub) => (
              <FieldInput
                key={sub.name}
                field={sub}
                value={item[sub.name]}
                onChange={(v) =>
                  onChange(items.map((it, idx) => (idx === i ? { ...it, [sub.name]: v } : it)))
                }
              />
            ))}
          </div>
        ))}
        {items.length < field.max && (
          <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, emptyValues(field.fields)])}>
            <Plus className="size-4" /> Add {field.itemLabel.toLowerCase()}
          </Button>
        )}
      </div>
    );
  }

  if (field.kind === "image") {
    const url = String(value ?? "");
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted">{field.label}</p>
        {url && (
          <div className="relative h-40 w-64 overflow-hidden rounded-md border border-border">
            <Image src={url} alt="" fill sizes="256px" className="object-cover" />
          </div>
        )}
        <div className="flex gap-2">
          <MediaPicker onSelect={(u) => onChange(u)} label={url ? "Change image" : "Choose image"} />
          {url && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
              Remove
            </Button>
          )}
        </div>
      </div>
    );
  }

  const cls = `${inputClass} disabled:cursor-not-allowed disabled:opacity-50`;
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-muted">{field.label}</span>
      {field.kind === "textarea" ? (
        <textarea rows={4} disabled={disabled} className={cls} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      ) : field.kind === "select" ? (
        <select disabled={disabled} className={cls} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.kind === "boolean" ? (
        <input type="checkbox" disabled={disabled} className="block size-4 accent-[var(--primary)]" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
      ) : (
        <input disabled={disabled} className={cls} placeholder={field.kind === "link" ? "/contact or https://..." : undefined} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}