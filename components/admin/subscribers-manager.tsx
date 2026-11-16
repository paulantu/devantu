"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteSubscriberAction } from "@/app/admin/subscribers/actions";

export type SubscriberRow = {
  id: string;
  email: string;
  status: string;
  source: string;
  createdAt: string;
};

export function SubscribersManager({ rows }: { rows: SubscriberRow[] }) {
  const [pending, start] = useTransition();

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
        No subscribers yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Source</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">{r.email}</td>
              <td className={`px-4 py-3 text-xs ${r.status === "active" ? "text-green-500" : "text-muted"}`}>
                {r.status}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-muted">{r.source || "-"}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted">{r.createdAt}</td>
              <td className="px-4 py-3 text-right">
                <button
                  disabled={pending}
                  aria-label="Delete"
                  className="rounded-md p-2 text-red-400 hover:bg-elevated"
                  onClick={() => {
                    if (!confirm(`Remove ${r.email}?`)) return;
                    start(async () => {
                      await deleteSubscriberAction(r.id);
                    });
                  }}
                >
                  <Trash2 className="size-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}