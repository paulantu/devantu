"use client";

import { useState } from "react";
import { Check, Clock, Minus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuoteDialog } from "./quote-dialog";

export type PlanView = {
  id: string;
  name: string;
  tagline: string;
  billing: string;
  priceUsd: number | null;
  priceBdt: number | null;
  customQuote: boolean;
  deliveryTime: string;
  revisions: string;
  highlighted: boolean;
  badge: string;
  features: { text: string }[];
  serviceId: string | null;
  serviceTitle: string | null;
};

type Cur = "USD" | "BDT";
const SUFFIX: Record<string, string> = {
  fixed: "/ project",
  hourly: "/ hour",
  monthly: "/ month",
};

function priceOf(p: PlanView, cur: Cur): string | null {
  if (p.customQuote) return null;
  const order: Cur[] = cur === "USD" ? ["USD", "BDT"] : ["BDT", "USD"];
  for (const c of order) {
    const v = c === "USD" ? p.priceUsd : p.priceBdt;
    if (v != null) return `${c === "USD" ? "$" : "৳"}${v.toLocaleString("en-US")}`;
  }
  return null;
}

function PlanCard({ plan, cur }: { plan: PlanView; cur: Cur }) {
  const price = priceOf(plan, cur);
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border bg-surface p-6",
        plan.highlighted ? "border-primary shadow-[0_0_40px_-12px_var(--primary)]" : "border-border",
      )}
    >
      {plan.badge && (
        <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 font-mono text-xs text-primary-foreground">
          {plan.badge}
        </span>
      )}
      <h3 className="font-heading text-xl font-bold">{plan.name}</h3>
      {plan.tagline && <p className="mt-1 text-sm text-muted">{plan.tagline}</p>}

      <p className="mt-5 font-heading text-4xl font-extrabold">
        {price ?? <span className="text-2xl">Custom quote</span>}
        {price && (
          <span className="ml-1 text-sm font-normal text-muted">
            {SUFFIX[plan.billing] ?? ""}
          </span>
        )}
      </p>

      {(plan.deliveryTime || plan.revisions) && (
        <div className="mt-4 space-y-1.5 text-sm text-muted">
          {plan.deliveryTime && (
            <p className="flex items-center gap-2">
              <Clock className="size-4 text-primary" /> {plan.deliveryTime}
            </p>
          )}
          {plan.revisions && (
            <p className="flex items-center gap-2">
              <RefreshCw className="size-4 text-primary" /> {plan.revisions}
            </p>
          )}
        </div>
      )}

      <ul className="mt-5 flex-1 space-y-2.5 border-t border-border pt-5">
        {plan.features.map((f, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{f.text}</span>
          </li>
        ))}
      </ul>

      <QuoteDialog
        plan={{ id: plan.id, name: plan.name }}
        variant={plan.highlighted ? "primary" : "outline"}
        className="mt-6 w-full"
      />
    </div>
  );
}

function Comparison({ plans }: { plans: PlanView[] }) {
  const features: string[] = [];
  for (const p of plans) {
    for (const f of p.features) {
      const t = f.text.trim();
      if (t && !features.some((x) => x.toLowerCase() === t.toLowerCase())) features.push(t);
    }
  }
  const has = (p: PlanView, t: string) =>
    p.features.some((f) => f.text.trim().toLowerCase() === t.toLowerCase());

  const showDelivery = plans.some((p) => p.deliveryTime);
  const showRevisions = plans.some((p) => p.revisions);
  if (features.length === 0 && !showDelivery && !showRevisions) return null;

  const cell = "border-t border-border p-4";
  return (
    <div className="mt-10 overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <thead className="bg-surface">
          <tr>
            <th className="p-4 font-medium text-muted">Compare plans</th>
            {plans.map((p) => (
              <th key={p.id} className="p-4 font-heading">
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {showDelivery && (
            <tr>
              <td className={cell}>Delivery time</td>
              {plans.map((p) => (
                <td key={p.id} className={cell}>{p.deliveryTime || "-"}</td>
              ))}
            </tr>
          )}
          {showRevisions && (
            <tr>
              <td className={cell}>Revisions</td>
              {plans.map((p) => (
                <td key={p.id} className={cell}>{p.revisions || "-"}</td>
              ))}
            </tr>
          )}
          {features.map((t) => (
            <tr key={t}>
              <td className={cell}>{t}</td>
              {plans.map((p) => (
                <td key={p.id} className={cell}>
                  {has(p, t) ? (
                    <Check className="size-4 text-primary" />
                  ) : (
                    <Minus className="size-4 text-muted" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PricingView({
  plans,
  mode = "page",
}: {
  plans: PlanView[];
  mode?: "page" | "service";
}) {
  const [cur, setCur] = useState<Cur>("USD");
  const hasBoth = plans.some(
    (p) => !p.customQuote && p.priceUsd != null && p.priceBdt != null,
  );

  const groups: { key: string; title: string | null; plans: PlanView[] }[] = [];
  if (mode === "page") {
    const general = plans.filter((p) => !p.serviceId);
    const anyAttached = plans.some((p) => p.serviceId);
    if (general.length > 0) {
      groups.push({
        key: "general",
        title: anyAttached ? "General packages" : null,
        plans: general,
      });
    }
    const byService = new Map<string, { title: string; plans: PlanView[] }>();
    for (const p of plans.filter((x) => x.serviceId)) {
      const g = byService.get(p.serviceId!) ?? { title: p.serviceTitle ?? "Service", plans: [] };
      g.plans.push(p);
      byService.set(p.serviceId!, g);
    }
    for (const [key, g] of byService) groups.push({ key, ...g });
  } else {
    groups.push({ key: "all", title: null, plans });
  }

  return (
    <div className="space-y-14">
      {hasBoth && (
        <div className="inline-flex rounded-md border border-border p-1 text-sm">
          {(["USD", "BDT"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCur(c)}
              className={cn(
                "rounded px-4 py-1.5 font-medium transition-colors",
                cur === c ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {groups.map((g) => (
        <div key={g.key}>
          {g.title && (
            <h2 className="mb-6 font-heading text-2xl font-bold">{g.title}</h2>
          )}
          <div className="grid gap-6 pt-3 md:grid-cols-2 lg:grid-cols-3">
            {g.plans.map((p) => (
              <PlanCard key={p.id} plan={p} cur={cur} />
            ))}
          </div>
          {mode === "page" && g.plans.length >= 2 && <Comparison plans={g.plans} />}
        </div>
      ))}
    </div>
  );
}