"use server";

import { after } from "next/server";
import { headers } from "next/headers";
import { and, count, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { getClient } from "@/lib/request";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendRequestEmails } from "@/lib/notify";
import { getSiteSettings } from "@/lib/settings";

export type ContactState = {
  ok: boolean;
  message: string;
  values?: Record<string, string>;
};

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().trim().max(40),
  service: z.string().trim().max(120),
  budget: z.string().trim().max(60),
  message: z
    .string()
    .trim()
    .min(10, "Please write a little more (at least 10 characters)")
    .max(3000),
});

export async function submitContactAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: real visitors never fill this hidden field.
  if (String(formData.get("website") ?? "").trim()) {
    return { ok: true, message: "Thanks! I'll get back to you soon." };
  }

  const values = Object.fromEntries(
    [...formData].filter((e): e is [string, string] => typeof e[1] === "string"),
  );
  const fail = (message: string): ContactState => ({ ok: false, message, values });

  const parsed = schema.safeParse(values);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  const d = parsed.data;

  const { ip, ipHash } = getClient(await headers());

  if (!(await verifyTurnstile(values["cf-turnstile-response"] ?? "", ip))) {
    return fail("Please complete the security check and try again.");
  }

  if (ipHash) {
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const [{ recent }] = await db
      .select({ recent: count() })
      .from(contactMessages)
      .where(and(eq(contactMessages.ipHash, ipHash), gte(contactMessages.createdAt, since)));
    if (recent >= 5) return fail("Too many messages. Please try again later.");
  }

  await db.insert(contactMessages).values({
    name: d.name,
    email: d.email,
    phone: d.phone,
    serviceTitle: d.service,
    budget: d.budget,
    message: d.message,
    ipHash,
  });

  const settings = await getSiteSettings();
  after(() =>
    sendRequestEmails({
      siteName: settings.general.name,
      ownerFallback: settings.contact.email,
      visitorName: d.name,
      visitorEmail: d.email,
      subject: `New message from ${d.name}`,
      fields: [
        ["Name", d.name],
        ["Email", d.email],
        ["Phone", d.phone],
        ["Service", d.service],
        ["Budget", d.budget],
      ],
      message: d.message,
    }),
  );

  return { ok: true, message: "Thanks! I'll get back to you soon." };
}