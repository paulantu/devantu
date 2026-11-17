"use client";

import { useState, useTransition } from "react";
import { updatePlanAction } from "@/app/admin/pricing/actions";
import { Button } from "@/components/ui/button";
import type { Field } from "@/lib/sections/registry";
import { FieldInput } from "./field-input";

const BASIC = [
  "name",
  "status",
  "serviceId",
  "billing",
  "priceUsd",
  "priceBdt",
  "customQuote",
  "highlighted",
  "badge",
];

export function PlanForm({
  id,
  initial,
  fields,
}: {
  id: string;
  initial: Record<string, unknown>;
  fields: Field[];
}) {
  const [values, setValues] = useState(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const basics = fields.filter((f) => BASIC.includes(f.name));
  const rest = fields.filter((f) => !BASIC.includes(f.name));

  const render = (f: Field) => (
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
              const r = await updatePlanAction(id, values);
              setMsg({ ok: r.ok, text: r.message });
            })
          }
        >
          {pending ? "Saving..." : "Save plan"}
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