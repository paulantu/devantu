import { Suspense } from "react";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { ServicesList } from "@/components/admin/services-list";

async function ServicesContent() {
  const { role } = await requireRole(["superadmin", "admin", "editor"]);
  const rows = await db
    .select({
      id: services.id,
      title: services.title,
      slug: services.slug,
      status: services.status,
    })
    .from(services)
    .orderBy(asc(services.sortOrder), asc(services.title));

  return <ServicesList rows={rows} canManage={role !== "editor"} />;
}

export default function ServicesAdminPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Services</h1>
        <p className="text-sm text-muted">
          Each service gets its own page. Only published services are visible.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <ServicesContent />
      </Suspense>
    </div>
  );
}