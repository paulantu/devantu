import { cacheTag } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pricingPlans, services } from "@/db/schema";

export async function getPublishedPlans() {
  "use cache";
  cacheTag("pricing", "services");

  const rows = await db
    .select({
      id: pricingPlans.id,
      name: pricingPlans.name,
      tagline: pricingPlans.tagline,
      billing: pricingPlans.billing,
      priceUsd: pricingPlans.priceUsd,
      priceBdt: pricingPlans.priceBdt,
      customQuote: pricingPlans.customQuote,
      deliveryTime: pricingPlans.deliveryTime,
      revisions: pricingPlans.revisions,
      highlighted: pricingPlans.highlighted,
      badge: pricingPlans.badge,
      features: pricingPlans.features,
      serviceId: pricingPlans.serviceId,
      serviceTitle: services.title,
      serviceStatus: services.status,
    })
    .from(pricingPlans)
    .leftJoin(services, eq(services.id, pricingPlans.serviceId))
    .where(eq(pricingPlans.status, "published"))
    .orderBy(asc(pricingPlans.sortOrder), asc(pricingPlans.name));

  // Hide plans whose service is still a draft.
  return rows.filter((r) => !r.serviceId || r.serviceStatus === "published");
}

export async function getPlansForService(serviceId: string) {
  const all = await getPublishedPlans();
  return all.filter((p) => p.serviceId === serviceId);
}

export async function getServiceOptions() {
  const rows = await db
    .select({ id: services.id, title: services.title })
    .from(services)
    .orderBy(asc(services.sortOrder), asc(services.title));
  return [
    { value: "", label: "General (all services)" },
    ...rows.map((r) => ({ value: r.id, label: r.title })),
  ];
}