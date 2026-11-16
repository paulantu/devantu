import { Suspense } from "react";
import { Header } from "@/components/site/header";
import { HeaderFallback } from "@/components/site/header-fallback";
import { Footer } from "@/components/site/footer";
import { SiteAnalytics } from "@/components/site/site-analytics";
import { JsonLd } from "@/components/seo/json-ld";
import { getSiteSettings } from "@/lib/settings";
import { getVisibleNav } from "@/lib/settings-schema";
import { siteConfig } from "@/lib/site-config";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getSiteSettings();
  const nav = getVisibleNav(s);
  const { general, contact, social, profile } = s;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: general.name, url: siteConfig.url },
      {
        "@type": "Person",
        name: general.name,
        jobTitle: general.title,
        url: siteConfig.url,
        image: profile.photoUrl || undefined,
        email: contact.email ? `mailto:${contact.email}` : undefined,
        sameAs: social.map((x) => x.url),
      },
    ],
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Suspense fallback={<HeaderFallback nav={nav} name={general.name} />}>
        <Header nav={nav} name={general.name} />
      </Suspense>
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer general={general} contact={contact} social={social} nav={nav} />
      <JsonLd data={graph} />
      <Suspense fallback={null}>
        <SiteAnalytics vercel={s.analytics.vercel} gaId={s.analytics.gaId} />
      </Suspense>
    </>
  );
}