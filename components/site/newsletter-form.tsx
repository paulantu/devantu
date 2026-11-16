"use client";

import { useActionState } from "react";
import {
  subscribeAction,
  type NewsletterState,
} from "@/app/(site)/newsletter/actions";
import { Button } from "@/components/ui/button";
import { TurnstileField } from "./turnstile-field";

const initial: NewsletterState = { ok: false, message: "" };

export function NewsletterForm({
  source,
  buttonLabel = "Subscribe",
}: {
  source: string;
  buttonLabel?: string;
}) {
  const [state, action, pending] = useActionState(subscribeAction, initial);

  if (state.ok) {
    return <p className="text-sm text-green-500">{state.message}</p>;
  }

  return (
    <form action={action} className="mx-auto max-w-md space-y-3">
      <input type="hidden" name="source" value={source} />
      {/* Honeypot, hidden from people */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          defaultValue={state.values?.email}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
        <Button disabled={pending}>{pending ? "..." : buttonLabel}</Button>
      </div>
      <TurnstileField resetSignal={state} />
      {state.message && <p className="text-sm text-red-400">{state.message}</p>}
    </form>
  );
}