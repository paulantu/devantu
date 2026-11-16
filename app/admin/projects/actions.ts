"use server";

import { revalidatePath, updateTag } from "next/cache";
import { and, asc, eq, inArray, max, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { projects, projectServices, services } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { slugify } from "@/lib/slug";
import { projectSchema, type ProjectInput } from "@/lib/projects-schema";

export type ProjectResult = { ok: boolean; message: string; id?: string };
const fail = (message: string): ProjectResult => ({ ok: false, message });
const STAFF = ["superadmin", "admin", "editor"] as const;

function refresh() {
  updateTag("projects");
  revalidatePath("/admin/projects");
}

async function uniqueSlug(base: string) {
  const root = base || "project";
  let slug = root;
  let n = 2;
  for (;;) {
    const hit = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.slug, slug));
    if (hit.length === 0) return slug;
    slug = `${root}-${n++}`;
  }
}

export async function createProjectAction(title: string): Promise<ProjectResult> {
  await requireRole([...STAFF]);
  const t = title.trim();
  if (t.length < 2) return fail("Enter a project title");

  const slug = await uniqueSlug(slugify(t));
  const [{ top }] = await db.select({ top: max(projects.sortOrder) }).from(projects);
  const [row] = await db
    .insert(projects)
    .values({ title: t.slice(0, 140), slug, sortOrder: (top ?? -1) + 1 })
    .returning({ id: projects.id });

  refresh();
  return { ok: true, message: "Created", id: row.id };
}

export async function updateProjectAction(
  id: string,
  input: unknown,
  serviceIds: unknown,
): Promise<ProjectResult> {
  await requireRole([...STAFF]);
  const [current] = await db.select().from(projects).where(eq(projects.id, id));
  if (!current) return fail("Project not found");

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue?.path.length ? `${issue.path.join(" > ")}: ` : "";
    return fail(`${where}${issue?.message ?? "Invalid input"}`);
  }
  const d = parsed.data as ProjectInput;

  const ids = z.array(z.string().uuid()).max(50).safeParse(serviceIds);
  if (!ids.success) return fail("Invalid services");

  if (d.title.trim().length < 2) return fail("Title is required");
  if (d.year && !/^\d{4}$/.test(d.year)) return fail("Year must be 4 digits, like 2026");

  const slug = slugify(d.slug);
  if (!slug) return fail("Slug is required");
  const clash = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.slug, slug), ne(projects.id, id)));
  if (clash.length > 0) return fail("That slug is already used by another project");

  await db
    .update(projects)
    .set({
      title: d.title.trim(),
      slug,
      status: d.status,
      featured: d.featured,
      projectStatus: d.projectStatus,
      progress: Math.min(100, Math.max(0, parseInt(d.progress, 10) || 0)),
      year: d.year,
      client: d.client,
      role: d.role,
      timeline: d.timeline,
      summary: d.summary,
      coverUrl: d.coverUrl,
      liveUrl: d.liveUrl,
      sourceUrl: d.sourceUrl,
      videoUrl: d.videoUrl,
      problem: d.problem,
      solution: d.solution,
      results: d.results,
      tech: d.tech.filter((t) => t.name.trim()),
      gallery: d.gallery.filter((g) => g.image),
      testimonialQuote: d.testimonialQuote,
      testimonialAuthor: d.testimonialAuthor,
      testimonialRole: d.testimonialRole,
      seoTitle: d.seoTitle,
      seoDescription: d.seoDescription,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id));

  // Replace the service links with only services that really exist.
  await db.delete(projectServices).where(eq(projectServices.projectId, id));
  if (ids.data.length > 0) {
    const valid = await db
      .select({ id: services.id })
      .from(services)
      .where(inArray(services.id, ids.data));
    if (valid.length > 0) {
      await db
        .insert(projectServices)
        .values(valid.map((s) => ({ projectId: id, serviceId: s.id })));
    }
  }

  refresh();
  return { ok: true, message: "Saved" };
}

export async function deleteProjectAction(id: string): Promise<ProjectResult> {
  await requireRole([...STAFF]);
  await db.delete(projects).where(eq(projects.id, id));
  refresh();
  return { ok: true, message: "Deleted" };
}

export async function moveProjectAction(
  id: string,
  dir: -1 | 1,
): Promise<ProjectResult> {
  await requireRole([...STAFF]);
  const all = await db
    .select({ id: projects.id })
    .from(projects)
    .orderBy(asc(projects.sortOrder), asc(projects.createdAt));

  const i = all.findIndex((p) => p.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= all.length) return { ok: true, message: "" };

  const ids = all.map((p) => p.id);
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await Promise.all(
    ids.map((pid, index) =>
      db.update(projects).set({ sortOrder: index }).where(eq(projects.id, pid)),
    ),
  );
  refresh();
  return { ok: true, message: "" };
}