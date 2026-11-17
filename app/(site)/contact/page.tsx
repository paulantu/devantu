
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { getSiteSettings } from "@/lib/settings";
import { getPublishedServices } from "@/lib/services";
import { getCalendlyUrl, getMapPoint } from "@/lib/contact";
import { ContactForm } from "@/components/site/contact-form";
import { CalendlyEmbed } from "@/components/site/calendly-embed";
import { LocationMap } from "@/components/site/location-map";
import { PageSections } from "@/components/sections/page-sections";

export const metadata: Metadata = { title: "Contact" };

type SP = Promise<Record<string, string | string[] | undefined>>;

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="font-mono text-xs text-muted">{label}</p>
        <div className="text-sm font-medium">{children}</div>
      </div>
    </li>
  );
}

async function ContactContent() {
  const [settings, services] = await Promise.all([
    getSiteSettings(),
    getPublishedServices(),
  ]);

  const { contact, social, general } = settings;
  const wa = contact.whatsapp.replace(/\D/g, "");
  const calendly = getCalendlyUrl(contact.calendly);
  const point = getMapPoint(contact.mapLat, contact.mapLng);

  return (
    <>
      <section className="container-page py-16 md:py-24">
        <p className="font-mono text-sm text-primary">contact</p>

        <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
          Let&apos;s talk<span className="text-primary">.</span>
        </h1>

        <p className="mt-4 max-w-xl text-muted">
          Have a project in mind? Send a message or book a call, and I&apos;ll get
          back to you soon.
        </p>

        <div className="mt-12 grid gap-10 lg:grid-cols-5">
          <div className="space-y-8 lg:col-span-2">
            <ul className="space-y-5">
              {contact.email && (
                <InfoRow icon={Mail} label="Email">
                  <a
                    href={`mailto:${contact.email}`}
                    className="break-all hover:text-primary"
                  >
                    {contact.email}
                  </a>
                </InfoRow>
              )}

              {contact.phone && (
                <InfoRow icon={Phone} label="Phone">
                  <a
                    href={`tel:${contact.phone}`}
                    className="hover:text-primary"
                  >
                    {contact.phone}
                  </a>
                </InfoRow>
              )}

              {wa && (
                <InfoRow icon={MessageCircle} label="WhatsApp">
                  <a
                    href={`https://wa.me/${wa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary"
                  >
                    Chat on WhatsApp
                  </a>
                </InfoRow>
              )}

              {calendly && (
                <InfoRow icon={CalendarDays} label="Book a call">
                  <a href="#book" className="hover:text-primary">
                    Pick a time that suits you
                  </a>
                </InfoRow>
              )}

              {contact.location && (
                <InfoRow icon={MapPin} label="Location">
                  {contact.location}
                </InfoRow>
              )}

              {contact.hours && (
                <InfoRow icon={Clock} label="Working hours">
                  {contact.hours}
                </InfoRow>
              )}
            </ul>

            {social.length > 0 && (
              <div>
                <p className="mb-3 font-mono text-xs text-muted">
                  Find me online
                </p>

                <div className="flex flex-wrap gap-2">
                  {social.map((s) => (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-border px-4 py-1.5 text-sm hover:border-primary hover:text-primary"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface p-6 md:p-8 lg:col-span-3">
            <h2 className="mb-5 font-heading text-xl font-bold">
              Send a message
            </h2>

            <ContactForm
              services={services.map((s) => ({
                slug: s.slug,
                title: s.title,
              }))}
            />
          </div>
        </div>
      </section>

      {calendly && (
        <section
          id="book"
          className="container-page scroll-mt-24 pb-16 md:pb-24"
        >
          <h2 className="font-heading text-2xl font-bold">
            Book a call with {general.name}
          </h2>

          <p className="mb-6 mt-2 text-sm text-muted">
            Choose a time below.{" "}
            <Link
              href={calendly}
              target="_blank"
              className="text-primary underline"
            >
              Open in a new tab
            </Link>
          </p>

          <CalendlyEmbed url={calendly} />
        </section>
      )}

      {point && (
        <section className="container-page pb-16 md:pb-24">
          <LocationMap lat={point.lat} lng={point.lng} label={contact.location || general.name} />
          <a
            href={`https://www.google.com/maps?q=${point.lat},${point.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-primary underline"
          >
            Open in Google Maps
          </a>
        </section>
      )}
    </>
  );
}

export default function ContactPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  return (
    <>
      <Suspense fallback={<div className="container-page py-24" />}>
        <ContactContent />
      </Suspense>

      <PageSections pageKey="contact" />
    </>
  );
}
