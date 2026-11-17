
import { z } from "zod";
import { DEFAULT_PRIVACY, DEFAULT_TERMS } from "./legal-defaults";

const text = (max = 200) => z.string().trim().max(max);

const optionalUrl = z.union([
  z.literal(""),
  z.string().trim().url("Enter a valid URL"),
]);

const optionalEmail = z.union([
  z.literal(""),
  z.string().trim().email("Enter a valid email"),
]);

export const MODULE_KEYS = [
  "services",
  "projects",
  "blog",
  "gallery",
  "pricing",
] as const;

export type ModuleKey = (typeof MODULE_KEYS)[number];

// Map coordinate validation
const coord = z
  .string()
  .trim()
  .max(40)
  .refine(
    (v) => v === "" || /^-?\d+(\.\d+)?(\s*,\s*-?\d+(\.\d+)?)?$/.test(v),
    "Use numbers like 23.8103 (or paste both: 23.8103, 90.4125)",
  );

export const settingSchemas = {
  general: z.object({
    name: text(60).min(1, "Name is required"),
    title: text(120),
    description: text(300),
  }),

  contact: z.object({
    email: optionalEmail,
    phone: text(40),
    whatsapp: text(40),
    calendly: optionalUrl,
    location: text(120),
    hours: text(120),

    // Map coordinates
    mapLat: coord.default(""),
    mapLng: coord.default(""),
  }),

  social: z
    .array(
      z.object({
        label: text(40).min(1, "Social label is required"),
        url: z.string().trim().url("Enter a valid social URL"),
      }),
    )
    .max(20),

  nav: z
    .array(
      z.object({
        label: text(40).min(1, "Menu label is required"),
        href: z
          .string()
          .trim()
          .max(200)
          .regex(
            /^(\/|https?:\/\/)/,
            "Link must start with / or https://",
          ),
        visible: z.boolean(),
        module: z.enum(MODULE_KEYS).optional(),
      }),
    )
    .max(15),

  modules: z.object({
    services: z.boolean(),
    projects: z.boolean(),
    blog: z.boolean(),
    gallery: z.boolean(),
    pricing: z.boolean(),
  }),

  profile: z.object({
    photoUrl: z.string().trim().max(500),
    summary: text(1500),
    story: text(4000),
    availability: z.enum(["open", "limited", "booked", "hidden"]),
    availabilityNote: text(80),
    values: z
      .array(
        z.object({
          title: text(60),
          text: text(300),
        }),
      )
      .max(6),
  }),
  blog: z.object({
    comments: z.boolean(),
    newsletterBox: z.boolean(),
  }),

    analytics: z.object({
    vercel: z.boolean(),
    gaId: z
      .string()
      .trim()
      .max(20)
      .refine(
        (v) => v === "" || /^G-[A-Z0-9]{4,14}$/.test(v),
        "Google Analytics ID looks like G-XXXXXXXXXX",
      ),
  }),
  seo: z.object({
    ogImageUrl: z
      .string()
      .trim()
      .max(500)
      .refine((v) => v === "" || /^https:\/\//.test(v), "Image must be a https link"),
    noindex: z.boolean(),
  }),
  legal: z.object({ privacy: text(20000), terms: text(20000) }),
};

export type SettingKey = keyof typeof settingSchemas;

export type SiteSettings = {
  [K in SettingKey]: z.infer<(typeof settingSchemas)[K]>;
};

export const defaults: SiteSettings = {
  general: {
    name: "Antu",
    title: "Web Designer & Developer",
    description:
      "Freelance web designer and developer building fast, elegant websites.",
  },

  contact: {
    email: "",
    phone: "",
    whatsapp: "",
    calendly: "",
    location: "",
    hours: "",
    mapLat: "",
    mapLng: "",
  },

  social: [],

  nav: [
    { label: "Home", href: "/", visible: true },
    { label: "About", href: "/about", visible: true },
    { label: "Services", href: "/services", visible: true, module: "services" },
    { label: "Projects", href: "/projects", visible: true, module: "projects" },
    { label: "Blog", href: "/blog", visible: true, module: "blog" },
    { label: "Pricing", href: "/pricing", visible: true, module: "pricing" },
    { label: "Gallery", href: "/gallery", visible: true, module: "gallery" },
    { label: "Contact", href: "/contact", visible: true },
  ],

  modules: {
    services: true,
    projects: true,
    blog: true,
    gallery: true,
    pricing: true,
  },

  profile: {
    photoUrl: "",
    summary: "",
    story: "",
    availability: "open",
    availabilityNote: "",
    values: [],
  },
  blog: { comments: true, newsletterBox: true },
  analytics: { vercel: true, gaId: "" },
  seo: { ogImageUrl: "", noindex: false },
  legal: { privacy: DEFAULT_PRIVACY, terms: DEFAULT_TERMS },
};

export function getVisibleNav(s: SiteSettings) {
  return s.nav.filter((i) => i.visible && (!i.module || s.modules[i.module]));
}
