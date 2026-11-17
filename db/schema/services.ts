import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  status: text("status").notNull().default("draft"),
  icon: text("icon").notNull().default("code"),
  summary: text("summary").notNull().default(""),
  coverUrl: text("cover_url").notNull().default(""),
  description: text("description").notNull().default(""),
  features: jsonb("features").$type<{ text: string }[]>().notNull().default([]),
  process: jsonb("process")
    .$type<{ title: string; text: string }[]>()
    .notNull()
    .default([]),
  tools: jsonb("tools").$type<{ name: string }[]>().notNull().default([]),
  faqs: jsonb("faqs")
    .$type<{ question: string; answer: string }[]>()
    .notNull()
    .default([]),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});