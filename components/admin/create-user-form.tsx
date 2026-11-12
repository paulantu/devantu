"use client";

import { useActionState } from "react";
import {
  createUserAction,
  type ActionState,
} from "@/app/admin/users/actions";
import { Button } from "@/components/ui/button";

const initial: ActionState = { ok: false, message: "" };
const field =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUserAction, initial);

  return (
    <form
      action={action}
      className="space-y-4 rounded-lg border border-border bg-surface p-5"
    >
      <h2 className="font-heading font-semibold">Add a team member</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" placeholder="Full name" required className={field} />
        <input name="email" type="email" placeholder="Email" required className={field} />
        <input
          name="password"
          type="text"
          placeholder="Temporary password (10+ chars)"
          required
          minLength={10}
          className={field}
        />
        <select name="role" defaultValue="author" className={field}>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="author">Author</option>
        </select>
      </div>
      <div className="flex items-center gap-3">
        <Button disabled={pending}>{pending ? "Creating..." : "Create user"}</Button>
        {state.message && (
          <p className={state.ok ? "text-sm text-green-500" : "text-sm text-red-400"}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}