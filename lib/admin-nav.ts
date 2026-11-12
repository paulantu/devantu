import type { Role } from "./permissions";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  roles: Role[];
};

export const adminNav: AdminNavItem[] = [
    {
    label: "Settings",
    href: "/admin/settings",
    icon: "settings",
    roles: ["superadmin", "admin"],
  },
  { label: "Users", href: "/admin/users", icon: "users", roles: ["superadmin"] },
];