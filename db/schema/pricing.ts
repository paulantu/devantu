import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { services } from "./services";

export const pricingPlans = pgTable("pricing_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  status: text("status").notNull().default("draft"),
  serviceId: uuid("service_id").references(() => services.id, {
    onDelete: "set null",
  }),
  billing: text("billing").notNull().default("fixed"),
  priceUsd: integer("price_usd"),
  priceBdt: integer("price_bdt"),
  customQuote: boolean("custom_quote").notNull().default(false),
  tagline: text("tagline").notNull().default(""),
  deliveryTime: text("delivery_time").notNull().default(""),
  revisions: text("revisions").notNull().default(""),
  highlighted: boolean("highlighted").notNull().default(false),
    badge: text("badge").notNull().default(""),
  features: jsonb("features").$type<{ text: string }[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const quoteRequests = pgTable(
  "quote_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    planId: uuid("plan_id").references(() => pricingPlans.id, {
      onDelete: "set null",
    }),
    planName: text("plan_name").notNull().default(""),
    serviceId: uuid("service_id").references(() => services.id, {
      onDelete: "set null",
    }),
    serviceTitle: text("service_title").notNull().default(""),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull().default(""),
    budget: text("budget").notNull().default(""),
    deadline: text("deadline").notNull().default(""),
    details: text("details").notNull().default(""),
    status: text("status").notNull().default("new"),
    notes: text("notes").notNull().default(""),
    ipHash: text("ip_hash").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("quote_requests_status_idx").on(t.status, t.createdAt)],
);