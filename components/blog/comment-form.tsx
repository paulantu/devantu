"use client";

import { useActionState } from "react";
import { submitCommentAction, type CommentState } from "@/app/(site)/blog/actions";
import { Button } from "@/components/ui/button";
import { TurnstileField } from "@/components/site/turnstile-field";

const field =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";
const initial: CommentState = { ok: false, message: "" };

export function CommentForm({ postId }: { postId: string }) {
  const [state, action, pending] = useActionState(submitCommentAction, initial);
  const v = state.values ?? {};

  if (state.ok) {
    return <p className="text-sm text-green-500">{state.message}</p>;
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="postId" value={postId} />
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
        <input name="email" type="email" placeholder="Email (never shown)" required defaultValue={v.email} className={field} />
      </div>
      <textarea
        name="body"
        rows={4}
        required
        placeholder="Write your comment"
        defaultValue={v.body}
        className={field}
      />
      <TurnstileField resetSignal={state} />
      {state.message && <p className="text-sm text-red-400">{state.message}</p>}
      <Button disabled={pending}>{pending ? "Sending..." : "Post comment"}</Button>
    </form>
  );
}