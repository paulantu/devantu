import { Suspense } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pricingPlans, services } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { PlansList } from "@/components/admin/plans-list";

async function PricingContent() {
  const { role } = await requireRole(["superadmin", "admin", "editor"]);
  const rows = await db
    .select({
      id: pricingPlans.id,
      name: pricingPlans.name,
      status: pricingPlans.status,
      highlighted: pricingPlans.highlighted,
      serviceTitle: services.title,
    })
    .from(pricingPlans)
    .leftJoin(services, eq(services.id, pricingPlans.serviceId))
    .orderBy(asc(pricingPlans.sortOrder), asc(pricingPlans.name));

  return <PlansList rows={rows} canManage={role !== "editor"} />;
}

export default function PricingAdminPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Pricing plans</h1>
        <p className="text-sm text-muted">
          Plans appear on the pricing page, and on a service page if attached to
          that service.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <PricingContent />
      </Suspense>
    </div>
  );
}