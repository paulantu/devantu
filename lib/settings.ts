import { cacheTag } from "next/cache";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import {
  defaults,
  settingSchemas,
  type SettingKey,
  type SiteSettings,
} from "./settings-schema";

// Cached until an admin saves; saving expires the "settings" tag.
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag("settings");

  const rows = await db.select().from(siteSettings);
  const out: Record<string, unknown> = { ...defaults };
  for (const row of rows) {
    const key = row.key as SettingKey;
    if (!(key in settingSchemas)) continue;
    const parsed = settingSchemas[key].safeParse(row.value);
    if (parsed.success) out[key] = parsed.data;
  }
  return out as SiteSettings;
}