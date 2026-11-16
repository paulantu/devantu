import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Download, Mail, MapPin, Phone } from "lucide-react";
import { getCvData } from "@/lib/cv";
import { getSiteSettings } from "@/lib/settings";
import { buttonStyles } from "@/components/ui/button";
import { PageSections } from "@/components/sections/page-sections";
import {
  CvHeading,
  SimpleList,
  SkillGroups,
  Timeline,
} from "@/components/site/cv-parts";

export const metadata: Metadata = { title: "About" };

const availability = {
  open: { text: "Open for work", dot: "bg-green-500" },
  limited: { text: "Limited availability", dot: "bg-amber-400" },
  booked: { text: "Fully booked", dot: "bg-red-400" },
} as const;

async function AboutContent() {
  const [settings, cv] = await Promise.all([getSiteSettings(), getCvData()]);
  const { general, contact, social, profile } = settings;
  const status =
    profile.availability !== "hidden" ? availability[profile.availability] : null;
  const wa = contact.whatsapp.replace(/\D/g, "");
  const storyParagraphs = profile.story.split(/\n{2,}/).filter(Boolean);

  return (
    <section className="container-page py-16 md:py-24">
      <header className="flex flex-col gap-8 md:flex-row md:items-center">
        {profile.photoUrl && (
          <div className="relative size-40 shrink-0 overflow-hidden rounded-full ring-4 ring-primary/70 ring-offset-4 ring-offset-background md:size-48">
            <Image
              src={profile.photoUrl}
              alt={general.name}
              fill
              priority
              sizes="192px"
              className="object-cover"
            />
          </div>
        )}
        <div className="max-w-2xl">
          {status && (
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs">
              <span className={`size-2 rounded-full ${status.dot}`} />
              {status.text}
              {profile.availabilityNote && (
                <span className="text-muted">· {profile.availabilityNote}</span>
              )}
            </p>
          )}
          <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
            {general.name}
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-2 font-mono text-primary">{general.title}</p>
          {profile.summary && (
            <p className="mt-4 leading-relaxed text-muted">{profile.summary}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3 print:hidden">
            <a href="/api/cv" download className={buttonStyles()}>
              <Download className="size-4" /> Download CV
            </a>
            <Link href="/contact" className={buttonStyles({ variant: "outline" })}>
              Got a project?
            </Link>
          </div>
        </div>
      </header>

      <div className="mt-16 grid gap-12 lg:grid-cols-[18rem_1fr]">
        <aside className="space-y-10">
          <div>
            <CvHeading>Contact</CvHeading>
            <ul className="space-y-3 text-sm">
              {contact.email && (
                <li className="flex items-center gap-2">
                  <Mail className="size-4 text-primary" />
                  <a href={`mailto:${contact.email}`} className="break-all hover:text-primary">
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="size-4 text-primary" />
                  <a href={`tel:${contact.phone}`} className="hover:text-primary">
                    {contact.phone}
                  </a>
                </li>
              )}
              {wa && (
                <li className="pl-6">
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary">
                    WhatsApp
                  </a>
                </li>
              )}
              {contact.location && (
                <li className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary" />
                  {contact.location}
                </li>
              )}
              {social.map((s) => (
                <li key={s.label} className="pl-6">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {cv.skills.length > 0 && (
            <div>
              <CvHeading>Skills</CvHeading>
              <SkillGroups skills={cv.skills} />
            </div>
          )}

          {cv.languages.length > 0 && (
            <div>
              <CvHeading>Languages</CvHeading>
              <ul className="space-y-2 text-sm">
                {cv.languages.map((l) => (
                  <li key={l.id} className="flex justify-between gap-3">
                    <span>{l.title}</span>
                    <span className="text-muted">{l.organization}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div className="space-y-12">
          {cv.experience.length > 0 && (
            <div>
              <CvHeading>Experience</CvHeading>
              <Timeline items={cv.experience} />
            </div>
          )}
          {cv.education.length > 0 && (
            <div>
              <CvHeading>Education</CvHeading>
              <Timeline items={cv.education} />
            </div>
          )}
          {cv.certifications.length > 0 && (
            <div>
              <CvHeading>Certifications</CvHeading>
              <SimpleList items={cv.certifications} />
            </div>
          )}
          {cv.awards.length > 0 && (
            <div>
              <CvHeading>Awards</CvHeading>
              <SimpleList items={cv.awards} />
            </div>
          )}
          {storyParagraphs.length > 0 && (
            <div>
              <CvHeading>My story</CvHeading>
              <div className="space-y-4">
                {storyParagraphs.map((p, i) => (
                  <p key={i} className="leading-relaxed text-muted">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          )}
          {profile.values.length > 0 && (
            <div>
              <CvHeading>What I value</CvHeading>
              <div className="grid gap-4 sm:grid-cols-2">
                {profile.values.map((v, i) => (
                  <div key={i} className="rounded-lg border border-border bg-surface p-4">
                    <h3 className="font-heading font-semibold">{v.title}</h3>
                    {v.text && <p className="mt-1 text-sm text-muted">{v.text}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <Suspense fallback={<div className="container-page py-24" />}>
        <AboutContent />
      </Suspense>
      <div className="print:hidden">
        <PageSections pageKey="about" />
      </div>
    </>
  );
}