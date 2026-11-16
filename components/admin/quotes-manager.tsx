"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Mail, Trash2 } from "lucide-react";
import {
  deleteQuoteAction,
  saveQuoteNotesAction,
  setQuoteStatusAction,
} from "@/app/admin/quotes/actions";
import { Button } from "@/components/ui/button";
import { QUOTE_STATUSES } from "@/lib/pricing-schema";
import { cn } from "@/lib/utils";

export type QuoteRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  planName: string;
  serviceTitle: string;
  budget: string;
  deadline: string;
  details: string;
  status: string;
  notes: string;
  createdAt: string;
};

const statusColor: Record<string, string> = {
  new: "bg-primary/15 text-primary",
  quoted: "bg-blue-500/15 text-blue-400",
  won: "bg-green-500/15 text-green-500",
  lost: "bg-elevated text-muted",
};

function QuoteCard({ q }: { q: QuoteRow }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(q.notes);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  const run = (fn: () => Promise<{ ok: boolean; message: string }>) =>
    start(async () => {
      const r = await fn();
      if (!r.ok) alert(r.message);
    });

  const wa = q.phone.replace(/\D/g, "");

  return (
    <div className="rounded-lg border border-border bg-surface">
      <button
        className="flex w-full flex-wrap items-center gap-3 p-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <ChevronDown className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{q.name}</p>
          <p className="truncate text-xs text-muted">
            {q.planName || "Custom quote"}
            {q.serviceTitle && ` · ${q.serviceTitle}`} · {q.createdAt}
          </p>
        </div>
        <span className={cn("rounded-full px-3 py-1 font-mono text-xs", statusColor[q.status])}>
          {q.status}
        </span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <a href={`mailto:${q.email}`} className="text-primary underline">
              {q.email}
            </a>
            {q.phone && (
              <a href={`tel:${q.phone}`} className="hover:text-primary">
                {q.phone}
              </a>
            )}
            {wa && (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary">
                WhatsApp
              </a>
            )}
          </div>

          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-mono text-xs text-muted">Budget</dt>
              <dd>{q.budget || "-"}</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-muted">Deadline</dt>
              <dd>{q.deadline || "-"}</dd>
            </div>
          </dl>

          <div>
            <p className="font-mono text-xs text-muted">Project details</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{q.details}</p>
          </div>

          <label className="block space-y-1.5 text-sm">
            <span className="text-muted">Status</span>
            <select
              disabled={pending}
              value={q.status}
              onChange={(e) => run(() => setQuoteStatusAction(q.id, e.target.value))}
              className="block rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              {QUOTE_STATUSES.map((s) => (
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
              disabled={pending || notes === q.notes}
              onClick={() =>
                start(async () => {
                  const r = await saveQuoteNotesAction(q.id, notes);
                  setSaved(r.ok);
                })
              }
            >
              Save notes
            </Button>
            {saved && <span className="text-sm text-green-500">Saved</span>}
            <a
              href={`mailto:${q.email}?subject=${encodeURIComponent(
                `Re: your quote request${q.planName ? ` (${q.planName})` : ""}`,
              )}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm hover:bg-elevated"
            >
              <Mail className="size-4" /> Reply by email
            </a>
            <button
              disabled={pending}
              className="ml-auto flex items-center gap-1 rounded-md px-2 py-2 text-sm text-red-400 hover:bg-elevated"
              onClick={() => {
                if (confirm("Delete this request permanently?")) run(() => deleteQuoteAction(q.id));
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

export function QuotesManager({ rows }: { rows: QuoteRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
        No requests here.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {rows.map((q) => (
        <QuoteCard key={q.id} q={q} />
      ))}
    </div>
  );
}