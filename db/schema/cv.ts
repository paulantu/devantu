import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const cvEntries = pgTable(
  "cv_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kind: text("kind").notNull(),
    title: text("title").notNull().default(""),
    organization: text("organization").notNull().default(""),
    location: text("location").notNull().default(""),
    startDate: text("start_date").notNull().default(""),
    endDate: text("end_date").notNull().default(""),
    current: boolean("current").notNull().default(false),
    description: text("description").notNull().default(""),
    url: text("url").notNull().default(""),
    level: integer("level").notNull().default(80),
    isVisible: boolean("is_visible").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("cv_entries_kind_idx").on(t.kind, t.sortOrder)],
);