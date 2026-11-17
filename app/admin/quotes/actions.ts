"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { quoteRequests } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { QUOTE_STATUSES } from "@/lib/pricing-schema";

export type QuoteResult = { ok: boolean; message: string };
const STAFF = ["superadmin", "admin"] as const;

export async function setQuoteStatusAction(
  id: string,
  status: string,
): Promise<QuoteResult> {
  await requireRole([...STAFF]);
  if (!(QUOTE_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, message: "Invalid status" };
  }
  await db
    .update(quoteRequests)
    .set({ status, updatedAt: new Date() })
    .where(eq(quoteRequests.id, id));
  revalidatePath("/admin/quotes");
  revalidatePath("/admin");
  return { ok: true, message: "Updated" };
}

export async function saveQuoteNotesAction(
  id: string,
  notes: string,
): Promise<QuoteResult> {
  await requireRole([...STAFF]);
  await db
    .update(quoteRequests)
    .set({ notes: notes.slice(0, 3000), updatedAt: new Date() })
    .where(eq(quoteRequests.id, id));
  revalidatePath("/admin/quotes");
  return { ok: true, message: "Saved" };
}

export async function deleteQuoteAction(id: string): Promise<QuoteResult> {
  await requireRole([...STAFF]);
  await db.delete(quoteRequests).where(eq(quoteRequests.id, id));
  revalidatePath("/admin/quotes");
  revalidatePath("/admin");
  return { ok: true, message: "Deleted" };
}