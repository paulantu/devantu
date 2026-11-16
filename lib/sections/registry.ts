import { z } from "zod";

export const PAGE_KEYS = [
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
  { key: "services", label: "Services" },
  { key: "projects", label: "Projects" },
  { key: "blog", label: "Blog" },
  { key: "pricing", label: "Pricing" },
  { key: "gallery", label: "Gallery" },
  { key: "contact", label: "Contact" },
] as const;

type Base = { name: string; label: string };

export type Field =
  | (Base & { kind: "text" | "textarea" | "link"; max?: number; placeholder?: string })
  | (Base & { kind: "boolean" }) 
  | (Base & { kind: "select"; options: { value: string; label: string }[] })
  | (Base & { kind: "list"; itemLabel: string; max: number; fields: Field[] })
  | (Base & { kind: "image" })
;
  

export type SectionDef = {
  type: string;
  label: string;
  description: string;
  fields: Field[];
  defaults: Record<string, unknown>;
};

const isLink = (v: string) => v === "" || /^(\/|https?:\/\/)/.test(v);

function fieldSchema(f: Field): z.ZodType {
  switch (f.kind) {
    case "text":
      return z.string().trim().max(f.max ?? 200);
    case "textarea":
      return z.string().trim().max(f.max ?? 3000);
    case "link":
      return z
        .string()
        .trim()
        .max(300)
        .refine(isLink, "Link must start with / or https://");
    case "boolean":
      return z.boolean();
    case "image":
      return z.string().trim().max(500);
    case "select":
      return z.enum(f.options.map((o) => o.value) as [string, ...string[]]);
    case "list":
      return z.array(buildSchema(f.fields)).max(f.max);
  }
}

export function buildSchema(fields: Field[]) {
  const shape: Record<string, z.ZodType> = {};
  for (const f of fields) shape[f.name] = fieldSchema(f);
  return z.object(shape);
}

