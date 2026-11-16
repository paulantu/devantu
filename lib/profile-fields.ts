import type { Field } from "@/lib/sections/registry";

export const profileFields: Field[] = [
  { name: "photoUrl", label: "Profile photo", kind: "image" },
  {
    name: "summary",
    label: "Professional summary (top of the page and the PDF)",
    kind: "textarea",
    max: 1500,
  },
  {
    name: "availability",
    label: "Availability",
    kind: "select",
    options: [
      { value: "open", label: "Open for work" },
      { value: "limited", label: "Limited availability" },
      { value: "booked", label: "Fully booked" },
      { value: "hidden", label: "Don't show" },
    ],
  },
  {
    name: "availabilityNote",
    label: "Availability note (optional, e.g. Booking from January)",
    kind: "text",
    max: 80,
  },
  { name: "story", label: "My story (blank line = new paragraph)", kind: "textarea", max: 4000 },
  {
    name: "values",
    label: "What I value",
    kind: "list",
    itemLabel: "Value",
    max: 6,
    fields: [
      { name: "title", label: "Title", kind: "text", max: 60 },
      { name: "text", label: "Short text", kind: "textarea", max: 300 },
    ],
  },
];