"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { requireRole } from "@/lib/session";

export async function deleteSubscriberAction(id: string) {
  await requireRole(["superadmin", "admin"]);
  await db.delete(subscribers).where(eq(subscribers.id, id));
  revalidatePath("/admin/subscribers");
  return { ok: true, message: "Deleted" };
}