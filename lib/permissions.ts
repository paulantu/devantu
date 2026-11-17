import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const ac = createAccessControl(defaultStatements);

// Only the Super Admin gets user-management powers.
// Content permissions for the other roles are checked in our own code.
export const roles = {
  superadmin: ac.newRole({ ...adminAc.statements }),
  admin: ac.newRole({}),
  editor: ac.newRole({}),
  author: ac.newRole({}),
};

export const ROLES = ["superadmin", "admin", "editor", "author"] as const;
export type Role = (typeof ROLES)[number];