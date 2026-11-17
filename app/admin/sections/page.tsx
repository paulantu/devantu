import { Suspense } from "react";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pageSections } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { PAGE_KEYS } from "@/lib/sections/registry";
import { SectionManager } from "@/components/admin/section-manager";
import { cn } from "@/lib/utils";

async function SectionsContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireRole(["superadmin", "admin"]);
  const { page } = await searchParams;
  const current = PAGE_KEYS.find((p) => p.key === page)?.key ?? "home";

  const rows = await db
    .select()
    .from(pageSections)
    .where(eq(pageSections.pageKey, current))
    .orderBy(asc(pageSections.sortOrder), asc(pageSections.createdAt));

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {PAGE_KEYS.map((p) => (
          <Link
            key={p.key}
            href={`/admin/sections?page=${p.key}`}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm",
              p.key === current
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted hover:bg-elevated",
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>
      <SectionManager
        pageKey={current}
        sections={rows.map((r) => ({
          id: r.id,
          type: r.type,
          title: r.title,
          isVisible: r.isVisible,
          config: r.config,
          updatedAt: r.updatedAt.toISOString(),
        }))}
      />
    </>
  );
}

export default function SectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Sections</h1>
        <p className="text-sm text-muted">
          Add, edit, hide and reorder the sections on each page. Sections on a
          page start showing once that page is built in a later module.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <SectionsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}