import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { requireRole } from "@/lib/session";

// Stops spreadsheet apps from running a value as a formula.
const cell = (v: string) => {
  const safe = /^[=+\-@]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET() {
  await requireRole(["superadmin", "admin"]);
  const rows = await db
    .select({
      email: subscribers.email,
      source: subscribers.source,
      createdAt: subscribers.createdAt,
    })
    .from(subscribers)
    .where(eq(subscribers.status, "active"))
    .orderBy(desc(subscribers.createdAt));

  const csv = [
    "email,source,subscribed_at",
    ...rows.map((r) => [cell(r.email), cell(r.source), r.createdAt.toISOString()].join(",")),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="subscribers.csv"',
    },
  });
}