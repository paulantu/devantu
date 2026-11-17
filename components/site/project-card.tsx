import Image from "next/image";
import Link from "next/link";

export function ProjectCard({
  project,
}: {
  project: {
    slug: string;
    title: string;
    summary: string;
    coverUrl: string;
    projectStatus: string;
    progress: number;
    services: { title: string }[];
  };
}) {
  const ongoing = project.projectStatus === "ongoing";
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-primary"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-elevated">
        {project.coverUrl && (
          <Image
            src={project.coverUrl}
            alt={project.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {ongoing && (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 font-mono text-xs text-primary">
            Ongoing · {project.progress}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {project.services.length > 0 && (
          <p className="font-mono text-xs text-primary">
            {project.services.map((s) => s.title).join(" · ")}
          </p>
        )}
        <h3 className="mt-2 font-heading text-lg font-bold">{project.title}</h3>
        {project.summary && (
          <p className="mt-2 line-clamp-2 text-sm text-muted">{project.summary}</p>
        )}
      </div>
    </Link>
  );
}