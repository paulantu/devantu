"use server";

import { revalidatePath, updateTag } from "next/cache";
import { and, asc, eq, max, ne } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { slugify } from "@/lib/slug";
import { serviceSchema, type ServiceInput } from "@/lib/services-schema";

export type ServiceResult = { ok: boolean; message: string; id?: string };
const fail = (message: string): ServiceResult => ({ ok: false, message });

function refresh() {
  updateTag("services");
  revalidatePath("/admin/services");
}

async function uniqueSlug(base: string) {
  const root = base || "service";
  let slug = root;
  let n = 2;
  for (;;) {
    const hit = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.slug, slug));
    if (hit.length === 0) return slug;
    slug = `${root}-${n++}`;
  }
}

export async function createServiceAction(title: string): Promise<ServiceResult> {
  await requireRole(["superadmin", "admin"]);
  const t = title.trim();
  if (t.length < 2) return fail("Enter a service title");

  const slug = await uniqueSlug(slugify(t));
  const [{ top }] = await db.select({ top: max(services.sortOrder) }).from(services);
  const [row] = await db
    .insert(services)
    .values({ title: t.slice(0, 120), slug, sortOrder: (top ?? -1) + 1 })
    .returning({ id: services.id });

  refresh();
  return { ok: true, message: "Created", id: row.id };
}

export async function updateServiceAction(
  id: string,
  input: unknown,
): Promise<ServiceResult> {
  const { role } = await requireRole(["superadmin", "admin", "editor"]);
  const [current] = await db.select().from(services).where(eq(services.id, id));
  if (!current) return fail("Service not found");

  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue?.path.length ? `${issue.path.join(" > ")}: ` : "";
    return fail(`${where}${issue?.message ?? "Invalid input"}`);
  }
  const d = parsed.data as ServiceInput;

  if (d.title.trim().length < 2) return fail("Title is required");

  let slug = current.slug;
  let status = current.status;
  if (role !== "editor") {
    slug = slugify(d.slug);
    if (!slug) return fail("Slug is required");
    const clash = await db
      .select({ id: services.id })
      .from(services)
      .where(and(eq(services.slug, slug), ne(services.id, id)));
    if (clash.length > 0) return fail("That slug is already used by another service");
    status = d.status;
  }

  await db
    .update(services)
    .set({
      title: d.title.trim(),
      slug,
      status,
      icon: d.icon,
      summary: d.summary,
      coverUrl: d.coverUrl,
      description: d.description,
      features: d.features.filter((f) => f.text.trim()),
      process: d.process.filter((p) => p.title.trim()),
      tools: d.tools.filter((t) => t.name.trim()),
      faqs: d.faqs.filter((q) => q.question.trim() && q.answer.trim()),
      seoTitle: d.seoTitle,
      seoDescription: d.seoDescription,
      updatedAt: new Date(),
    })
    .where(eq(services.id, id));

  refresh();
  return { ok: true, message: "Saved" };
}

export async function deleteServiceAction(id: string): Promise<ServiceResult> {
  await requireRole(["superadmin", "admin"]);
  await db.delete(services).where(eq(services.id, id));
  refresh();
  return { ok: true, message: "Deleted" };
}

export async function moveServiceAction(
  id: string,
  dir: -1 | 1,
): Promise<ServiceResult> {
  await requireRole(["superadmin", "admin"]);
  const all = await db
    .select({ id: services.id })
    .from(services)
    .orderBy(asc(services.sortOrder), asc(services.title));

  const i = all.findIndex((s) => s.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= all.length) return { ok: true, message: "" };

  const ids = all.map((s) => s.id);
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await Promise.all(
    ids.map((sid, index) =>
      db.update(services).set({ sortOrder: index }).where(eq(services.id, sid)),
    ),
  );
  refresh();
  return { ok: true, message: "" };
}