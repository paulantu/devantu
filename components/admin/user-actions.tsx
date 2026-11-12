"use client";

import { useTransition } from "react";
import {
  removeUserAction,
  setRoleAction,
  toggleBanAction,
} from "@/app/admin/users/actions";

type Result = { ok: boolean; message: string };

export function UserActions({
  id,
  role,
  banned,
  locked,
}: {
  id: string;
  role: string;
  banned: boolean;
  locked: boolean;
}) {
  const [pending, start] = useTransition();

  if (locked) return <span className="text-xs text-muted">Protected</span>;

  const run = (fn: () => Promise<Result>) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) alert(res.message);
    });

  const small =
    "rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-elevated disabled:opacity-60";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        disabled={pending}
        value={role}
        onChange={(e) => run(() => setRoleAction(id, e.target.value))}
        className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
      >
        <option value="admin">admin</option>
        <option value="editor">editor</option>
        <option value="author">author</option>
      </select>
      <button
        disabled={pending}
        className={small}
        onClick={() => run(() => toggleBanAction(id, !banned))}
      >
        {banned ? "Unban" : "Ban"}
      </button>
      <button
        disabled={pending}
        className={`${small} text-red-400`}
        onClick={() => {
          if (confirm("Delete this user permanently?")) {
            run(() => removeUserAction(id));
          }
        }}
      >
        Delete
      </button>
    </div>
  );
}