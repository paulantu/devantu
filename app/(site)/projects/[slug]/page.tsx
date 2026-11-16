import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Code, ExternalLink } from "lucide-react";
import { getProjectBySlug } from "@/lib/projects";
import { getSiteSettings } from "@/lib/settings";
import { getEmbedUrl } from "@/lib/video";
import { buttonStyles } from "@/components/ui/button";
import { CtaBlock } from "@/components/sections/blocks";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProjectBySlug(slug);
  if (!data) return { title: "Project not found" };
  const p = data.project;
  return {
    title: p.seoTitle || p.title,
    description: p.seoDescription || p.summary,
    openGraph: p.coverUrl ? { images: [p.coverUrl] } : undefined,
  };
}

function Story({ title, text }: { title: string; text: string }) {
  const paragraphs = text.split(/\n{2,}/).filter(Boolean);
  if (paragraphs.length === 0) return null;
  return (
    <div className="space-y-3">
      <h2 className="font-heading text-2xl font-bold">{title}</h2>
      {paragraphs.map((p, i) => (
        <p key={i} className="leading-relaxed text-muted">
          {p}
        </p>
      ))}
    </div>
  );
}

async function ProjectContent({ params }: Props) {
  const { slug } = await params;
  const settings = await getSiteSettings();
  if (!settings.modules.projects) notFound();

  const data = await getProjectBySlug(slug);
  if (!data) notFound();
  const { project: p, services, prev, next } = data;

  const embed = getEmbedUrl(p.videoUrl);
  const ongoing = p.projectStatus === "ongoing";
  const meta = [
    ["Client", p.client],
    ["Role", p.role],
    ["Year", p.year],
    ["Timeline", p.timeline],
    ["Status", ongoing ? `Ongoing · ${p.progress}%` : "Completed"],
  ].filter(([, v]) => v);

  return (
    <>
      <section className="container-page pt-16 md:pt-24">
        <Link href="/projects" className="font-mono text-sm text-primary">
          ← projects
        </Link>
        {services.length > 0 && (
          <p className="mt-6 flex flex-wrap gap-2">
            {services.map((s) => (
              <Link
                key={s.id}
                href={`/services/${s.slug}`}
                className="rounded-full border border-border px-3 py-1 font-mono text-xs hover:border-primary hover:text-primary"
              >
                {s.title}
              </Link>
            ))}
          </p>
        )}
        <h1 className="mt-4 max-w-3xl font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
          {p.title}
        </h1>
        {p.summary && (
          <p className="mt-4 max-w-2xl text-lg text-muted">{p.summary}</p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {p.liveUrl && (
            <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles()}>
              <ExternalLink className="size-4" /> Visit live site
            </a>
          )}
          {p.sourceUrl && (
            <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles({ variant: "outline" })}>
              <Code className="size-4" /> Source code
            </a>
          )}
        </div>

        {meta.length > 0 && (
          <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-border py-6 md:grid-cols-5">
            {meta.map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-xs text-muted">{k}</dt>
                <dd className="mt-1 text-sm font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {ongoing && (
          <div className="mt-6 h-2 max-w-md overflow-hidden rounded-full bg-elevated">
            <div className="h-full bg-primary" style={{ width: `${p.progress}%` }} />
          </div>
        )}

        {p.coverUrl && (
          <div className="relative mt-10 aspect-video overflow-hidden rounded-2xl border border-border">
            <Image
              src={p.coverUrl}
              alt={p.title}
              fill
              priority
              sizes="(min-width: 1200px) 1152px, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </section>

      <section className="container-page grid gap-12 py-16 md:grid-cols-3 md:py-24">
        <Story title="The problem" text={p.problem} />
        <Story title="The solution" text={p.solution} />
        <Story title="The results" text={p.results} />
      </section>

      {p.tech.length > 0 && (
        <section className="container-page pb-16 md:pb-24">
          <h2 className="font-heading text-2xl font-bold">Built with</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {p.tech.map((t, i) => (
              <span key={i} className="rounded-full border border-border bg-surface px-4 py-1.5 font-mono text-sm">
                {t.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {embed && (
        <section className="container-page pb-16 md:pb-24">
          <div className="aspect-video overflow-hidden rounded-2xl border border-border">
            <iframe
              src={embed}
              title={`${p.title} video`}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="size-full"
            />
          </div>
        </section>
      )}

      {p.gallery.length > 0 && (
        <section className="container-page pb-16 md:pb-24">
          <h2 className="font-heading text-2xl font-bold">Screenshots</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {p.gallery.map((g, i) => (
              <figure key={i} className="space-y-2">
                <div className="relative aspect-video overflow-hidden rounded-lg border border-border">
                  <Image
                    src={g.image}
                    alt={g.caption || `${p.title} screenshot ${i + 1}`}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                {g.caption && (
                  <figcaption className="text-sm text-muted">{g.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {p.testimonialQuote && (
        <section className="container-page pb-16 md:pb-24">
          <figure className="mx-auto max-w-3xl rounded-2xl border border-border bg-elevated p-8 text-center md:p-12">
            <blockquote className="font-heading text-xl font-semibold leading-relaxed md:text-2xl">
              “{p.testimonialQuote}”
            </blockquote>
            {(p.testimonialAuthor || p.testimonialRole) && (
              <figcaption className="mt-5 text-sm text-muted">
                <span className="font-medium text-foreground">{p.testimonialAuthor}</span>
                {p.testimonialRole && ` · ${p.testimonialRole}`}
              </figcaption>
            )}
          </figure>
        </section>
      )}

      {(prev || next) && (
        <nav className="container-page grid gap-4 pb-16 sm:grid-cols-2 md:pb-24">
          {prev ? (
            <Link href={`/projects/${prev.slug}`} className="rounded-lg border border-border p-5 hover:border-primary">
              <p className="font-mono text-xs text-muted">← Previous</p>
              <p className="mt-1 font-heading font-semibold">{prev.title}</p>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/projects/${next.slug}`} className="rounded-lg border border-border p-5 text-right hover:border-primary">
              <p className="font-mono text-xs text-muted">Next →</p>
              <p className="mt-1 font-heading font-semibold">{next.title}</p>
            </Link>
          )}
        </nav>
      )}

      <CtaBlock
        data={{
          heading: "Want something like this?",
          text: "Tell me about your project and I'll get back to you soon.",
          buttonLabel: "Got a project?",
          buttonLink: "/contact",
        }}
      />
    </>
  );
}

export default function ProjectPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="container-page py-24" />}>
      <ProjectContent params={params} />
    </Suspense>
  );
}