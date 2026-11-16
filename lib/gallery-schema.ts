import { buildSchema, type Field } from "@/lib/sections/registry";

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const albumFields: Field[] = [
  { name: "title", label: "Title", kind: "text", max: 120 },
  { name: "slug", label: "URL slug", kind: "text", max: 80 },
  {
    name: "status",
    label: "Visibility",
    kind: "select",
    options: [
      { value: "draft", label: "Draft (hidden)" },
      { value: "published", label: "Published" },
    ],
  },
  { name: "takenOn", label: "Date (YYYY-MM-DD, optional)", kind: "text", max: 10 },
  { name: "description", label: "Description", kind: "textarea", max: 500 },
  {
    name: "coverUrl",
    label: "Cover image (optional, defaults to the first photo)",
    kind: "image",
  },
];

export const albumSchema = buildSchema(albumFields);