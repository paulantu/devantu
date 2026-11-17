import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { services } from "./services";

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  status: text("status").notNull().default("draft"),
  featured: boolean("featured").notNull().default(false),
  projectStatus: text("project_status").notNull().default("completed"),
  progress: integer("progress").notNull().default(0),
  year: text("year").notNull().default(""),
  client: text("client").notNull().default(""),
  role: text("role").notNull().default(""),
  timeline: text("timeline").notNull().default(""),
  summary: text("summary").notNull().default(""),
  coverUrl: text("cover_url").notNull().default(""),
  liveUrl: text("live_url").notNull().default(""),
  sourceUrl: text("source_url").notNull().default(""),
  videoUrl: text("video_url").notNull().default(""),
  problem: text("problem").notNull().default(""),
  solution: text("solution").notNull().default(""),
  results: text("results").notNull().default(""),
  tech: jsonb("tech").$type<{ name: string }[]>().notNull().default([]),
  gallery: jsonb("gallery")
    .$type<{ image: string; caption: string }[]>()
    .notNull()
    .default([]),
  testimonialQuote: text("testimonial_quote").notNull().default(""),
  testimonialAuthor: text("testimonial_author").notNull().default(""),
  testimonialRole: text("testimonial_role").notNull().default(""),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectServices = pgTable(
  "project_services",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.serviceId] })],
);