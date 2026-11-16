import { Suspense } from "react";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { SubscribersManager } from "@/components/admin/subscribers-manager";

async function SubscribersContent() {
  await requireRole(["superadmin", "admin"]);
  const [{ active }] = await db
    .select({ active: count() })
    .from(subscribers)
    .where(eq(subscribers.status, "active"));
  const rows = await db
    .select()
    .from(subscribers)
    .orderBy(desc(subscribers.createdAt))
    .limit(500);

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-sm">
          <span className="font-heading text-2xl font-bold">{active}</span>{" "}
          <span className="text-muted">active subscribers</span>
        </p>
        <a
          href="/admin/subscribers/export"
          className="rounded-md border border-border px-3 py-2 text-sm hover:bg-elevated"
        >
          Export active as CSV
        </a>
      </div>
      <SubscribersManager
        rows={rows.map((r) => ({
          id: r.id,
          email: r.email,
          status: r.status,
          source: r.source,
          createdAt: r.createdAt.toISOString().slice(0, 10),
        }))}
      />
    </>
  );
}

export default function SubscribersPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Subscribers</h1>
        <p className="text-sm text-muted">
          People who joined your newsletter. Export the list to send emails with
          a tool like Resend.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <SubscribersContent />
      </Suspense>
    </div>
  );
}