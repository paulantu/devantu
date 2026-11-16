"use server";

import { revalidatePath, updateTag } from "next/cache";
import { asc, count, eq, max } from "drizzle-orm";
import { db } from "@/db";
import { pageSections } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { PAGE_KEYS, buildSchema, sectionDefs } from "@/lib/sections/registry";

export type ActionState = { ok: boolean; message: string };

const STAFF = ["superadmin", "admin"] as const;
const ok = (message = "Saved"): ActionState => ({ ok: true, message });
const fail = (message: string): ActionState => ({ ok: false, message });

function refresh() {
  updateTag("sections");
  revalidatePath("/admin/sections");
}

export async function addSectionAction(
  pageKey: string,
  type: string,
): Promise<ActionState> {
  await requireRole([...STAFF]);
  if (!PAGE_KEYS.some((p) => p.key === pageKey)) return fail("Unknown page");
  const def = sectionDefs[type];
  if (!def) return fail("Unknown section type");

  const [{ top }] = await db
    .select({ top: max(pageSections.sortOrder) })
    .from(pageSections)
    .where(eq(pageSections.pageKey, pageKey));

  await db.insert(pageSections).values({
    pageKey,
    type,
    title: def.label,
    sortOrder: (top ?? -1) + 1,
    config: def.defaults,
  });
  refresh();
  return ok("Section added");
}

export async function updateSectionAction(
  id: string,
  title: string,
  config: unknown,
): Promise<ActionState> {
  await requireRole([...STAFF]);
  const [row] = await db.select().from(pageSections).where(eq(pageSections.id, id));
  if (!row) return fail("Section not found");
  const def = sectionDefs[row.type];
  if (!def) return fail("Unknown section type");

  const parsed = buildSchema(def.fields).safeParse(config);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue?.path.length ? `${issue.path.join(" > ")}: ` : "";
    return fail(`${where}${issue?.message ?? "Invalid input"}`);
  }

  await db
    .update(pageSections)
    .set({
      title: title.trim().slice(0, 80),
      config: parsed.data as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .where(eq(pageSections.id, id));
  refresh();
  return ok();
}

export async function toggleSectionAction(
  id: string,
  visible: boolean,
): Promise<ActionState> {
  await requireRole([...STAFF]);
  await db
    .update(pageSections)
    .set({ isVisible: visible, updatedAt: new Date() })
    .where(eq(pageSections.id, id));
  refresh();
  return ok(visible ? "Section shown" : "Section hidden");
}

export async function deleteSectionAction(id: string): Promise<ActionState> {
  await requireRole([...STAFF]);
  await db.delete(pageSections).where(eq(pageSections.id, id));
  refresh();
  return ok("Section deleted");
}

export async function moveSectionAction(
  id: string,
  dir: -1 | 1,
): Promise<ActionState> {
  await requireRole([...STAFF]);
  const [row] = await db
    .select({ pageKey: pageSections.pageKey })
    .from(pageSections)
    .where(eq(pageSections.id, id));
  if (!row) return fail("Section not found");

  const siblings = await db
    .select({ id: pageSections.id })
    .from(pageSections)
    .where(eq(pageSections.pageKey, row.pageKey))
    .orderBy(asc(pageSections.sortOrder), asc(pageSections.createdAt));

  const i = siblings.findIndex((s) => s.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= siblings.length) return ok("");

  const ids = siblings.map((s) => s.id);
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await Promise.all(
    ids.map((sid, index) =>
      db.update(pageSections).set({ sortOrder: index }).where(eq(pageSections.id, sid)),
    ),
  );
  refresh();
  return ok("");
}






const STARTER_HOME = [
  "hero",
  "techStrip",
  "aboutTeaser",
  "servicesGrid",
  "featuredProjects",
  "process",
  "testimonials",
  "latestPosts",
  "pricingTeaser",
  "faq",
  "cta",
];

export async function seedHomeLayoutAction(): Promise<ActionState> {
  await requireRole([...STAFF]);
  const [{ n }] = await db
    .select({ n: count() })
    .from(pageSections)
    .where(eq(pageSections.pageKey, "home"));
  if (n > 0) return fail("The home page already has sections");

  await db.insert(pageSections).values(
    STARTER_HOME.map((type, index) => ({
      pageKey: "home",
      type,
      title: sectionDefs[type].label,
      sortOrder: index,
      config: sectionDefs[type].defaults,
    })),
  );
  refresh();
  return ok("Starter layout added");
}