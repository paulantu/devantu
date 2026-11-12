import { Suspense } from "react";
import { count } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { requireRole } from "@/lib/session";

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
  if (role !== "superadmin") return null;
  const [{ total }] = await db.select({ total: count() }).from(user);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Team members" value={total} />
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