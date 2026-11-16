import { headers } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import type { Role } from "./permissions";

export const TWO_FACTOR_REQUIRED: Role[] = ["superadmin", "admin"];

export async function getSession() {
  await connection(); // run at request time, not during prerender
  return auth.api.getSession({ headers: await headers() });
}

export async function requireRole(
  allowed: Role[] = ["superadmin", "admin", "editor", "author"],
  opts: { skipTwoFactor?: boolean } = {},
) {
  const session = await getSession();
  if (!session) redirect("/login");

  const role = (session.user as { role?: string }).role as Role | undefined;
  if (!role || !allowed.includes(role)) redirect("/login");

  const twoFactorEnabled = Boolean(
    (session.user as { twoFactorEnabled?: boolean | null }).twoFactorEnabled,
  );
  if (!opts.skipTwoFactor && TWO_FACTOR_REQUIRED.includes(role) && !twoFactorEnabled) {
    redirect("/admin/security");
  }

  return { session, role, twoFactorEnabled };
}