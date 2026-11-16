"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/session";
import { twoFactor, user } from "@/db/schema";




export type ActionState = { ok: boolean; message: string };

const ASSIGNABLE = ["admin", "editor", "author"] as const;
type Assignable = (typeof ASSIGNABLE)[number];

const createSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(10, "Password must be at least 10 characters"),
  role: z.enum(ASSIGNABLE),
});

// Super Admin accounts can never be changed from the UI.
async function guardTarget(userId: string): Promise<ActionState | null> {
  const [target] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId));
  if (!target) return { ok: false, message: "User not found" };
  if (target.role === "superadmin") {
    return { ok: false, message: "Super Admin accounts are protected" };
  }
  return null;
}

function fail(e: unknown, fallback: string): ActionState {
  return { ok: false, message: e instanceof Error ? e.message : fallback };
}

export async function createUserAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole(["superadmin"]);
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  try {
    await auth.api.createUser({
      body: parsed.data,
      headers: await headers(),
    });
  } catch (e) {
    return fail(e, "Could not create user");
  }
  revalidatePath("/admin/users");
  return { ok: true, message: "User created. Share the temporary password with them." };
}

export async function setRoleAction(
  userId: string,
  role: string,
): Promise<ActionState> {
  await requireRole(["superadmin"]);
  if (!ASSIGNABLE.includes(role as Assignable)) {
    return { ok: false, message: "Invalid role" };
  }
  const blocked = await guardTarget(userId);
  if (blocked) return blocked;
  try {
    await auth.api.setRole({
      body: { userId, role: role as Assignable },
      headers: await headers(),
    });
  } catch (e) {
    return fail(e, "Could not change role");
  }
  revalidatePath("/admin/users");
  return { ok: true, message: "Role updated" };
}

export async function toggleBanAction(
  userId: string,
  ban: boolean,
): Promise<ActionState> {
  await requireRole(["superadmin"]);
  const blocked = await guardTarget(userId);
  if (blocked) return blocked;
  try {
    if (ban) {
      await auth.api.banUser({ body: { userId }, headers: await headers() });
    } else {
      await auth.api.unbanUser({ body: { userId }, headers: await headers() });
    }
  } catch (e) {
    return fail(e, "Could not update user");
  }
  revalidatePath("/admin/users");
  return { ok: true, message: ban ? "User banned" : "User unbanned" };
}

export async function removeUserAction(userId: string): Promise<ActionState> {
  await requireRole(["superadmin"]);
  const blocked = await guardTarget(userId);
  if (blocked) return blocked;
  try {
    await auth.api.removeUser({ body: { userId }, headers: await headers() });
  } catch (e) {
    return fail(e, "Could not delete user");
  }
  revalidatePath("/admin/users");
  return { ok: true, message: "User deleted" };
}




export async function resetTwoFactorAction(userId: string): Promise<ActionState> {
  await requireRole(["superadmin"]);
  const blocked = await guardTarget(userId);
  if (blocked) return blocked;
  await db.delete(twoFactor).where(eq(twoFactor.userId, userId));
  await db.update(user).set({ twoFactorEnabled: false }).where(eq(user.id, userId));
  revalidatePath("/admin/users");
  return { ok: true, message: "Two-factor reset. They will set it up again at next login." };
}