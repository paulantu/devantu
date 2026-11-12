import { Suspense } from "react";
import { requireRole } from "@/lib/session";
import { getSiteSettings } from "@/lib/settings";
import {
  ContactCard,
  GeneralCard,
  ModulesCard,
  NavCard,
  SocialCard,
} from "@/components/admin/settings-forms";

async function SettingsContent() {
  await requireRole(["superadmin", "admin"]);
  const s = await getSiteSettings();
  return (
    <div className="max-w-3xl space-y-6">
      <GeneralCard initial={s.general} />
      <ContactCard initial={s.contact} />
      <SocialCard initial={s.social} />
      <ModulesCard initial={s.modules} />
      <NavCard initial={s.nav} />
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