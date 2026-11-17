"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Mail, Trash2 } from "lucide-react";
import {
  deleteMessageAction,
  saveMessageNotesAction,
  setMessageStatusAction,
} from "@/app/admin/messages/actions";
import { Button } from "@/components/ui/button";
import { MESSAGE_STATUSES } from "@/lib/contact";
import { cn } from "@/lib/utils";

export type MessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  serviceTitle: string;
  budget: string;
  message: string;
  status: string;
  notes: string;
  createdAt: string;
};

const statusColor: Record<string, string> = {
  new: "bg-primary/15 text-primary",
  read: "bg-elevated text-muted",
  replied: "bg-green-500/15 text-green-500",
  archived: "bg-elevated text-muted",
};

function MessageCard({ m }: { m: MessageRow }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(m.notes);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const run = (fn: () => Promise<{ ok: boolean; message: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) alert(r.message);
    });

  const wa = m.phone.replace(/\D/g, "");

  return (
    <div className="rounded-lg border border-border bg-surface">
      <button
        className="flex w-full flex-wrap items-center gap-3 p-4 text-left"
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next && m.status === "new") run(() => setMessageStatusAction(m.id, "read"));
        }}
      >
        <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} />
        <div className="min-w-0 flex-1">
          <p className={cn("truncate", m.status === "new" ? "font-semibold" : "font-medium")}>
            {m.name}
          </p>
          <p className="truncate text-xs text-muted">
            {m.serviceTitle || "General"} · {m.createdAt}
          </p>
        </div>
        <span className={cn("rounded-full px-3 py-1 font-mono text-xs", statusColor[m.status])}>
          {m.status}
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <a href={`mailto:${m.email}`} className="text-primary underline">
              {m.email}
            </a>
            {m.phone && (
              <a href={`tel:${m.phone}`} className="hover:text-primary">
                {m.phone}
              </a>
            )}
            {wa && (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary">
                WhatsApp
              </a>
            )}
          </div>

          {m.budget && (
            <p className="text-sm">
              <span className="font-mono text-xs text-muted">Budget </span>
              {m.budget}
            </p>
          )}

          <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>

          <label className="block space-y-1.5 text-sm">
            <span className="text-muted">Status</span>
            <select
              disabled={pending}
              value={m.status}
              onChange={(e) => run(() => setMessageStatusAction(m.id, e.target.value))}
              className="block rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {MESSAGE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="text-muted">Private notes</span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setSaved(false);
              }}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              disabled={pending || notes === m.notes}
              onClick={() =>
                start(async () => {
                  const r = await saveMessageNotesAction(m.id, notes);
                  setSaved(r.ok);
                })
              }
            >
              Save notes
            </Button>
            {saved && <span className="text-sm text-green-500">Saved</span>}
            <a
              href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`}
              onClick={() => m.status !== "replied" && run(() => setMessageStatusAction(m.id, "replied"))}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm hover:bg-elevated"
            >
              <Mail className="size-4" /> Reply by email
            </a>
            <button
              disabled={pending}
              className="ml-auto flex items-center gap-1 rounded-md px-2 py-2 text-sm text-red-400 hover:bg-elevated"
              onClick={() => {
                if (confirm("Delete this message permanently?")) run(() => deleteMessageAction(m.id));
              }}
            >
              <Trash2 className="size-4" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function MessagesManager({ rows }: { rows: MessageRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
        No messages here.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {rows.map((m) => (
        <MessageCard key={m.id} m={m} />
      ))}
    </div>
  );
}