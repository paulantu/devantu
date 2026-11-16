import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServiceIcon } from "@/components/ui/service-icon";

export function ServiceCard({
  service,
}: {
  service: { slug: string; title: string; summary: string; icon: string };
}) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-surface p-6 transition-colors hover:border-primary"
    >
      <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <ServiceIcon name={service.icon} className="size-6" />
      </span>
      <h3 className="mt-5 font-heading text-xl font-bold">{service.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
        {service.summary}
      </p>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
        Learn more
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}