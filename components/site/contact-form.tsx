"use client";

import { useActionState } from "react";
import {
  submitContactAction,
  type ContactState,
} from "@/app/(site)/contact/actions";
import { Button } from "@/components/ui/button";
import { TurnstileField } from "./turnstile-field";
import { useSearchParams } from "next/navigation";

const field =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";
const initial: ContactState = { ok: false, message: "" };

const budgets = [
  "Under $300",
  "$300 - $1,000",
  "$1,000 - $3,000",
  "$3,000+",
  "Not sure yet",
];

export function ContactForm({
  services,
}: {
  services: { slug: string; title: string }[];
}) {
  const [state, action, pending] = useActionState(submitContactAction, initial);
  const params = useSearchParams();
  const fromUrl =
    services.find((s) => s.slug === params.get("service"))?.title ?? "";
  const v = state.values ?? {};

  if (state.ok) {
    return (
      <div className="space-y-2 py-10 text-center">
        <h3 className="font-heading text-xl font-bold">Message sent</h3>
        <p className="text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
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
        <input name="phone" placeholder="Phone or WhatsApp (optional)" defaultValue={v.phone} className={field} />
        <select key={fromUrl} name="service" defaultValue={v.service ?? fromUrl} className={field}>
          <option value="">Service of interest</option>
          {services.map((s) => (
            <option key={s.slug} value={s.title}>
              {s.title}
            </option>
          ))}
          <option value="Something else">Something else</option>
        </select>
      </div>

      <select name="budget" defaultValue={v.budget ?? ""} className={field}>
        <option value="">Budget range (optional)</option>
        {budgets.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>

      <textarea
        name="message"
        rows={6}
        required
        placeholder="Tell me about your project"
        defaultValue={v.message}
        className={field}
      />

      <TurnstileField resetSignal={state} />
      {state.message && <p className="text-sm text-red-400">{state.message}</p>}
      <Button disabled={pending} size="lg">
        {pending ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}