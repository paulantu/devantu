import { Suspense } from "react";
import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <Suspense fallback={<div className="container-page py-24" />}>
      <LegalPage kind="privacy" />
    </Suspense>
  );
}