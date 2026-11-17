import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { services } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { ServiceForm } from "@/components/admin/service-form";

async function EditContent({ params }: { params: Promise<{ id: string }> }) {
  const { role } = await requireRole(["superadmin", "admin", "editor"]);
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const [row] = await db.select().from(services).where(eq(services.id, id));
  if (!row) notFound();

  const initial = {
    title: row.title,
    slug: row.slug,
    status: row.status,
    icon: row.icon,
    summary: row.summary,
    coverUrl: row.coverUrl,
    description: row.description,
    features: row.features,
    process: row.process,
    tools: row.tools,
    faqs: row.faqs,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/services" className="text-sm text-muted hover:text-primary">
          ← All services
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold">{row.title}</h1>
        {row.status === "published" && (
          <Link
            href={`/services/${row.slug}`}
            target="_blank"
            className="text-sm text-primary underline"
          >
            View live page
          </Link>
        )}
      </div>
      <ServiceForm id={row.id} initial={initial} role={role} />
    </div>
  );
}

export default function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
      <EditContent params={params} />
    </Suspense>
  );
}