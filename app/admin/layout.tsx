import { Suspense } from "react";
import { requireRole } from "@/lib/session";
import { adminNav } from "@/lib/admin-nav";
import { AdminSidebar } from "@/components/admin/sidebar";

async function Shell({ children }: { children: React.ReactNode }) {
  const { session, role } = await requireRole();
  const items = adminNav
    .filter((i) => i.roles.includes(role))
    .map(({ label, href, icon }) => ({ label, href, icon }));

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <AdminSidebar items={items} name={session.user.name} role={role} />
      <div className="min-w-0 p-6 lg:p-10">{children}</div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}