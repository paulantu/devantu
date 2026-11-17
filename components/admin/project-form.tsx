"use client";

import { useState, useTransition } from "react";
import { updateProjectAction } from "@/app/admin/projects/actions";
import { Button } from "@/components/ui/button";
import { projectFields } from "@/lib/projects-schema";
import { FieldInput } from "./field-input";

const BASIC = [
  "title",
  "slug",
  "status",
  "featured",
  "projectStatus",
  "progress",
  "year",
];

export function ProjectForm({
  id,
  initial,
  allServices,
  selectedServiceIds,
}: {
  id: string;
  initial: Record<string, unknown>;
  allServices: { id: string; title: string }[];
  selectedServiceIds: string[];
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [selected, setSelected] = useState<string[]>(selectedServiceIds);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const basics = projectFields.filter((f) => BASIC.includes(f.name));
  const rest = projectFields.filter((f) => !BASIC.includes(f.name));

  const render = (f: (typeof projectFields)[number]) => (
    <FieldInput
      key={f.name}
      field={f}
      value={values[f.name]}
      onChange={(v) => setValues({ ...values, [f.name]: v })}
    />
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="grid gap-4 rounded-lg border border-border bg-surface p-5 sm:grid-cols-2">
        {basics.map(render)}
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-surface p-5">
        <div>
          <h2 className="font-heading font-semibold">Services</h2>
          <p className="text-sm text-muted">
            This project appears on the pages of the services you tick.
          </p>
        </div>
        {allServices.length === 0 ? (
          <p className="text-sm text-muted">Create a service first.</p>
        ) : (
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {allServices.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-[var(--primary)]"
                  checked={selected.includes(s.id)}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked
                        ? [...selected, s.id]
                        : selected.filter((x) => x !== s.id),
                    )
                  }
                />
                {s.title}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-5 rounded-lg border border-border bg-surface p-5">
        {rest.map(render)}
      </div>

      <div className="flex items-center gap-3">
        <Button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await updateProjectAction(id, values, selected);
              setMsg({ ok: r.ok, text: r.message });
            })
          }
        >
          {pending ? "Saving..." : "Save project"}
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