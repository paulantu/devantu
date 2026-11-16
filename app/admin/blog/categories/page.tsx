import { Suspense } from "react";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { blogCategories } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { CategoriesManager } from "@/components/admin/categories-manager";

async function CategoriesContent() {
  await requireRole(["superadmin", "admin", "editor"]);
  const rows = await db
    .select({
      id: blogCategories.id,
      name: blogCategories.name,
      slug: blogCategories.slug,
    })
    .from(blogCategories)
    .orderBy(asc(blogCategories.name));
  return <CategoriesManager rows={rows} />;
}

export default function CategoriesPage() {
  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/blog" className="text-sm text-muted hover:text-primary">
          ← All posts
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold">Blog categories</h1>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <CategoriesContent />
      </Suspense>
    </div>
  );
}