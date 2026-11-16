import { Suspense } from "react";
import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <Suspense fallback={<div className="container-page py-24" />}>
      <LegalPage kind="terms" />
    </Suspense>
  );
}