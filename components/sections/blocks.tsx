import { buttonStyles } from "@/components/ui/button";
import { SmartLink } from "@/components/ui/smart-link";
import { cn } from "@/lib/utils";
import {
  FeaturedProjectsBlock,
  PricingTeaserBlock,
  ServicesGridBlock,
  LatestPostsBlock,
  GalleryTeaserBlock,
} from "./dynamic-blocks";

import { NewsletterForm } from "@/components/site/newsletter-form";

import {
  AboutTeaserBlock,
  HeroBlock,
  ProcessBlock,
  TestimonialsBlock,
} from "./home-blocks";

type Props = { data: Record<string, unknown> };
const str = (v: unknown) => (typeof v === "string" ? v : "");

export function RichTextBlock({ data }: Props) {
  const center = data.align === "center";
  const paragraphs = str(data.body).split(/\n{2,}/).filter(Boolean);
  return (
    <section className="container-page py-16 md:py-24">
      <div className={cn("max-w-3xl space-y-4", center && "mx-auto text-center")}>
        {str(data.eyebrow) && (
          <p className="font-mono text-sm text-primary">{str(data.eyebrow)}</p>
        )}
        {str(data.heading) && (
          <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
            {str(data.heading)}
          </h2>
        )}
        {paragraphs.map((p, i) => (
          <p key={i} className="leading-relaxed text-muted">
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

export function CtaBlock({ data }: Props) {
  return (
    <section className="container-page py-16 md:py-24">
      <div className="rounded-2xl border border-border bg-elevated px-6 py-14 text-center md:px-12">
        <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
          {str(data.heading)}
        </h2>
        {str(data.text) && (
          <p className="mx-auto mt-3 max-w-xl text-muted">{str(data.text)}</p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {str(data.buttonLabel) && str(data.buttonLink) && (
            <SmartLink
              href={str(data.buttonLink)}
              className={buttonStyles({ size: "lg" })}
            >
              {str(data.buttonLabel)}
            </SmartLink>
          )}
          {str(data.secondaryLabel) && str(data.secondaryLink) && (
            <SmartLink
              href={str(data.secondaryLink)}
              className={buttonStyles({ variant: "outline", size: "lg" })}
            >
              {str(data.secondaryLabel)}
            </SmartLink>
          )}
        </div>
      </div>
    </section>
  );
}

export function FaqBlock({ data }: Props) {
  const items = (data.items ?? []) as { question: string; answer: string }[];
  if (items.length === 0) return null;
  return (
    <section className="container-page py-16 md:py-24">
      {str(data.heading) && (
        <h2 className="mb-8 font-heading text-3xl font-bold tracking-tight md:text-4xl">
          {str(data.heading)}
        </h2>
      )}
      <div className="max-w-3xl divide-y divide-border rounded-lg border border-border bg-surface">
        {items.map((item, i) => (
          <details key={i} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading font-semibold">
              {item.question}
              <span className="text-primary transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function StatValue({ value }: { value: string }) {
  const m = value.match(/^(.*?)([+%])$/);
  return m ? (
    <>
      {m[1]}
      <span className="text-primary">{m[2]}</span>
    </>
  ) : (
    <>{value}</>
  );
}

export function StatsBlock({ data }: Props) {
  const items = (data.items ?? []) as { value: string; label: string }[];
  if (items.length === 0) return null;
  return (
    <section className="container-page py-16 md:py-24">
      {str(data.heading) && (
        <h2 className="mb-8 font-heading text-3xl font-bold tracking-tight md:text-4xl">
          {str(data.heading)}
        </h2>
      )}
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {items.map((s, i) => (
          <div key={i}>
            <p className="font-heading text-4xl font-extrabold md:text-5xl">
              <StatValue value={s.value} />
            </p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TechStripBlock({ data }: Props) {
  const items = (data.items ?? []) as { name: string }[];
  if (items.length === 0) return null;
  return (
    <section className="border-y border-border bg-surface/60">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-8">
        {items.map((t, i) => (
          <span
            key={i}
            className="font-heading text-lg font-medium text-muted/70 transition-colors hover:text-foreground"
          >
            {t.name}
          </span>
        ))}
      </div>
    </section>
  );
}

export const blockComponents: Record<
  string,
  (props: Props) => React.ReactNode | Promise<React.ReactNode>
> = {
  richText: RichTextBlock,
  cta: CtaBlock,
  faq: FaqBlock,
  stats: StatsBlock,
  techStrip: TechStripBlock,
  servicesGrid: ServicesGridBlock,
  featuredProjects: FeaturedProjectsBlock,
  pricingTeaser: PricingTeaserBlock,
  latestPosts: LatestPostsBlock,
  newsletter: NewsletterBlock,
  galleryTeaser: GalleryTeaserBlock,
  hero: HeroBlock,
  aboutTeaser: AboutTeaserBlock,
  process: ProcessBlock,
  testimonials: TestimonialsBlock,
};


export function NewsletterBlock({ data }: Props) {
  return (
    <section className="container-page py-16 md:py-24">
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-elevated px-6 py-12 text-center md:px-12">
        <h2 className="font-heading text-3xl font-bold tracking-tight">
          {str(data.heading)}
        </h2>
        {str(data.text) && <p className="mx-auto mt-3 max-w-md text-muted">{str(data.text)}</p>}
        <div className="mt-6">
          <NewsletterForm source="section" buttonLabel={str(data.buttonLabel) || "Subscribe"} />
        </div>
      </div>
    </section>
  );
}
