"use server";

import { revalidatePath, updateTag } from "next/cache";
import { asc, eq, max } from "drizzle-orm";
import { db } from "@/db";
import { pricingPlans } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { getServiceOptions } from "@/lib/pricing";
import { planSchema, type PlanInput } from "@/lib/pricing-schema";

export type PlanResult = { ok: boolean; message: string; id?: string };
const fail = (message: string): PlanResult => ({ ok: false, message });

function refresh() {
  updateTag("pricing");
  revalidatePath("/admin/pricing");
}

function toPrice(v: string): number | null | "bad" {
  const clean = v.replace(/[,\s]/g, "");
  if (clean === "") return null;
  return /^\d{1,9}$/.test(clean) ? parseInt(clean, 10) : "bad";
}

export async function createPlanAction(name: string): Promise<PlanResult> {
  await requireRole(["superadmin", "admin"]);
  const n = name.trim();
  if (n.length < 2) return fail("Enter a plan name");

  const [{ top }] = await db.select({ top: max(pricingPlans.sortOrder) }).from(pricingPlans);
  const [row] = await db
    .insert(pricingPlans)
    .values({ name: n.slice(0, 80), sortOrder: (top ?? -1) + 1 })
    .returning({ id: pricingPlans.id });

  refresh();
  return { ok: true, message: "Created", id: row.id };
}

export async function updatePlanAction(
  id: string,
  input: unknown,
): Promise<PlanResult> {
  const { role } = await requireRole(["superadmin", "admin", "editor"]);
  const [current] = await db.select().from(pricingPlans).where(eq(pricingPlans.id, id));
  if (!current) return fail("Plan not found");

  const options = await getServiceOptions();
  const parsed = planSchema(options).safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue?.path.length ? `${issue.path.join(" > ")}: ` : "";
    return fail(`${where}${issue?.message ?? "Invalid input"}`);
  }
  const d = parsed.data as PlanInput;

  if (d.name.trim().length < 2) return fail("Plan name is required");
  const usd = toPrice(d.priceUsd);
  const bdt = toPrice(d.priceBdt);
  if (usd === "bad" || bdt === "bad") return fail("Prices must be whole numbers");

  await db
    .update(pricingPlans)
    .set({
      name: d.name.trim(),
      // Editors can change content but not publish state.
      status: role === "editor" ? current.status : d.status,
      serviceId: d.serviceId || null,
      billing: d.billing,
      priceUsd: usd,
      priceBdt: bdt,
      customQuote: d.customQuote,
      highlighted: d.highlighted,
      badge: d.badge.trim(),
      tagline: d.tagline,
      deliveryTime: d.deliveryTime,
      revisions: d.revisions,
      features: d.features.filter((f) => f.text.trim()),
      updatedAt: new Date(),
    })
    .where(eq(pricingPlans.id, id));

  refresh();
  return { ok: true, message: "Saved" };
}

export async function deletePlanAction(id: string): Promise<PlanResult> {
  await requireRole(["superadmin", "admin"]);
  await db.delete(pricingPlans).where(eq(pricingPlans.id, id));
  refresh();
  return { ok: true, message: "Deleted" };
}

export async function movePlanAction(id: string, dir: -1 | 1): Promise<PlanResult> {
  await requireRole(["superadmin", "admin"]);
  const all = await db
    .select({ id: pricingPlans.id })
    .from(pricingPlans)
    .orderBy(asc(pricingPlans.sortOrder), asc(pricingPlans.name));

  const i = all.findIndex((p) => p.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= all.length) return { ok: true, message: "" };

  const ids = all.map((p) => p.id);
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await Promise.all(
    ids.map((pid, index) =>
      db.update(pricingPlans).set({ sortOrder: index }).where(eq(pricingPlans.id, pid)),
    ),
  );
  refresh();
  return { ok: true, message: "" };
}