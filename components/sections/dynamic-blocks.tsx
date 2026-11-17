import { buttonStyles } from "@/components/ui/button";
import { SmartLink } from "@/components/ui/smart-link";
import { ServiceCard } from "@/components/site/service-card";
import { ProjectCard } from "@/components/site/project-card";
import { getPublishedServices } from "@/lib/services";
import { getPublishedProjects } from "@/lib/projects";
import { getSiteSettings } from "@/lib/settings";

import { getPublishedPlans } from "@/lib/pricing";
import { PricingView } from "@/components/site/pricing-view";

import { getPublishedPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/blog-card";

import Image from "next/image";
import Link from "next/link";
import { getGalleryItems } from "@/lib/gallery";

type Props = { data: Record<string, unknown> };
const str = (v: unknown) => (typeof v === "string" ? v : "");

function Header({ data }: Props) {
  return (
    <div className="max-w-2xl">
      {str(data.eyebrow) && (
        <p className="font-mono text-sm text-primary">{str(data.eyebrow)}</p>
      )}
      <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-4xl">
        {str(data.heading)}
        <span className="text-primary">.</span>
      </h2>
      {str(data.text) && <p className="mt-3 text-muted">{str(data.text)}</p>}
    </div>
  );
}

function More({ data }: Props) {
  if (!str(data.buttonLabel) || !str(data.buttonLink)) return null;
  return (
    <div className="mt-10">
      <SmartLink
        href={str(data.buttonLink)}
        className={buttonStyles({ variant: "outline" })}
      >
        {str(data.buttonLabel)}
      </SmartLink>
    </div>
  );
}

export async function ServicesGridBlock({ data }: Props) {
  const settings = await getSiteSettings();
  if (!settings.modules.services) return null;
  const list = (await getPublishedServices()).slice(0, 6);
  if (list.length === 0) return null;

  return (
    <section className="container-page py-16 md:py-24">
      <Header data={data} />
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>
      <More data={data} />
    </section>
  );
}

export async function FeaturedProjectsBlock({ data }: Props) {
  const settings = await getSiteSettings();
  if (!settings.modules.projects) return null;

  const all = await getPublishedProjects();
  const count = Number(data.count) || 3;
  const featured = all.filter((p) => p.featured);
  const list = (featured.length > 0 ? featured : all).slice(0, count);
  if (list.length === 0) return null;

  return (
    <section className="container-page py-16 md:py-24">
      <Header data={data} />
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
      <More data={data} />
    </section>
  );
}






export async function PricingTeaserBlock({ data }: Props) {
  const settings = await getSiteSettings();
  if (!settings.modules.pricing) return null;

  const all = await getPublishedPlans();
  const general = all.filter((p) => !p.serviceId);
  const list = (general.length > 0 ? general : all).slice(0, 3);
  if (list.length === 0) return null;

  return (
    <section className="container-page py-16 md:py-24">
      <Header data={data} />
      <div className="mt-10">
        <PricingView plans={list} mode="service" />
      </div>
      <More data={data} />
    </section>
  );
}






export async function LatestPostsBlock({ data }: Props) {
  const settings = await getSiteSettings();
  if (!settings.modules.blog) return null;

  const count = Number(data.count) || 3;
  const list = (await getPublishedPosts()).slice(0, count);
  if (list.length === 0) return null;

  return (
    <section className="container-page py-16 md:py-24">
      <Header data={data} />
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <BlogCard key={p.id} post={p} />
        ))}
      </div>
      <More data={data} />
    </section>
  );
}





export async function GalleryTeaserBlock({ data }: Props) {
  const settings = await getSiteSettings();
  if (!settings.modules.gallery) return null;

  const count = Number(data.count) || 6;
  const list = (await getGalleryItems())
    .map((i) => ({ ...i, src: i.type === "image" ? i.imageUrl : i.thumbUrl }))
    .filter((i) => i.src)
    .slice(0, count);
  if (list.length === 0) return null;

  return (
    <section className="container-page py-16 md:py-24">
      <Header data={data} />
      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
        {list.map((i) => (
          <Link
            key={i.id}
            href="/gallery"
            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-elevated"
          >
            <Image
              src={i.src}
              alt={i.caption || "Gallery photo"}
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        ))}
      </div>
      <More data={data} />
    </section>
  );
}