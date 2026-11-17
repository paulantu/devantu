
import { Suspense } from "react";
import { db } from "@/db";
import { count, eq } from "drizzle-orm";
import { requireRole } from "@/lib/session";
import {
  blogComments,
  contactMessages,
  quoteRequests,
  user,
} from "@/db/schema";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-heading text-3xl font-bold">{value}</p>
    </div>
  );
}

async function Greeting() {
  const { session } = await requireRole();

  return (
    <h1 className="font-heading text-2xl font-bold">
      Welcome back, {session.user.name}
    </h1>
  );
}

async function Stats() {
  const { role } = await requireRole();

  if (role !== "superadmin" && role !== "admin") return null;

  const [{ quotes }] = await db
    .select({ quotes: count() })
    .from(quoteRequests)
    .where(eq(quoteRequests.status, "new"));

  const [{ messages }] = await db
    .select({ messages: count() })
    .from(contactMessages)
    .where(eq(contactMessages.status, "new"));

  const [{ comments }] = await db
    .select({ comments: count() })
    .from(blogComments)
    .where(eq(blogComments.status, "pending"));

  let team: number | null = null;

  if (role === "superadmin") {
    const [{ total }] = await db.select({ total: count() }).from(user);
    team = total;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="New messages" value={messages} />
      <StatCard label="Comments to approve" value={comments} />
      <StatCard label="New quote requests" value={quotes} />
      {team !== null && <StatCard label="Team members" value={team} />}
    </div>
  );
}

export default function AdminHome() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<div className="h-8" />}>
        <Greeting />
      </Suspense>

      <Suspense fallback={null}>
        <Stats />
      </Suspense>
    </div>
  );
}
