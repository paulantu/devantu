import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import type { SiteSettings } from "@/lib/settings-schema";
import { Logo } from "./logo";

async function Year() {
  await connection();
  return <>{new Date().getFullYear()}</>;
}

export function Footer({
  general,
  contact,
  social,
  nav,
}: {
  general: SiteSettings["general"];
  contact: SiteSettings["contact"];
  social: SiteSettings["social"];
  nav: { label: string; href: string }[];
}) {
  const wa = contact.whatsapp.replace(/\D/g, "");
  const hasContact =
    contact.email || contact.phone || wa || contact.location;

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-3">
          <Logo name={general.name} />
          <p className="max-w-xs text-sm text-muted">{general.description}</p>
        </div>

        <div>
          <h3 className="mb-3 font-heading text-sm font-semibold">Pages</h3>
          <ul className="grid grid-cols-2 gap-2 text-sm text-muted">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {hasContact && (
          <div>
            <h3 className="mb-3 font-heading text-sm font-semibold">Contact</h3>
            <ul className="space-y-2 text-sm text-muted">
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`} className="hover:text-primary">
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.phone && (
                <li>
                  <a href={`tel:${contact.phone}`} className="hover:text-primary">
                    {contact.phone}
                  </a>
                </li>
              )}
              {wa && (
                <li>
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    WhatsApp
                  </a>
                </li>
              )}
              {contact.location && <li>{contact.location}</li>}
            </ul>
          </div>
        )}

        {social.length > 0 && (
          <div>
            <h3 className="mb-3 font-heading text-sm font-semibold">Follow</h3>
            <ul className="space-y-2 text-sm text-muted">
              {social.map((s) => (
                <li key={s.label}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="border-t border-border py-5 text-center text-xs text-muted">
        ©{" "}
        <Suspense fallback="2026">
          <Year />
        </Suspense>{" "}
        {general.name}. All rights reserved.
      </div>
    </footer>
  );
}