import { buildSchema, type Field } from "@/lib/sections/registry";

export const ICON_OPTIONS = [
  { value: "code", label: "Code" },
  { value: "palette", label: "Design" },
  { value: "monitor", label: "Website" },
  { value: "mobile", label: "Mobile app" },
  { value: "cart", label: "E-commerce" },
  { value: "server", label: "Hosting" },
  { value: "search", label: "SEO" },
  { value: "rocket", label: "Launch" },
  { value: "layers", label: "Layers" },
  { value: "pen", label: "Branding" },
  { value: "globe", label: "Globe" },
  { value: "wrench", label: "Maintenance" },
  { value: "zap", label: "Performance" },
  { value: "shield", label: "Security" },
  { value: "database", label: "Database" },
  { value: "cloud", label: "Cloud" },
  { value: "briefcase", label: "Consulting" },
];

export const serviceFields: Field[] = [
  { name: "title", label: "Title", kind: "text", max: 120 },
  { name: "slug", label: "URL slug (e.g. web-design)", kind: "text", max: 80 },
  {
    name: "status",
    label: "Status",
    kind: "select",
    options: [
      { value: "draft", label: "Draft (hidden)" },
      { value: "published", label: "Published" },
    ],
  },
  { name: "icon", label: "Icon", kind: "select", options: ICON_OPTIONS },
  { name: "summary", label: "Short summary (shown on cards)", kind: "textarea", max: 300 },
  { name: "coverUrl", label: "Cover image", kind: "image" },
  {
    name: "description",
    label: "Overview (blank line = new paragraph)",
    kind: "textarea",
    max: 6000,
  },
  {
    name: "features",
    label: "What's included",
    kind: "list",
    itemLabel: "Item",
    max: 20,
    fields: [{ name: "text", label: "Text", kind: "text", max: 160 }],
  },
  {
    name: "process",
    label: "Process steps",
    kind: "list",
    itemLabel: "Step",
    max: 10,
    fields: [
      { name: "title", label: "Step title", kind: "text", max: 80 },
      { name: "text", label: "Description", kind: "textarea", max: 400 },
    ],
  },
  {
    name: "tools",
    label: "Tools and technologies",
    kind: "list",
    itemLabel: "Tool",
    max: 20,
    fields: [{ name: "name", label: "Name", kind: "text", max: 40 }],
  },
  {
    name: "faqs",
    label: "FAQ",
    kind: "list",
    itemLabel: "Question",
    max: 15,
    fields: [
      { name: "question", label: "Question", kind: "text", max: 200 },
      { name: "answer", label: "Answer", kind: "textarea", max: 1200 },
    ],
  },
  { name: "seoTitle", label: "SEO title (optional)", kind: "text", max: 70 },
  { name: "seoDescription", label: "SEO description (optional)", kind: "textarea", max: 160 },
];

export const serviceSchema = buildSchema(serviceFields);

export type ServiceInput = {
  title: string;
  slug: string;
  status: "draft" | "published";
  icon: string;
  summary: string;
  coverUrl: string;
  description: string;
  features: { text: string }[];
  process: { title: string; text: string }[];
  tools: { name: string }[];
  faqs: { question: string; answer: string }[];
  seoTitle: string;
  seoDescription: string;
};