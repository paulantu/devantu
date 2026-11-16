"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { desc, eq, like } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { mediaFiles } from "@/db/schema";
import { requireRole } from "@/lib/session";

export type ActionState = { ok: boolean; message: string };

const registerSchema = z.object({
  url: z
    .string()
    .url()
    .refine(
      (u) => new URL(u).hostname.endsWith(".blob.vercel-storage.com"),
      "Invalid file URL",
    ),
  pathname: z.string().min(1),
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1),
  size: z.number().int().positive(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
});

export async function registerMediaAction(input: unknown): Promise<ActionState> {
  const { session } = await requireRole();
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid file" };
  }
  await db
    .insert(mediaFiles)
    .values({ ...parsed.data, uploadedBy: session.user.id })
    .onConflictDoNothing();
  revalidatePath("/admin/media");
  return { ok: true, message: "Uploaded" };
}

type Manageable =
  | { ok: false; message: string }
  | { ok: true; row: typeof mediaFiles.$inferSelect };

// Authors may only touch their own files.
async function loadManageable(id: string): Promise<Manageable> {
  const { session, role } = await requireRole();
  const [row] = await db.select().from(mediaFiles).where(eq(mediaFiles.id, id));
  if (!row) return { ok: false, message: "File not found" };
  if (role === "author" && row.uploadedBy !== session.user.id) {
    return { ok: false, message: "You can only change your own files" };
  }
  return { ok: true, row };
}

export async function updateAltAction(
  id: string,
  alt: string,
): Promise<ActionState> {
  const found = await loadManageable(id);
  if (!found.ok) return found;
  await db
    .update(mediaFiles)
    .set({ alt: alt.trim().slice(0, 200) })
    .where(eq(mediaFiles.id, id));
  revalidatePath("/admin/media");
  return { ok: true, message: "Saved" };
}

export async function deleteMediaAction(id: string): Promise<ActionState> {
  const found = await loadManageable(id);
  if (!found.ok) return found;
  try {
    await del(found.row.url);
  } catch {
    return { ok: false, message: "Could not delete the file from storage" };
  }
  await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
  revalidatePath("/admin/media");
  return { ok: true, message: "Deleted" };
}

export async function listImagesAction() {
  await requireRole();
  return db
    .select({
      id: mediaFiles.id,
      url: mediaFiles.url,
      alt: mediaFiles.alt,
      filename: mediaFiles.filename,
    })
    .from(mediaFiles)
    .where(like(mediaFiles.contentType, "image/%"))
    .orderBy(desc(mediaFiles.createdAt))
    .limit(120);
}