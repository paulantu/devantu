import { Suspense } from "react";
import { TWO_FACTOR_REQUIRED, requireRole } from "@/lib/session";
import { SecurityPanel } from "@/components/admin/security-panel";

async function SecurityContent() {
  const { role, twoFactorEnabled } = await requireRole(undefined, {
    skipTwoFactor: true,
  });
  return (
    <SecurityPanel
      twoFactorEnabled={twoFactorEnabled}
      required={TWO_FACTOR_REQUIRED.includes(role)}
    />
  );
}

export default function SecurityPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Security</h1>
        <p className="text-sm text-muted">Protect your account.</p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted">Loading...</p>}>
        <SecurityContent />
      </Suspense>
    </div>
  );
}