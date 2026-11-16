import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPlans } from "@/lib/pricing";
import { getSiteSettings } from "@/lib/settings";
import { PricingView } from "@/components/site/pricing-view";
import { QuoteDialog } from "@/components/site/quote-dialog";
import { PageSections } from "@/components/sections/page-sections";

export const metadata: Metadata = { title: "Pricing" };

async function PricingContent() {
  const settings = await getSiteSettings();
  if (!settings.modules.pricing) notFound();
  const plans = await getPublishedPlans();

  return (
    <section className="container-page py-16 md:py-24">
      <p className="font-mono text-sm text-primary">pricing</p>
      <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
        Simple pricing<span className="text-primary">.</span>
      </h1>
      <p className="mt-4 max-w-xl text-muted">
        Pick a package and send a quote request. I&apos;ll reply with the details
        for your project.
      </p>

      {plans.length === 0 ? (
        <p className="mt-12 text-muted">Pricing will appear here soon.</p>
      ) : (
        <div className="mt-12">
          <PricingView plans={plans} mode="page" />
        </div>
      )}

      <div className="mt-16 rounded-xl border border-border bg-surface p-8 text-center">
        <h2 className="font-heading text-xl font-bold">Need something different?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Tell me what you have in mind and I&apos;ll put together a custom quote.
        </p>
        <div className="mt-5 flex justify-center">
          <QuoteDialog label="Request a custom quote" />
        </div>
      </div>
    </section>
  );
}

export default function PricingPage() {
  return (
    <>
      <Suspense fallback={<div className="container-page py-24" />}>
        <PricingContent />
      </Suspense>
      <PageSections pageKey="pricing" />
    </>
  );
}