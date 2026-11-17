import { Suspense } from "react";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { ProjectsList } from "@/components/admin/projects-list";

async function ProjectsContent() {
  await requireRole(["superadmin", "admin", "editor"]);
  const rows = await db
    .select({
      id: projects.id,
      title: projects.title,
      slug: projects.slug,
      status: projects.status,
      featured: projects.featured,
      projectStatus: projects.projectStatus,
    })
    .from(projects)
    .orderBy(asc(projects.sortOrder), asc(projects.createdAt));

  return <ProjectsList rows={rows} />;
}

export default function ProjectsAdminPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Projects</h1>
        <p className="text-sm text-muted">
          Previous and ongoing work. Only published projects are visible.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <ProjectsContent />
      </Suspense>
    </div>
  );
}