import { buildSchema, type Field } from "@/lib/sections/registry";

const progressOptions = Array.from({ length: 11 }, (_, i) => ({
  value: String(i * 10),
  label: `${i * 10}%`,
}));

export const projectFields: Field[] = [
  { name: "title", label: "Title", kind: "text", max: 140 },
  { name: "slug", label: "URL slug (e.g. my-shop-website)", kind: "text", max: 80 },
  {
    name: "status",
    label: "Visibility",
    kind: "select",
    options: [
      { value: "draft", label: "Draft (hidden)" },
      { value: "published", label: "Published" },
    ],
  },
  { name: "featured", label: "Featured on the home page", kind: "boolean" },
  {
    name: "projectStatus",
    label: "Project status",
    kind: "select",
    options: [
      { value: "completed", label: "Completed" },
      { value: "ongoing", label: "Ongoing" },
    ],
  },
  { name: "progress", label: "Progress (for ongoing projects)", kind: "select", options: progressOptions },
  { name: "year", label: "Year (e.g. 2026)", kind: "text", max: 4 },
  { name: "client", label: "Client", kind: "text", max: 120 },
  { name: "role", label: "My role", kind: "text", max: 120 },
  { name: "timeline", label: "Timeline (e.g. 3 weeks)", kind: "text", max: 80 },
  { name: "summary", label: "Short summary (shown on cards)", kind: "textarea", max: 300 },
  { name: "coverUrl", label: "Cover image", kind: "image" },
  { name: "liveUrl", label: "Live site link", kind: "link" },
  { name: "sourceUrl", label: "Source code link", kind: "link" },
  { name: "videoUrl", label: "Video link (YouTube or Vimeo)", kind: "link" },
  { name: "problem", label: "The problem (blank line = new paragraph)", kind: "textarea", max: 4000 },
  { name: "solution", label: "The solution", kind: "textarea", max: 4000 },
  { name: "results", label: "The results", kind: "textarea", max: 4000 },
  {
    name: "tech",
    label: "Tech stack",
    kind: "list",
    itemLabel: "Technology",
    max: 25,
    fields: [{ name: "name", label: "Name", kind: "text", max: 40 }],
  },
  {
    name: "gallery",
    label: "Screenshots",
    kind: "list",
    itemLabel: "Screenshot",
    max: 20,
    fields: [
      { name: "image", label: "Image", kind: "image" },
      { name: "caption", label: "Caption (optional)", kind: "text", max: 120 },
    ],
  },
  { name: "testimonialQuote", label: "Client testimonial", kind: "textarea", max: 600 },
  { name: "testimonialAuthor", label: "Testimonial author", kind: "text", max: 80 },
  { name: "testimonialRole", label: "Author role / company", kind: "text", max: 80 },
  { name: "seoTitle", label: "SEO title (optional)", kind: "text", max: 70 },
  { name: "seoDescription", label: "SEO description (optional)", kind: "textarea", max: 160 },
];

export const projectSchema = buildSchema(projectFields);

export type ProjectInput = {
  title: string;
  slug: string;
  status: "draft" | "published";
  featured: boolean;
  projectStatus: "completed" | "ongoing";
  progress: string;
  year: string;
  client: string;
  role: string;
  timeline: string;
  summary: string;
  coverUrl: string;
  liveUrl: string;
  sourceUrl: string;
  videoUrl: string;
  problem: string;
  solution: string;
  results: string;
  tech: { name: string }[];
  gallery: { image: string; caption: string }[];
  testimonialQuote: string;
  testimonialAuthor: string;
  testimonialRole: string;
  seoTitle: string;
  seoDescription: string;
};