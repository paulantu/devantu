"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { SignOutButton } from "@/components/auth/sign-out-button";

import { ExternalLink, LayoutDashboard, Menu, Settings, Users, X } from "lucide-react";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  users: Users,
  settings: Settings,
};


type Item = { label: string; href: string; icon: string };

export function AdminSidebar({
  items,
  name,
  role,
}: {
  items: Item[];
  name: string;
  role: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <Logo />
        <button
          aria-label="Menu"
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 hover:bg-elevated"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-surface pt-14 transition-transform",
          "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:pt-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="hidden h-16 items-center px-6 lg:flex">
          <Logo />
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const Icon = icons[item.icon] ?? LayoutDashboard;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-elevated hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-border p-4">
          <div>
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="font-mono text-xs text-primary">{role}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted hover:bg-elevated"
            >
              <ExternalLink className="size-4" /> Site
            </Link>
            <SignOutButton />
          </div>
        </div>
      </aside>
    </>
  );
}