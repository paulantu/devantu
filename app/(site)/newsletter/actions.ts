"use server";

import { randomBytes } from "node:crypto";
import { after } from "next/server";
import { headers } from "next/headers";
import { and, count, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { getClient } from "@/lib/request";
import { verifyTurnstile } from "@/lib/turnstile";
import { canSendConfirmation, sendMail } from "@/lib/mail";
import { getSiteSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site-config";

export type NewsletterState = {
  ok: boolean;
  message: string;
  values?: Record<string, string>;
};

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(200),
  source: z.string().trim().max(40),
});

export async function subscribeAction(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const done = { ok: true, message: "You're subscribed. Thank you!" };

  // Honeypot: real visitors never fill this hidden field.
  if (String(formData.get("website") ?? "").trim()) return done;

  const values = Object.fromEntries(
    [...formData].filter((e): e is [string, string] => typeof e[1] === "string"),
  );
  const fail = (message: string): NewsletterState => ({ ok: false, message, values });

  const parsed = schema.safeParse(values);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  const { email, source } = parsed.data;

  const { ip, ipHash } = getClient(await headers());
  if (!(await verifyTurnstile(values["cf-turnstile-response"] ?? "", ip))) {
    return fail("Please complete the security check and try again.");
  }

  if (ipHash) {
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const [{ recent }] = await db
      .select({ recent: count() })
      .from(subscribers)
      .where(and(eq(subscribers.ipHash, ipHash), gte(subscribers.createdAt, since)));
    if (recent >= 5) return fail("Too many attempts. Please try again later.");
  }

  const [existing] = await db
    .select({ id: subscribers.id, status: subscribers.status })
    .from(subscribers)
    .where(eq(subscribers.email, email));

  // Same answer whether or not the address was already on the list.
  if (existing) {
    if (existing.status !== "active") {
      await db
        .update(subscribers)
        .set({ status: "active", updatedAt: new Date() })
        .where(eq(subscribers.id, existing.id));
    }
    return done;
  }

  const token = randomBytes(24).toString("base64url");
  await db
    .insert(subscribers)
    .values({ email, token, source, ipHash })
    .onConflictDoNothing();

  if (canSendConfirmation()) {
    const settings = await getSiteSettings();
    after(() =>
      sendMail({
        to: email,
        subject: `Welcome to ${settings.general.name}`,
        text: `Thanks for subscribing!\n\nYou can unsubscribe at any time: ${siteConfig.url}/unsubscribe/${token}\n\n${settings.general.name}`,
      }),
    );
  }

  return done;
}