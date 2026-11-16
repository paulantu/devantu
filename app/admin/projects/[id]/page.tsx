import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { projects, projectServices, services } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { ProjectForm } from "@/components/admin/project-form";

async function EditContent({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["superadmin", "admin", "editor"]);
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const [row] = await db.select().from(projects).where(eq(projects.id, id));
  if (!row) notFound();

  const allServices = await db
    .select({ id: services.id, title: services.title })
    .from(services)
    .orderBy(asc(services.sortOrder), asc(services.title));
  const links = await db
    .select({ serviceId: projectServices.serviceId })
    .from(projectServices)
    .where(eq(projectServices.projectId, id));

  const initial = {
    title: row.title,
    slug: row.slug,
    status: row.status,
    featured: row.featured,
    projectStatus: row.projectStatus,
    progress: String(row.progress),
    year: row.year,
    client: row.client,
    role: row.role,
    timeline: row.timeline,
    summary: row.summary,
    coverUrl: row.coverUrl,
    liveUrl: row.liveUrl,
    sourceUrl: row.sourceUrl,
    videoUrl: row.videoUrl,
    problem: row.problem,
    solution: row.solution,
    results: row.results,
    tech: row.tech,
    gallery: row.gallery,
    testimonialQuote: row.testimonialQuote,
    testimonialAuthor: row.testimonialAuthor,
    testimonialRole: row.testimonialRole,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/projects" className="text-sm text-muted hover:text-primary">
          ← All projects
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold">{row.title}</h1>
        {row.status === "published" && (
          <Link
            href={`/projects/${row.slug}`}
            target="_blank"
            className="text-sm text-primary underline"
          >
            View live page
          </Link>
        )}
      </div>
      <ProjectForm
        id={row.id}
        initial={initial}
        allServices={allServices}
        selectedServiceIds={links.map((l) => l.serviceId)}
      />
    </div>
  );
}

export default function EditProjectPage({
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