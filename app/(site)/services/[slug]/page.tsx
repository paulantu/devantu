import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getServiceBySlug } from "@/lib/services";
import { getSiteSettings } from "@/lib/settings";
import { buttonStyles } from "@/components/ui/button";
import { ServiceIcon } from "@/components/ui/service-icon";
import { CtaBlock, FaqBlock } from "@/components/sections/blocks";

import { getProjectsForService } from "@/lib/projects";
import { ProjectCard } from "@/components/site/project-card";

import { getPlansForService } from "@/lib/pricing";
import { PricingView } from "@/components/site/pricing-view";

import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/lib/site-config";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.seoTitle || service.title,
    description: service.seoDescription || service.summary,
  };
}

async function ServiceContent({ params }: Props) {
  const { slug } = await params;
  const settings = await getSiteSettings();
  if (!settings.modules.services) notFound();

  const sv = await getServiceBySlug(slug);
  if (!sv) notFound();

  const paragraphs = sv.description.split(/\n{2,}/).filter(Boolean);
  const related = settings.modules.projects
    ? await getProjectsForService(sv.id)
    : [];
  const plans = settings.modules.pricing ? await getPlansForService(sv.id) : [];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: sv.title,
          description: sv.summary,
          url: `${siteConfig.url}/services/${sv.slug}`,
          provider: { "@type": "Person", name: settings.general.name },
        }}
      />
      <section className="container-page grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <div>
          <Link href="/services" className="font-mono text-sm text-primary">
            ← services
          </Link>
          <span className="mt-6 flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ServiceIcon name={sv.icon} className="size-7" />
          </span>
          <h1 className="mt-5 font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
            {sv.title}
          </h1>
          <p className="mt-4 text-lg text-muted">{sv.summary}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/contact?service=${sv.slug}`}
              className={buttonStyles({ size: "lg" })}
            >
              Get a quote
            </Link>
            <Link
              href="/projects"
              className={buttonStyles({ variant: "outline", size: "lg" })}
            >
              See my work
            </Link>
          </div>
        </div>
        {sv.coverUrl && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border">
            <Image
              src={sv.coverUrl}
              alt={sv.title}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </section>

      {(paragraphs.length > 0 || sv.features.length > 0) && (
        <section className="container-page grid gap-12 pb-16 md:grid-cols-5 md:pb-24">
          <div className="space-y-4 md:col-span-3">
            <h2 className="font-heading text-2xl font-bold">Overview</h2>
            {paragraphs.map((p, i) => (
              <p key={i} className="leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </div>
          {sv.features.length > 0 && (
            <div className="md:col-span-2">
              <h2 className="font-heading text-2xl font-bold">What&apos;s included</h2>
              <ul className="mt-4 space-y-3">
                {sv.features.map((f, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {sv.process.length > 0 && (
        <section className="container-page pb-16 md:pb-24">
          <h2 className="font-heading text-2xl font-bold">How it works</h2>
          <ol className="relative mt-8 max-w-2xl space-y-8 border-l border-primary/40 pl-8">
            {sv.process.map((p, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[2.4rem] top-1.5 size-3 rounded-full bg-primary" />
                <h3 className="font-heading font-semibold">
                  <span className="mr-2 font-mono text-sm text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {p.title}
                </h3>
                {p.text && <p className="mt-1 text-sm text-muted">{p.text}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {sv.tools.length > 0 && (
        <section className="container-page pb-16 md:pb-24">
          <h2 className="font-heading text-2xl font-bold">Tools I use</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {sv.tools.map((t, i) => (
              <span
                key={i}
                className="rounded-full border border-border bg-surface px-4 py-1.5 font-mono text-sm"
              >
                {t.name}
              </span>
            ))}
          </div>
        </section>
      )}

      
    {related.length > 0 && (
        <section className="container-page pb-16 md:pb-24">
          <h2 className="font-heading text-2xl font-bold">Related work</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {related.slice(0, 3).map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

    {plans.length > 0 && (
        <section className="container-page pb-16 md:pb-24">
          <h2 className="font-heading text-2xl font-bold">Pricing</h2>
          <div className="mt-6">
            <PricingView plans={plans} mode="service" />
          </div>
        </section>
      )}

      <FaqBlock data={{ heading: "Questions", items: sv.faqs }} />
      <CtaBlock
        data={{
          heading: `Interested in ${sv.title}?`,
          text: "Tell me about your project and I'll get back to you soon.",
          buttonLabel: "Get a quote",
          buttonLink: `/contact?service=${sv.slug}`,
        }}
      />
    </>
  );
}

export default function ServicePage({ params }: Props) {
  return (
    <Suspense fallback={<div className="container-page py-24" />}>
      <ServiceContent params={params} />
    </Suspense>
  );
}