import { Suspense } from "react";
import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { MESSAGE_STATUSES } from "@/lib/contact";
import { MessagesManager } from "@/components/admin/messages-manager";
import { cn } from "@/lib/utils";

async function MessagesContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole(["superadmin", "admin"]);
  const { status } = await searchParams;
  const current = (MESSAGE_STATUSES as readonly string[]).includes(status ?? "")
    ? status!
    : "all";

  const counts = await db
    .select({ status: contactMessages.status, n: count() })
    .from(contactMessages)
    .groupBy(contactMessages.status);
  const total = counts.reduce((a, c) => a + c.n, 0);
  const countOf = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;

  const rows = await db
    .select()
    .from(contactMessages)
    .where(current === "all" ? undefined : eq(contactMessages.status, current))
    .orderBy(desc(contactMessages.createdAt))
    .limit(200);

  const tabs = [
    { key: "all", label: `All (${total})` },
    ...MESSAGE_STATUSES.map((s) => ({ key: s, label: `${s} (${countOf(s)})` })),
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/admin/messages" : `/admin/messages?status=${t.key}`}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm capitalize",
              t.key === current
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted hover:bg-elevated",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <MessagesManager
        rows={rows.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          serviceTitle: r.serviceTitle,
          budget: r.budget,
          message: r.message,
          status: r.status,
          notes: r.notes,
          createdAt: `${r.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC`,
        }))}
      />
    </>
  );
}

export default function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted">Messages sent from the contact page.</p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <MessagesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}