export const sectionList: SectionDef[] = [
  {
    type: "richText",
    label: "Text block",
    description: "A heading with paragraphs of text.",
    fields: [
      { name: "eyebrow", label: "Small label above heading", kind: "text", max: 60 },
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      { name: "body", label: "Text (blank line = new paragraph)", kind: "textarea", max: 4000 },
      {
        name: "align",
        label: "Alignment",
        kind: "select",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
        ],
      },
    ],
    defaults: { eyebrow: "", heading: "New section", body: "", align: "left" },
  },
  {
    type: "cta",
    label: "Call to action",
    description: "A highlighted box with one or two buttons.",
    fields: [
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      { name: "text", label: "Text", kind: "textarea", max: 300 },
      { name: "buttonLabel", label: "Main button label", kind: "text", max: 40 },
      { name: "buttonLink", label: "Main button link", kind: "link" },
      { name: "secondaryLabel", label: "Second button label", kind: "text", max: 40 },
      { name: "secondaryLink", label: "Second button link", kind: "link" },
    ],
    defaults: {
      heading: "Have a project in mind?",
      text: "Tell me about it and let's make it happen.",
      buttonLabel: "Got a project?",
      buttonLink: "/contact",
      secondaryLabel: "",
      secondaryLink: "",
    },
  },
  {
    type: "faq",
    label: "FAQ",
    description: "Questions and answers that open and close.",
    fields: [
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      {
        name: "items",
        label: "Questions",
        kind: "list",
        itemLabel: "Question",
        max: 20,
        fields: [
          { name: "question", label: "Question", kind: "text", max: 200 },
          { name: "answer", label: "Answer", kind: "textarea", max: 1500 },
        ],
      },
    ],
    defaults: { heading: "Frequently asked questions", items: [] },
  },
  {
    type: "stats",
    label: "Stats counters",
    description: "Big numbers, like projects completed or years of experience.",
    fields: [
      { name: "heading", label: "Heading (optional)", kind: "text", max: 160 },
      {
        name: "items",
        label: "Numbers",
        kind: "list",
        itemLabel: "Number",
        max: 8,
        fields: [
          { name: "value", label: "Value (e.g. 200+ or 95%)", kind: "text", max: 20 },
          { name: "label", label: "Label", kind: "text", max: 60 },
        ],
      },
    ],
    defaults: {
      heading: "",
      items: [
        { value: "200+", label: "Completed websites" },
        { value: "4+", label: "Years of experience" },
      ],
    },
  },
  {
    type: "techStrip",
    label: "Tech stack strip",
    description: "A slim band of tools and technologies you work with.",
    fields: [
      {
        name: "items",
        label: "Technologies",
        kind: "list",
        itemLabel: "Technology",
        max: 20,
        fields: [{ name: "name", label: "Name", kind: "text", max: 40 }],
      },
    ],
    defaults: {
      items: [
        { name: "Next.js" },
        { name: "React" },
        { name: "WordPress" },
        { name: "WooCommerce" },
        { name: "Shopify" },
        { name: "Webflow" },
        { name: "Framer" },
      ],
    },
  },
    {
    type: "servicesGrid",
    label: "Services grid",
    description: "Cards for your published services.",
    fields: [
      { name: "eyebrow", label: "Small label above heading", kind: "text", max: 60 },
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      { name: "text", label: "Intro text", kind: "textarea", max: 300 },
      { name: "buttonLabel", label: "Button label", kind: "text", max: 40 },
      { name: "buttonLink", label: "Button link", kind: "link" },
    ],
    defaults: {
      eyebrow: "services",
      heading: "What I do",
      text: "",
      buttonLabel: "All services",
      buttonLink: "/services",
    },
  },
  {
    type: "featuredProjects",
    label: "Featured projects",
    description: "Your featured projects (or the latest ones).",
    fields: [
      { name: "eyebrow", label: "Small label above heading", kind: "text", max: 60 },
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      { name: "text", label: "Intro text", kind: "textarea", max: 300 },
      {
        name: "count",
        label: "How many to show",
        kind: "select",
        options: [
          { value: "3", label: "3" },
          { value: "6", label: "6" },
          { value: "9", label: "9" },
        ],
      },
      { name: "buttonLabel", label: "Button label", kind: "text", max: 40 },
      { name: "buttonLink", label: "Button link", kind: "link" },
    ],
    defaults: {
      eyebrow: "projects",
      heading: "Selected work",
      text: "",
      count: "3",
      buttonLabel: "View all projects",
      buttonLink: "/projects",
    },
  },
  {
    type: "pricingTeaser",
    label: "Pricing teaser",
    description: "Up to three of your general pricing plans.",
    fields: [
      { name: "eyebrow", label: "Small label above heading", kind: "text", max: 60 },
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      { name: "text", label: "Intro text", kind: "textarea", max: 300 },
      { name: "buttonLabel", label: "Button label", kind: "text", max: 40 },
      { name: "buttonLink", label: "Button link", kind: "link" },
    ],
    defaults: {
      eyebrow: "pricing",
      heading: "Simple pricing",
      text: "",
      buttonLabel: "See all pricing",
      buttonLink: "/pricing",
    },
  },
  {
    type: "latestPosts",
    label: "Latest blog posts",
    description: "Your newest blog posts.",
    fields: [
      { name: "eyebrow", label: "Small label above heading", kind: "text", max: 60 },
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      { name: "text", label: "Intro text", kind: "textarea", max: 300 },
      {
        name: "count",
        label: "How many to show",
        kind: "select",
        options: [
          { value: "3", label: "3" },
          { value: "6", label: "6" },
        ],
      },
      { name: "buttonLabel", label: "Button label", kind: "text", max: 40 },
      { name: "buttonLink", label: "Button link", kind: "link" },
    ],
    defaults: {
      eyebrow: "blog",
      heading: "From the blog",
      text: "",
      count: "3",
      buttonLabel: "Read all posts",
      buttonLink: "/blog",
    },
  },

    {
    type: "newsletter",
    label: "Newsletter signup",
    description: "An email signup box.",
    fields: [
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      { name: "text", label: "Text", kind: "textarea", max: 300 },
      { name: "buttonLabel", label: "Button label", kind: "text", max: 30 },
    ],
    defaults: {
      heading: "Stay in the loop",
      text: "New posts and project updates, straight to your inbox.",
      buttonLabel: "Subscribe",
    },
  },

    {
    type: "galleryTeaser",
    label: "Gallery teaser",
    description: "A grid of your latest photos and videos.",
    fields: [
      { name: "eyebrow", label: "Small label above heading", kind: "text", max: 60 },
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      { name: "text", label: "Intro text", kind: "textarea", max: 300 },
      {
        name: "count",
        label: "How many to show",
        kind: "select",
        options: [
          { value: "6", label: "6" },
          { value: "9", label: "9" },
        ],
      },
      { name: "buttonLabel", label: "Button label", kind: "text", max: 40 },
      { name: "buttonLink", label: "Button link", kind: "link" },
    ],
    defaults: {
      eyebrow: "gallery",
      heading: "Memories",
      text: "",
      count: "6",
      buttonLabel: "Open the gallery",
      buttonLink: "/gallery",
    },
  },

    {
    type: "hero",
    label: "Hero",
    description: "The big intro at the top of the home page.",
    fields: [
      { name: "greeting", label: "Greeting", kind: "text", max: 30 },
      { name: "introLabel", label: "Text before your name (e.g. I'm)", kind: "text", max: 20 },
      { name: "name", label: "Name shown (empty = your name from Settings)", kind: "text", max: 60 },
      { name: "role", label: "Role line (empty = title from Settings)", kind: "text", max: 80 },
      { name: "text", label: "Short intro (optional)", kind: "textarea", max: 300 },
      { name: "primaryLabel", label: "Main button label", kind: "text", max: 40 },
      { name: "primaryLink", label: "Main button link", kind: "link" },
      { name: "secondaryLabel", label: "Second button label", kind: "text", max: 40 },
      { name: "secondaryLink", label: "Second button link", kind: "link" },
      { name: "photoUrl", label: "Photo (empty = your profile photo)", kind: "image" },
      {
        name: "photoStyle",
        label: "Photo style",
        kind: "select",
        options: [
          { value: "circle", label: "Round crop inside the ring" },
          { value: "cutout", label: "Cut-out (PNG with transparent background)" },
        ],
      },
      { name: "showAvailability", label: "Show the availability badge", kind: "boolean" },
    ],
    defaults: {
      greeting: "Hello",
      introLabel: "I'm",
      name: "",
      role: "",
      text: "",
      primaryLabel: "Got a project?",
      primaryLink: "/contact",
      secondaryLabel: "My resume",
      secondaryLink: "/api/cv",
      photoUrl: "",
      photoStyle: "circle",
      showAvailability: true,
    },
  },
  {
    type: "aboutTeaser",
    label: "About teaser",
    description: "Your services as a list beside a short About me with stats.",
    fields: [
      { name: "heading", label: "Heading", kind: "text", max: 80 },
      {
        name: "text",
        label: "Text (empty = your profile summary)",
        kind: "textarea",
        max: 600,
      },
      { name: "showServices", label: "Show your services on the left", kind: "boolean" },
      {
        name: "items",
        label: "Stats",
        kind: "list",
        itemLabel: "Stat",
        max: 4,
        fields: [
          { name: "value", label: "Value (e.g. 200+ or 95%)", kind: "text", max: 20 },
          { name: "label", label: "Label", kind: "text", max: 60 },
        ],
      },
      { name: "buttonLabel", label: "Button label", kind: "text", max: 40 },
      { name: "buttonLink", label: "Button link", kind: "link" },
    ],
    defaults: {
      heading: "About me",
      text: "",
      showServices: true,
      items: [
        { value: "200+", label: "Completed websites" },
        { value: "4+", label: "Years of experience" },
      ],
      buttonLabel: "More about me",
      buttonLink: "/about",
    },
  },
  {
    type: "process",
    label: "Process (how I work)",
    description: "Numbered steps that explain how you work.",
    fields: [
      { name: "eyebrow", label: "Small label above heading", kind: "text", max: 60 },
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      { name: "text", label: "Intro text", kind: "textarea", max: 300 },
      {
        name: "items",
        label: "Steps",
        kind: "list",
        itemLabel: "Step",
        max: 8,
        fields: [
          { name: "title", label: "Title", kind: "text", max: 60 },
          { name: "text", label: "Description", kind: "textarea", max: 300 },
        ],
      },
    ],
    defaults: {
      eyebrow: "process",
      heading: "How I work",
      text: "",
      items: [
        { title: "Discovery", text: "We talk through your goals, audience and timeline." },
        { title: "Design", text: "I shape the look and structure before any code is written." },
        { title: "Build", text: "I develop the site, test it on real devices and keep you updated." },
        { title: "Launch & support", text: "We go live together, and I stay around for what comes next." },
      ],
    },
  },
  {
    type: "testimonials",
    label: "Testimonials",
    description: "What clients say about working with you.",
    fields: [
      { name: "eyebrow", label: "Small label above heading", kind: "text", max: 60 },
      { name: "heading", label: "Heading", kind: "text", max: 160 },
      {
        name: "items",
        label: "Testimonials",
        kind: "list",
        itemLabel: "Testimonial",
        max: 8,
        fields: [
          { name: "quote", label: "Quote", kind: "textarea", max: 500 },
          { name: "author", label: "Name", kind: "text", max: 60 },
          { name: "role", label: "Role / company", kind: "text", max: 80 },
        ],
      },
    ],
    defaults: { eyebrow: "testimonials", heading: "Kind words", items: [] },
  },
];

export const sectionDefs: Record<string, SectionDef> = Object.fromEntries(
  sectionList.map((d) => [d.type, d]),
);