import { cacheTag } from "next/cache";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cvEntries } from "@/db/schema";

export type CvEntry = Awaited<ReturnType<typeof getCvData>>["experience"][number];

export async function getCvData() {
  "use cache";
  cacheTag("cv");

  const rows = await db
    .select({
      id: cvEntries.id,
      kind: cvEntries.kind,
      title: cvEntries.title,
      organization: cvEntries.organization,
      location: cvEntries.location,
      startDate: cvEntries.startDate,
      endDate: cvEntries.endDate,
      current: cvEntries.current,
      description: cvEntries.description,
      url: cvEntries.url,
      level: cvEntries.level,
    })
    .from(cvEntries)
    .where(eq(cvEntries.isVisible, true))
    .orderBy(asc(cvEntries.sortOrder), desc(cvEntries.createdAt));

  const by = (kind: string) => rows.filter((r) => r.kind === kind);
  return {
    experience: by("experience"),
    education: by("education"),
    skills: by("skill"),
    certifications: by("certification"),
    awards: by("award"),
    languages: by("language"),
  };
}