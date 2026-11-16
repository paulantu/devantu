import { buildSchema, type Field } from "@/lib/sections/registry";

export const BILLING_OPTIONS = [
  { value: "fixed", label: "Fixed project price" },
  { value: "hourly", label: "Hourly rate" },
  { value: "monthly", label: "Monthly retainer" },
];

export function planFields(
  serviceOptions: { value: string; label: string }[],
): Field[] {
  return [
    { name: "name", label: "Plan name", kind: "text", max: 80 },
    {
      name: "status",
      label: "Visibility",
      kind: "select",
      options: [
        { value: "draft", label: "Draft (hidden)" },
        { value: "published", label: "Published" },
      ],
    },
    { name: "serviceId", label: "Attach to a service", kind: "select", options: serviceOptions },
    { name: "billing", label: "Billing type", kind: "select", options: BILLING_OPTIONS },
    { name: "priceUsd", label: "Price in USD (numbers only)", kind: "text", max: 12 },
    { name: "priceBdt", label: "Price in BDT (numbers only)", kind: "text", max: 12 },
    { name: "customQuote", label: "Hide the price and show Custom quote", kind: "boolean" },
    { name: "highlighted", label: "Highlight the card with a glowing border", kind: "boolean" },
    { name: "badge", label: "Badge text (optional, e.g. Most popular, Best value)", kind: "text", max: 24 },
    { name: "tagline", label: "Short description", kind: "textarea", max: 200 },
    { name: "deliveryTime", label: "Delivery time (e.g. 2 weeks)", kind: "text", max: 60 },
    { name: "revisions", label: "Revisions (e.g. 3 rounds)", kind: "text", max: 60 },
    {
      name: "features",
      label: "Features",
      kind: "list",
      itemLabel: "Feature",
      max: 30,
      fields: [{ name: "text", label: "Feature", kind: "text", max: 140 }],
    },
  ];
}

export const planSchema = (opts: { value: string; label: string }[]) =>
  buildSchema(planFields(opts));

export type PlanInput = {
  name: string;
  status: "draft" | "published";
  serviceId: string;
  billing: string;
  priceUsd: string;
  priceBdt: string;
  customQuote: boolean;
  highlighted: boolean;
  badge: string;
  tagline: string;
  deliveryTime: string;
  revisions: string;
  features: { text: string }[];
};

export const QUOTE_STATUSES = ["new", "quoted", "won", "lost"] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];