import { sql } from "drizzle-orm";
import { db } from "@/db";

export async function GET() {
  const result = await db.execute(sql`select now() as now`);
  return Response.json({ ok: true, now: result.rows[0].now });
}