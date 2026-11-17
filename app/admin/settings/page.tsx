import { Suspense } from "react";
import { requireRole } from "@/lib/session";
import { getSiteSettings } from "@/lib/settings";
import {
  AnalyticsCard,
  BlogSettingsCard,
  ContactCard,
  GeneralCard,
  LegalCard,
  ModulesCard,
  NavCard,
  SeoCard,
  SocialCard,
} from "@/components/admin/settings-forms";

async function SettingsContent() {
  const { role } = await requireRole(["superadmin", "admin"]);
  const s = await getSiteSettings();
  return (
    <div className="max-w-3xl space-y-6">
      {role === "superadmin" && (
        <p className="text-sm text-muted">
          <a href="/admin/export" className="text-primary underline">
            Download a content backup (JSON)
          </a>{" "}
          of your pages, projects, posts and settings.
        </p>
      )}
      <GeneralCard initial={s.general} />
      <ContactCard initial={s.contact} />
      <SocialCard initial={s.social} />
      <ModulesCard initial={s.modules} />
      <NavCard initial={s.nav} />
      <BlogSettingsCard initial={s.blog} />
      <SeoCard initial={s.seo} />
      <AnalyticsCard initial={s.analytics} />
      <LegalCard initial={s.legal} />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted">Everything here updates the live site.</p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}