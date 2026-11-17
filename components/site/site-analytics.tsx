"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { Button } from "@/components/ui/button";

const KEY = "analytics-consent";
const GA_RE = /^G-[A-Z0-9]{4,14}$/;

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener("consent-change", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("consent-change", cb);
  };
}

function snapshot() {
  try {
    return localStorage.getItem(KEY) ?? "none";
  } catch {
    return "none";
  }
}

export function SiteAnalytics({ vercel, gaId }: { vercel: boolean; gaId: string }) {
  const stored = useSyncExternalStore(subscribe, snapshot, () => "unknown");
  const ga = GA_RE.test(gaId) ? gaId : "";

  function choose(value: "granted" | "denied") {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* private mode: choice lasts for this page only */
    }
    window.dispatchEvent(new Event("consent-change"));
  }

  return (
    <>
      {vercel && <Analytics />}

      {ga && stored === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}',{anonymize_ip:true});`}
          </Script>
        </>
      )}

      {ga && stored === "none" && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed inset-x-4 bottom-4 z-[90] mx-auto flex max-w-2xl flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-2xl sm:flex-row sm:items-center"
        >
          <p className="flex-1 text-sm text-muted">
            I use Google Analytics to understand how the site is used. Is that OK?{" "}
            <Link href="/privacy" className="text-primary underline">
              Privacy policy
            </Link>
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => choose("denied")}>
              Decline
            </Button>
            <Button size="sm" onClick={() => choose("granted")}>
              Accept
            </Button>
          </div>
        </div>
      )}
    </>
  );
}