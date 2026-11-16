"use server";

import { after } from "next/server";
import { getClient } from "@/lib/request";
import { getSiteSettings } from "@/lib/settings";
import { sendRequestEmails } from "@/lib/notify";
import { verifyTurnstile } from "@/lib/turnstile";
import { headers } from "next/headers";
import { and, count, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { pricingPlans, quoteRequests, services } from "@/db/schema";

export type QuoteState = {
  ok: boolean;
  message: string;
  values?: Record<string, string>;
};

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().trim().max(40),
  budget: z.string().trim().max(60),
  deadline: z.string().trim().max(60),
  details: z
    .string()
    .trim()
    .min(10, "Tell me a little about your project")
    .max(3000),
  planId: z.union([z.literal(""), z.string().uuid()]),
});

export async function submitQuoteAction(
  _prev: QuoteState,
  formData: FormData,
): Promise<QuoteState> {
  // Honeypot: real visitors never fill this hidden field.
  if (String(formData.get("website") ?? "").trim()) {
    return { ok: true, message: "Thanks! I'll get back to you soon." };
  }

  const values = Object.fromEntries(
    [...formData].filter((e): e is [string, string] => typeof e[1] === "string"),
  );
  const fail = (message: string): QuoteState => ({ ok: false, message, values });

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
      .from(quoteRequests)
      .where(and(eq(quoteRequests.ipHash, ipHash), gte(quoteRequests.createdAt, since)));
    if (recent >= 3) return fail("Too many requests. Please try again later.");
  }

  let planId: string | null = null;
  let planName = "";
  let serviceId: string | null = null;
  let serviceTitle = "";
  if (d.planId) {
    const [plan] = await db
      .select({
        id: pricingPlans.id,
        name: pricingPlans.name,
        serviceId: pricingPlans.serviceId,
        serviceTitle: services.title,
      })
      .from(pricingPlans)
      .leftJoin(services, eq(services.id, pricingPlans.serviceId))
      .where(and(eq(pricingPlans.id, d.planId), eq(pricingPlans.status, "published")));
    if (plan) {
      planId = plan.id;
      planName = plan.name;
      serviceId = plan.serviceId;
      serviceTitle = plan.serviceTitle ?? "";
    }
  }

  await db.insert(quoteRequests).values({
    planId,
    planName,
    serviceId,
    serviceTitle,
    name: d.name,
    email: d.email,
    phone: d.phone,
    budget: d.budget,
    deadline: d.deadline,
    details: d.details,
    ipHash,
  });

  const settings = await getSiteSettings();
  after(() =>
    sendRequestEmails({
      siteName: settings.general.name,
      ownerFallback: settings.contact.email,
      visitorName: d.name,
      visitorEmail: d.email,
      subject: `New quote request${planName ? ` (${planName})` : ""} from ${d.name}`,
      fields: [
        ["Name", d.name],
        ["Email", d.email],
        ["Phone", d.phone],
        ["Plan", planName],
        ["Service", serviceTitle],
        ["Budget", d.budget],
        ["Deadline", d.deadline],
      ],
      message: d.details,
    }),
  );

  return { ok: true, message: "Thanks! I'll get back to you soon." };
}