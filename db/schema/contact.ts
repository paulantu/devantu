import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull().default(""),
    serviceTitle: text("service_title").notNull().default(""),
    budget: text("budget").notNull().default(""),
    message: text("message").notNull(),
    status: text("status").notNull().default("new"),
    notes: text("notes").notNull().default(""),
    ipHash: text("ip_hash").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("contact_messages_status_idx").on(t.status, t.createdAt)],
);