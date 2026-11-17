import { cacheTag } from "next/cache";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { projects, projectServices, services } from "@/db/schema";

export type ProjectCardData = Awaited<
  ReturnType<typeof getPublishedProjects>
>[number];

export async function getPublishedProjects() {
  "use cache";
  cacheTag("projects", "services");

  const rows = await db
    .select({
      id: projects.id,
      slug: projects.slug,
      title: projects.title,
      summary: projects.summary,
      coverUrl: projects.coverUrl,
      projectStatus: projects.projectStatus,
      progress: projects.progress,
      featured: projects.featured,
      year: projects.year,
      tech: projects.tech,
    })
    .from(projects)
    .where(eq(projects.status, "published"))
    .orderBy(asc(projects.sortOrder), desc(projects.createdAt));

  const links =
    rows.length === 0
      ? []
      : await db
          .select({
            projectId: projectServices.projectId,
            id: services.id,
            slug: services.slug,
            title: services.title,
          })
          .from(projectServices)
          .innerJoin(services, eq(services.id, projectServices.serviceId))
          .where(
            and(
              inArray(projectServices.projectId, rows.map((r) => r.id)),
              eq(services.status, "published"),
            ),
          );

  return rows.map((r) => ({
    ...r,
    services: links
      .filter((l) => l.projectId === r.id)
      .map(({ id, slug, title }) => ({ id, slug, title })),
  }));
}

export async function getProjectBySlug(slug: string) {
  "use cache";
  cacheTag("projects", "services");

  const all = await getPublishedProjects();
  const index = all.findIndex((p) => p.slug === slug);
  if (index === -1) return null;

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.slug, slug), eq(projects.status, "published")));
  if (!project) return null;

  return {
    project,
    services: all[index].services,
    prev: all[index - 1] ?? null,
    next: all[index + 1] ?? null,
  };
}

export async function getProjectsForService(serviceId: string) {
  const all = await getPublishedProjects();
  return all.filter((p) => p.services.some((s) => s.id === serviceId));
}