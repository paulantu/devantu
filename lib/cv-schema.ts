import { buildSchema, type Field } from "@/lib/sections/registry";

export const CV_KINDS = [
  "experience",
  "education",
  "skill",
  "certification",
  "award",
  "language",
] as const;
export type CvKind = (typeof CV_KINDS)[number];

const dateHint = "(YYYY-MM or YYYY)";

const title = (label: string): Field => ({ name: "title", label, kind: "text", max: 160 });
const org = (label: string): Field => ({ name: "organization", label, kind: "text", max: 160 });
const location: Field = { name: "location", label: "Location", kind: "text", max: 120 };
const start = (label: string): Field => ({ name: "startDate", label: `${label} ${dateHint}`, kind: "text", max: 7 });
const end: Field = { name: "endDate", label: `End ${dateHint}`, kind: "text", max: 7 };
const description = (label: string): Field => ({ name: "description", label, kind: "textarea", max: 3000 });
const url = (label: string): Field => ({ name: "url", label, kind: "link" });

type KindDef = {
  label: string;
  plural: string;
  hint: string;
  fields: Field[];
};

export const cvKindDefs: Record<CvKind, KindDef> = {
  experience: {
    label: "experience",
    plural: "Experience",
    hint: "Newest first. One line in the description becomes one bullet point.",
    fields: [
      title("Job title"),
      org("Company"),
      location,
            start("Start"),
      { name: "current", label: "I currently work here", kind: "boolean" },
      end,
      description("What you did (one achievement per line)"),
      url("Company link"),
    ],
  },
  education: {
    label: "education entry",
    plural: "Education",
    hint: "Degrees, courses and bootcamps.",
    fields: [
      title("Degree or program"),
      org("School"),
      location,
      start("Start"),
      end,
      description("Details (optional, one line per bullet)"),
    ],
  },
  skill: {
    label: "skill",
    plural: "Skills",
    hint: "Skills are grouped by the group name, for example Frontend or Tools.",
    fields: [
      title("Skill"),
      org("Group (e.g. Frontend, Tools)"),
      {
        name: "level",
        label: "Level",
        kind: "select",
        options: [30, 40, 50, 60, 70, 80, 90, 100].map((n) => ({
          value: String(n),
          label: `${n}%`,
        })),
      },
    ],
  },
  certification: {
    label: "certification",
    plural: "Certifications",
    hint: "Courses and certificates you earned.",
    fields: [
      title("Certificate"),
      org("Issued by"),
      start("Issued"),
      url("Credential link"),
    ],
  },
  award: {
    label: "award",
    plural: "Awards",
    hint: "Awards and achievements.",
    fields: [
      title("Award"),
      org("Given by"),
      start("Year"),
      description("Details (optional)"),
    ],
  },
  language: {
    label: "language",
    plural: "Languages",
    hint: "Languages you speak.",
    fields: [title("Language"), org("Level (e.g. Native, Fluent)")],
  },
};

export const cvKindSchemas = Object.fromEntries(
  CV_KINDS.map((k) => [k, buildSchema(cvKindDefs[k].fields)]),
) as Record<CvKind, ReturnType<typeof buildSchema>>;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatCvDate(v: string) {
  if (!v) return "";
  const [y, m] = v.split("-");
  return m ? `${MONTHS[Number(m) - 1]} ${y}` : y;
}

export function formatRange(e: {
  startDate: string;
  endDate: string;
  current: boolean;
}) {
  const start = formatCvDate(e.startDate);
  const end = e.current ? "Present" : formatCvDate(e.endDate);
  return [start, end].filter(Boolean).join(" - ");
}

export const lines = (s: string) =>
  s.split("\n").map((x) => x.trim()).filter(Boolean);