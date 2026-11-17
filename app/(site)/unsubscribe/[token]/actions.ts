"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscribers } from "@/db/schema";

export async function unsubscribeAction(token: string) {
  if (/^[\w-]{20,64}$/.test(token)) {
    await db
      .update(subscribers)
      .set({ status: "unsubscribed", updatedAt: new Date() })
      .where(eq(subscribers.token, token));
  }
  redirect(`/unsubscribe/${token}?done=1`);
}