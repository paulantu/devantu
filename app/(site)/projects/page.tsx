import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedProjects } from "@/lib/projects";
import { getPublishedServices } from "@/lib/services";
import { getSiteSettings } from "@/lib/settings";
import { ProjectCard } from "@/components/site/project-card";
import { ProjectFilters } from "@/components/site/project-filters";
import { PageSections } from "@/components/sections/page-sections";

export const metadata: Metadata = { title: "Projects" };

type SP = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function ProjectsContent({ searchParams }: { searchParams: SP }) {
  const settings = await getSiteSettings();
  if (!settings.modules.projects) notFound();

  const sp = await searchParams;
  const service = one(sp.service);
  const status = one(sp.status);
  const tech = one(sp.tech);
  const year = one(sp.year);
  const q = one(sp.q)?.toLowerCase().trim();

  const [all, serviceList] = await Promise.all([
    getPublishedProjects(),
    getPublishedServices(),
  ]);

  const techs = [...new Set(all.flatMap((p) => p.tech.map((t) => t.name)))].sort();
  const years = [...new Set(all.map((p) => p.year).filter(Boolean))].sort().reverse();

  const list = all.filter(
    (p) =>
      (!service || p.services.some((s) => s.slug === service)) &&
      (!status || p.projectStatus === status) &&
      (!tech || p.tech.some((t) => t.name === tech)) &&
      (!year || p.year === year) &&
      (!q || `${p.title} ${p.summary}`.toLowerCase().includes(q)),
  );

  return (
    <section className="container-page py-16 md:py-24">
      <p className="font-mono text-sm text-primary">projects</p>
      <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
        My work<span className="text-primary">.</span>
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        Previous and ongoing projects. Filter by service, status or technology.
      </p>

      <div className="mt-10">
        <Suspense fallback={null}>
          <ProjectFilters
            services={serviceList.map((s) => ({ slug: s.slug, title: s.title }))}
            techs={techs}
            years={years}
          />
        </Suspense>
      </div>

      {list.length === 0 ? (
        <p className="mt-12 text-muted">No projects match these filters.</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function ProjectsPage({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <Suspense fallback={<div className="container-page py-24" />}>
        <ProjectsContent searchParams={searchParams} />
      </Suspense>
      <PageSections pageKey="projects" />
    </>
  );
}