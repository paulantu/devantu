import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedServices } from "@/lib/services";
import { getSiteSettings } from "@/lib/settings";
import { ServiceCard } from "@/components/site/service-card";
import { PageSections } from "@/components/sections/page-sections";

export const metadata: Metadata = { title: "Services" };

async function ServicesGrid() {
  const settings = await getSiteSettings();
  if (!settings.modules.services) notFound();
  const list = await getPublishedServices();

  return (
    <section className="container-page py-16 md:py-24">
      <p className="font-mono text-sm text-primary">services</p>
      <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
        What I do<span className="text-primary">.</span>
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        Everything you need to launch and grow a website, from first sketch to
        final polish.
      </p>

      {list.length === 0 ? (
        <p className="mt-12 text-muted">Services will appear here soon.</p>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function ServicesPage() {
  return (
    <>
      <Suspense fallback={<div className="container-page py-24" />}>
        <ServicesGrid />
      </Suspense>
      <PageSections pageKey="services" />
    </>
  );
}