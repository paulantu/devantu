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
  {
    label: "Users",
    href: "/admin/users",
    icon: "users",
    roles: ["superadmin"],
  },
  {
    label: "Media",
    href: "/admin/media",
    icon: "media",
    roles: ["superadmin", "admin", "editor", "author"],
  },
  {
    label: "Sections",
    href: "/admin/sections",
    icon: "sections",
    roles: ["superadmin", "admin"],
  },
  {
    label: "Security",
    href: "/admin/security",
    icon: "security",
    roles: ["superadmin", "admin", "editor", "author"],
  },
  {
    label: "Services",
    href: "/admin/services",
    icon: "services",
    roles: ["superadmin", "admin", "editor"],
  },
    {
    label: "Projects",
    href: "/admin/projects",
    icon: "projects",
    roles: ["superadmin", "admin", "editor"],
  },
  {
    label: "Profile & CV",
    href: "/admin/cv",
    icon: "cv",
    roles: ["superadmin", "admin", "editor"],
  },
  {
    label: "Pricing",
    href: "/admin/pricing",
    icon: "pricing",
    roles: ["superadmin", "admin", "editor"],
  },
  {
    label: "Quote requests",
    href: "/admin/quotes",
    icon: "quotes",
    roles: ["superadmin", "admin"],
  },
  {
    label: "Messages",
    href: "/admin/messages",
    icon: "messages",
    roles: ["superadmin", "admin"],
  },
  {
    label: "Blog",
    href: "/admin/blog",
    icon: "blog",
    roles: ["superadmin", "admin", "editor", "author"],
  },
  {
    label: "Comments",
    href: "/admin/comments",
    icon: "comments",
    roles: ["superadmin", "admin", "author"],
  },
  {
    label: "Subscribers",
    href: "/admin/subscribers",
    icon: "subscribers",
    roles: ["superadmin", "admin"],
  },
  {
    label: "Gallery",
    href: "/admin/gallery",
    icon: "gallery",
    roles: ["superadmin", "admin", "editor"],
  },
];
