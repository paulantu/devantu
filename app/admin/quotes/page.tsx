import { Suspense } from "react";
import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { quoteRequests } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { QUOTE_STATUSES } from "@/lib/pricing-schema";
import { QuotesManager } from "@/components/admin/quotes-manager";
import { cn } from "@/lib/utils";

async function QuotesContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole(["superadmin", "admin"]);
  const { status } = await searchParams;
  const current = (QUOTE_STATUSES as readonly string[]).includes(status ?? "")
    ? status!
    : "all";

  const counts = await db
    .select({ status: quoteRequests.status, n: count() })
    .from(quoteRequests)
    .groupBy(quoteRequests.status);
  const total = counts.reduce((a, c) => a + c.n, 0);
  const countOf = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;

  const rows = await db
    .select()
    .from(quoteRequests)
    .where(current === "all" ? undefined : eq(quoteRequests.status, current))
    .orderBy(desc(quoteRequests.createdAt))
    .limit(200);

  const tabs = [
    { key: "all", label: `All (${total})` },
    ...QUOTE_STATUSES.map((s) => ({ key: s, label: `${s} (${countOf(s)})` })),
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/admin/quotes" : `/admin/quotes?status=${t.key}`}
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
      <QuotesManager
        rows={rows.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          planName: r.planName,
          serviceTitle: r.serviceTitle,
          budget: r.budget,
          deadline: r.deadline,
          details: r.details,
          status: r.status,
          notes: r.notes,
          createdAt: `${r.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC`,
        }))}
      />
    </>
  );
}

export default function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Quote requests</h1>
        <p className="text-sm text-muted">
          Requests sent from the pricing page. Track each one from new to won or lost.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <QuotesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}