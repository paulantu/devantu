import { Suspense } from "react";
import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cvEntries } from "@/db/schema";
import { requireRole } from "@/lib/session";
import { getSiteSettings } from "@/lib/settings";
import { CV_KINDS, cvKindDefs, type CvKind } from "@/lib/cv-schema";
import { CvManager } from "@/components/admin/cv-manager";
import { ProfileForm } from "@/components/admin/profile-form";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "profile", label: "Profile" },
  ...CV_KINDS.map((k) => ({ key: k, label: cvKindDefs[k].plural })),
];

async function CvContent({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireRole(["superadmin", "admin", "editor"]);
  const { tab } = await searchParams;
  const current = TABS.find((t) => t.key === tab)?.key ?? "profile";

  let body: React.ReactNode;
  if (current === "profile") {
    const s = await getSiteSettings();
    body = <ProfileForm initial={s.profile} />;
  } else {
    const kind = current as CvKind;
    const rows = await db
      .select()
      .from(cvEntries)
      .where(eq(cvEntries.kind, kind))
      .orderBy(asc(cvEntries.sortOrder), desc(cvEntries.createdAt));

    body = (
      <CvManager
        kind={kind}
        rows={rows.map((r) => ({
          id: r.id,
          title: r.title,
          organization: r.organization,
          isVisible: r.isVisible,
          updatedAt: r.updatedAt.toISOString(),
          values: {
            title: r.title,
            organization: r.organization,
            location: r.location,
            startDate: r.startDate,
            endDate: r.endDate,
            current: r.current,
            description: r.description,
            url: r.url,
            level: String(r.level),
          },
        }))}
      />
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/cv?tab=${t.key}`}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm",
              t.key === current
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted hover:bg-elevated",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
      {body}
    </>
  );
}

export default function CvAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Profile &amp; CV</h1>
        <p className="text-sm text-muted">
          Everything on your About page and in the downloadable CV.{" "}
          <Link href="/about" target="_blank" className="text-primary underline">
            View About page
          </Link>
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <CvContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}