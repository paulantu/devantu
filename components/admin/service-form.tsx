"use client";

import { useState, useTransition } from "react";
import { updateServiceAction } from "@/app/admin/services/actions";
import { Button } from "@/components/ui/button";
import { serviceFields } from "@/lib/services-schema";
import { FieldInput } from "./field-input";

const BASIC = ["title", "slug", "status", "icon"];

export function ServiceForm({
  id,
  initial,
  role,
}: {
  id: string;
  initial: Record<string, unknown>;
  role: string;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Editors can change content, not the URL or publish state.
  const fields = serviceFields.filter(
    (f) => !(role === "editor" && (f.name === "slug" || f.name === "status")),
  );
  const basics = fields.filter((f) => BASIC.includes(f.name));
  const rest = fields.filter((f) => !BASIC.includes(f.name));

  const render = (f: (typeof fields)[number]) => (
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
      <div className="space-y-5 rounded-lg border border-border bg-surface p-5">
        {rest.map(render)}
      </div>
      <div className="flex items-center gap-3">
        <Button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await updateServiceAction(id, values);
              setMsg({ ok: r.ok, text: r.message });
            })
          }
        >
          {pending ? "Saving..." : "Save service"}
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