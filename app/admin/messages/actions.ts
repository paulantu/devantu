"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { MESSAGE_STATUSES } from "@/lib/contact";

export type MessageResult = { ok: boolean; message: string };
const STAFF = ["superadmin", "admin"] as const;

function refresh() {
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function setMessageStatusAction(
  id: string,
  status: string,
): Promise<MessageResult> {
  await requireRole([...STAFF]);
  if (!(MESSAGE_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, message: "Invalid status" };
  }
  await db
    .update(contactMessages)
    .set({ status, updatedAt: new Date() })
    .where(eq(contactMessages.id, id));
  refresh();
  return { ok: true, message: "Updated" };
}

export async function saveMessageNotesAction(
  id: string,
  notes: string,
): Promise<MessageResult> {
  await requireRole([...STAFF]);
  await db
    .update(contactMessages)
    .set({ notes: notes.slice(0, 3000), updatedAt: new Date() })
    .where(eq(contactMessages.id, id));
  revalidatePath("/admin/messages");
  return { ok: true, message: "Saved" };
}

export async function deleteMessageAction(id: string): Promise<MessageResult> {
  await requireRole([...STAFF]);
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  refresh();
  return { ok: true, message: "Deleted" };
}