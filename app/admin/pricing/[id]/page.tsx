import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { pricingPlans } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { getServiceOptions } from "@/lib/pricing";
import { planFields } from "@/lib/pricing-schema";
import { PlanForm } from "@/components/admin/plan-form";

async function EditContent({ params }: { params: Promise<{ id: string }> }) {
  const { role } = await requireRole(["superadmin", "admin", "editor"]);
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const [row] = await db.select().from(pricingPlans).where(eq(pricingPlans.id, id));
  if (!row) notFound();

  const options = await getServiceOptions();
  // Editors can change content, not publish state.
  const fields = planFields(options).filter(
    (f) => !(role === "editor" && f.name === "status"),
  );

  const initial = {
    name: row.name,
    status: row.status,
    serviceId: row.serviceId ?? "",
    billing: row.billing,
    priceUsd: row.priceUsd == null ? "" : String(row.priceUsd),
    priceBdt: row.priceBdt == null ? "" : String(row.priceBdt),
    customQuote: row.customQuote,
    highlighted: row.highlighted,
    badge: row.badge,
    tagline: row.tagline,
    deliveryTime: row.deliveryTime,
    revisions: row.revisions,
    features: row.features,
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/pricing" className="text-sm text-muted hover:text-primary">
          ← All plans
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold">{row.name}</h1>
        <Link href="/pricing" target="_blank" className="text-sm text-primary underline">
          View pricing page
        </Link>
      </div>
      <PlanForm id={row.id} initial={initial} fields={fields} />
    </div>
  );
}

export default function EditPlanPage({
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