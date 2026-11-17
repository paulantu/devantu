"use client";

import { useActionState, useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  submitQuoteAction,
  type QuoteState,
} from "@/app/(site)/pricing/actions";
import { Button, buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TurnstileField } from "./turnstile-field";

const field =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";
const initial: QuoteState = { ok: false, message: "" };

function QuoteForm({
  plan,
  onClose,
}: {
  plan?: { id: string; name: string };
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState(submitQuoteAction, initial);
  const v = state.values ?? {};

  if (state.ok) {
    return (
      <div className="space-y-4 p-6 text-center">
        <h3 className="font-heading text-xl font-bold">Request sent</h3>
        <p className="text-muted">{state.message}</p>
        <Button onClick={onClose}>Close</Button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 p-6">
      <input type="hidden" name="planId" value={plan?.id ?? ""} />
      {/* Honeypot, hidden from people */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" placeholder="Your name" required defaultValue={v.name} className={field} />
        <input name="email" type="email" placeholder="Email" required defaultValue={v.email} className={field} />
        <input name="phone" placeholder="Phone or WhatsApp" defaultValue={v.phone} className={field} />
        <input name="budget" placeholder="Budget (e.g. $500 - $1000)" defaultValue={v.budget} className={field} />
      </div>
      <input name="deadline" placeholder="Deadline (e.g. within 1 month)" defaultValue={v.deadline} className={field} />
      <textarea
        name="details"
        rows={5}
        required
        placeholder="Tell me about your project"
        defaultValue={v.details}
        className={field}
      />

      <TurnstileField resetSignal={state} />
      {state.message && <p className="text-sm text-red-400">{state.message}</p>}
      <Button disabled={pending} className="w-full">
        {pending ? "Sending..." : "Send request"}
      </Button>
    </form>
  );
}

export function QuoteDialog({
  plan,
  label = "Choose package",
  variant = "primary",
  className,
}: {
  plan?: { id: string; name: string };
  label?: string;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(buttonStyles({ variant }), className)}
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h3 className="font-heading text-lg font-bold">Request a quote</h3>
                {plan && <p className="font-mono text-xs text-primary">{plan.name}</p>}
              </div>
              <button
                aria-label="Close"
                className="rounded p-1 hover:bg-elevated"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>
            <QuoteForm plan={plan} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}