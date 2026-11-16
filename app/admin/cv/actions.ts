"use server";

import { revalidatePath, updateTag } from "next/cache";
import { asc, eq, min } from "drizzle-orm";
import { db } from "@/db";
import { cvEntries, siteSettings } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { settingSchemas } from "@/lib/settings-schema";
import {
  CV_KINDS,
  cvKindDefs,
  cvKindSchemas,
  type CvKind,
} from "@/lib/cv-schema";

export type CvResult = { ok: boolean; message: string; id?: string };
const STAFF = ["superadmin", "admin", "editor"] as const;
const fail = (message: string): CvResult => ({ ok: false, message });
const DATE = /^\d{4}(-(0[1-9]|1[0-2]))?$/;

function refresh() {
  updateTag("cv");
  revalidatePath("/admin/cv");
}

const isKind = (k: string): k is CvKind => (CV_KINDS as readonly string[]).includes(k);

export async function createCvEntryAction(kind: string): Promise<CvResult> {
  await requireRole([...STAFF]);
  if (!isKind(kind)) return fail("Unknown type");

  // New entries go to the top (newest first).
  const [{ lowest }] = await db
    .select({ lowest: min(cvEntries.sortOrder) })
    .from(cvEntries)
    .where(eq(cvEntries.kind, kind));

  const [row] = await db
    .insert(cvEntries)
    .values({
      kind,
      title: `New ${cvKindDefs[kind].label}`,
      sortOrder: (lowest ?? 1) - 1,
    })
    .returning({ id: cvEntries.id });

  refresh();
  return { ok: true, message: "Created", id: row.id };
}

export async function updateCvEntryAction(
  id: string,
  input: unknown,
): Promise<CvResult> {
  await requireRole([...STAFF]);
  const [row] = await db.select().from(cvEntries).where(eq(cvEntries.id, id));
  if (!row || !isKind(row.kind)) return fail("Entry not found");

  const parsed = cvKindSchemas[row.kind].safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue?.path.length ? `${issue.path.join(" > ")}: ` : "";
    return fail(`${where}${issue?.message ?? "Invalid input"}`);
  }
  const d = parsed.data as Record<string, unknown>;

  if (!String(d.title ?? "").trim()) return fail("Title is required");
  for (const key of ["startDate", "endDate"]) {
    const v = d[key];
    if (typeof v === "string" && v && !DATE.test(v)) {
      return fail("Dates must look like 2024 or 2024-03");
    }
  }

  const str = (k: string) => (typeof d[k] === "string" ? (d[k] as string) : undefined);
  const level = str("level") ? parseInt(str("level")!, 10) : undefined;

  await db
    .update(cvEntries)
    .set({
      title: str("title")?.trim(),
      organization: str("organization"),
      location: str("location"),
      startDate: str("startDate"),
      endDate: d.current === true ? "" : str("endDate"),
      current: typeof d.current === "boolean" ? d.current : undefined,
      description: str("description"),
      url: str("url"),
      level: level && level >= 10 && level <= 100 ? level : undefined,
      updatedAt: new Date(),
    })
    .where(eq(cvEntries.id, id));

  refresh();
  return { ok: true, message: "Saved" };
}

export async function toggleCvEntryAction(
  id: string,
  visible: boolean,
): Promise<CvResult> {
  await requireRole([...STAFF]);
  await db
    .update(cvEntries)
    .set({ isVisible: visible, updatedAt: new Date() })
    .where(eq(cvEntries.id, id));
  refresh();
  return { ok: true, message: "" };
}

export async function deleteCvEntryAction(id: string): Promise<CvResult> {
  await requireRole([...STAFF]);
  await db.delete(cvEntries).where(eq(cvEntries.id, id));
  refresh();
  return { ok: true, message: "" };
}

export async function moveCvEntryAction(
  id: string,
  dir: -1 | 1,
): Promise<CvResult> {
  await requireRole([...STAFF]);
  const [row] = await db
    .select({ kind: cvEntries.kind })
    .from(cvEntries)
    .where(eq(cvEntries.id, id));
  if (!row) return fail("Entry not found");

  const siblings = await db
    .select({ id: cvEntries.id })
    .from(cvEntries)
    .where(eq(cvEntries.kind, row.kind))
    .orderBy(asc(cvEntries.sortOrder), asc(cvEntries.createdAt));

  const i = siblings.findIndex((s) => s.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= siblings.length) return { ok: true, message: "" };

  const ids = siblings.map((s) => s.id);
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await Promise.all(
    ids.map((sid, index) =>
      db.update(cvEntries).set({ sortOrder: index }).where(eq(cvEntries.id, sid)),
    ),
  );
  refresh();
  return { ok: true, message: "" };
}

export async function saveProfileAction(input: unknown): Promise<CvResult> {
  await requireRole([...STAFF]);
  const parsed = settingSchemas.profile.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue?.path.length ? `${issue.path.join(" > ")}: ` : "";
    return fail(`${where}${issue?.message ?? "Invalid input"}`);
  }
  const value = {
    ...parsed.data,
    values: parsed.data.values.filter((v) => v.title.trim()),
  };

  await db
    .insert(siteSettings)
    .values({ key: "profile", value })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value, updatedAt: new Date() },
    });

  updateTag("settings");
  revalidatePath("/admin/cv");
  return { ok: true, message: "Saved" };
}