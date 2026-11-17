import { Suspense } from "react";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { UserActions } from "@/components/admin/user-actions";

async function UsersContent() {
  await requireRole(["superadmin"]);
  const rows = await db.select().from(user).orderBy(desc(user.createdAt));

  return (
    <>
      <CreateUserForm />
      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted">{u.email}</p>
                  <p className="font-mono text-xs text-primary">{u.role}</p>
                </td>
                <td className="px-4 py-3 text-xs">
                  {u.banned ? (
                    <span className="text-red-400">Banned</span>
                  ) : (
                    <span className="text-green-500">Active</span>
                  )}
                  <p className="mt-1 text-muted">2FA {u.twoFactorEnabled ? "on" : "off"}</p>
                </td>
                <td className="px-4 py-3">
                  <UserActions
                    id={u.id}
                    role={u.role ?? "author"}
                    banned={!!u.banned}
                    locked={u.role === "superadmin"}
                    twoFactor={!!u.twoFactorEnabled}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function UsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted">
          Only the Super Admin can manage accounts.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Loading users...</p>}>
        <UsersContent />
      </Suspense>
    </div>
  );
}