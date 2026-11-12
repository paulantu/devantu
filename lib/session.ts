import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import type { Role } from "./permissions";
import { connection } from "next/server";

export async function getSession() {
  await connection(); // run at request time, not during prerender
  return auth.api.getSession({ headers: await headers() });
}

export async function requireRole(
  allowed: Role[] = ["superadmin", "admin", "editor", "author"],
) {
  const session = await getSession();
  if (!session) redirect("/login");
  const role = (session.user as { role?: string }).role as Role | undefined;
  if (!role || !allowed.includes(role)) redirect("/login");
  return { session, role };
}