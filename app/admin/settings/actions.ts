"use server";

import { updateTag } from "next/cache";
import type { z } from "zod";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { settingSchemas, type SettingKey } from "@/lib/settings-schema";

export type ActionState = { ok: boolean; message: string };

export async function saveSettingAction(
  key: SettingKey,
  input: unknown,
): Promise<ActionState> {
  await requireRole(["superadmin", "admin"]);
  if (!(key in settingSchemas)) return { ok: false, message: "Unknown setting" };

  const parsed = (settingSchemas[key] as z.ZodType).safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db
    .insert(siteSettings)
    .values({ key, value: parsed.data })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: { value: parsed.data, updatedAt: new Date() },
    });

  updateTag("settings");
  return { ok: true, message: "Saved" };
}