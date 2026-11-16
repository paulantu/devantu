import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const galleryAlbums = pgTable("gallery_albums", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  coverUrl: text("cover_url").notNull().default(""),
  takenOn: text("taken_on").notNull().default(""),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const galleryItems = pgTable(
  "gallery_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    albumId: uuid("album_id").references(() => galleryAlbums.id, {
      onDelete: "set null",
    }),
    type: text("type").notNull().default("image"),
    imageUrl: text("image_url").notNull().default(""),
    videoUrl: text("video_url").notNull().default(""),
    thumbUrl: text("thumb_url").notNull().default(""),
    width: integer("width"),
    height: integer("height"),
    caption: text("caption").notNull().default(""),
    location: text("location").notNull().default(""),
    takenOn: text("taken_on").notNull().default(""),
    isVisible: boolean("is_visible").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("gallery_items_album_idx").on(t.albumId, t.takenOn)],
);