"use client";

import { useState, useTransition } from "react";
import { saveProfileAction } from "@/app/admin/cv/actions";
import { Button } from "@/components/ui/button";
import { profileFields } from "@/lib/profile-fields";
import { FieldInput } from "./field-input";

export function ProfileForm({ initial }: { initial: Record<string, unknown> }) {
  const [values, setValues] = useState(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-5 rounded-lg border border-border bg-surface p-5">
        {profileFields.map((f) => (
          <FieldInput
            key={f.name}
            field={f}
            value={values[f.name]}
            onChange={(v) => setValues({ ...values, [f.name]: v })}
          />
        ))}
      </div>
      <p className="text-sm text-muted">
        Your name, job title, email, phone and links come from Settings.
      </p>
      <div className="flex items-center gap-3">
        <Button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await saveProfileAction(values);
              setMsg({ ok: r.ok, text: r.message });
            })
          }
        >
          {pending ? "Saving..." : "Save profile"}
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