"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { saveSettingAction } from "@/app/admin/settings/actions";
import { Button } from "@/components/ui/button";
import {
  MODULE_KEYS,
  type SettingKey,
  type SiteSettings,
} from "@/lib/settings-schema";
import { FieldInput } from "./field-input";
const input =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  );
}

function Card({
  title,
  hint,
  settingKey,
  data,
  children,
}: {
  title: string;
  hint?: string;
  settingKey: SettingKey;
  data: unknown;
  children: React.ReactNode;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-5">
      <div>
        <h2 className="font-heading font-semibold">{title}</h2>
        {hint && <p className="text-sm text-muted">{hint}</p>}
      </div>
      {children}
      <div className="flex items-center gap-3">
        <Button
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await saveSettingAction(settingKey, data);
              setMsg({ ok: r.ok, text: r.message });
            })
          }
        >
          {pending ? "Saving..." : "Save"}
        </Button>
        {msg && (
          <p className={msg.ok ? "text-sm text-green-500" : "text-sm text-red-400"}>
            {msg.text}
          </p>
        )}
      </div>
    </section>
  );
}

function move<T>(arr: T[], i: number, dir: -1 | 1) {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

export function GeneralCard({ initial }: { initial: SiteSettings["general"] }) {
  const [v, setV] = useState(initial);
  return (
    <Card
      title="General"
      hint="Used for the logo, browser tab title and search results."
      settingKey="general"
      data={v}
    >
      <Field label="Your name (shown as the logo)">
        <input className={input} value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      </Field>
      <Field label="Title / tagline">
        <input className={input} value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
      </Field>
      <Field label="Short description (SEO)">
        <textarea rows={3} className={input} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
      </Field>
    </Card>
  );
}

const contactFields: { key: keyof SiteSettings["contact"]; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "whatsapp", label: "WhatsApp number (with country code, e.g. 8801XXXXXXXXX)" },
  { key: "calendly", label: "Calendly link (https://calendly.com/...)" },
  { key: "location", label: "City / address" },
  { key: "hours", label: "Working hours" },
  { key: "mapLat", label: "Map latitude, or paste both numbers from Google Maps (23.8103, 90.4125)" },
];

export function ContactCard({ initial }: { initial: SiteSettings["contact"] }) {
  const [v, setV] = useState(initial);
  return (
    <Card title="Contact details" settingKey="contact" data={v}>
      <div className="grid gap-3 sm:grid-cols-2">
        {contactFields.map((f) => (
          <Field key={f.key} label={f.label}>
            <input className={input} value={v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
          </Field>
        ))}
      </div>
    </Card>
  );
}

export function SocialCard({ initial }: { initial: SiteSettings["social"] }) {
  const [list, setList] = useState(initial);
  const update = (i: number, patch: Partial<(typeof list)[number]>) =>
    setList(list.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  return (
    <Card title="Social links" settingKey="social" data={list}>
      <div className="space-y-2">
        {list.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input className={`${input} max-w-40`} placeholder="GitHub" value={s.label} onChange={(e) => update(i, { label: e.target.value })} />
            <input className={input} placeholder="https://..." value={s.url} onChange={(e) => update(i, { url: e.target.value })} />
            <button aria-label="Remove" className="rounded-md p-2 text-red-400 hover:bg-elevated" onClick={() => setList(list.filter((_, idx) => idx !== i))}>
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={() => setList([...list, { label: "", url: "" }])}>
        <Plus className="size-4" /> Add link
      </Button>
    </Card>
  );
}

export function ModulesCard({ initial }: { initial: SiteSettings["modules"] }) {
  const [v, setV] = useState(initial);
  return (
    <Card
      title="Modules"
      hint="Turn whole features on or off. A module that is off disappears from the menu."
      settingKey="modules"
      data={v}
    >
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {MODULE_KEYS.map((k) => (
          <label key={k} className="flex items-center gap-2 text-sm capitalize">
            <input type="checkbox" checked={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.checked })} className="size-4 accent-[var(--primary)]" />
            {k}
          </label>
        ))}
      </div>
    </Card>
  );
}

export function NavCard({ initial }: { initial: SiteSettings["nav"] }) {
  const [list, setList] = useState(initial);
  const update = (i: number, patch: Partial<(typeof list)[number]>) =>
    setList(list.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  return (
    <Card
      title="Navigation menu"
      hint="Reorder with the arrows, hide an item with the checkbox."
      settingKey="nav"
      data={list}
    >
      <div className="space-y-2">
        {list.map((n, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <input className={`${input} max-w-40`} value={n.label} onChange={(e) => update(i, { label: e.target.value })} />
            <input className={`${input} max-w-52`} value={n.href} onChange={(e) => update(i, { href: e.target.value })} />
            <label className="flex items-center gap-1.5 text-xs text-muted">
              <input type="checkbox" checked={n.visible} onChange={(e) => update(i, { visible: e.target.checked })} className="size-4 accent-[var(--primary)]" />
              Visible
            </label>
            <button aria-label="Move up" className="rounded-md p-2 hover:bg-elevated" onClick={() => setList(move(list, i, -1))}>
              <ArrowUp className="size-4" />
            </button>
            <button aria-label="Move down" className="rounded-md p-2 hover:bg-elevated" onClick={() => setList(move(list, i, 1))}>
              <ArrowDown className="size-4" />
            </button>
            <button aria-label="Remove" className="rounded-md p-2 text-red-400 hover:bg-elevated" onClick={() => setList(list.filter((_, idx) => idx !== i))}>
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" onClick={() => setList([...list, { label: "", href: "/", visible: true }])}>
        <Plus className="size-4" /> Add item
      </Button>
    </Card>
  );
}



export function BlogSettingsCard({ initial }: { initial: SiteSettings["blog"] }) {
  const [v, setV] = useState(initial);
  return (
    <Card
      title="Blog"
      hint="Comments always wait for approval before they appear."
      settingKey="blog"
      data={v}
    >
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-[var(--primary)]" checked={v.comments} onChange={(e) => setV({ ...v, comments: e.target.checked })} />
        Allow comments on blog posts
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-[var(--primary)]" checked={v.newsletterBox} onChange={(e) => setV({ ...v, newsletterBox: e.target.checked })} />
        Show a newsletter signup box under every post
      </label>
    </Card>
  );
}




export function SeoCard({ initial }: { initial: SiteSettings["seo"] }) {
  const [v, setV] = useState(initial);
  return (
    <Card
      title="Search & sharing"
      hint="How your site looks in Google and when a link is shared."
      settingKey="seo"
      data={v}
    >
      <FieldInput
        field={{
          name: "ogImageUrl",
          label: "Default share image (1200 x 630 works best). Leave empty for an automatic one.",
          kind: "image",
        }}
        value={v.ogImageUrl}
        onChange={(x) => setV({ ...v, ogImageUrl: String(x) })}
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-[var(--primary)]" checked={v.noindex} onChange={(e) => setV({ ...v, noindex: e.target.checked })} />
        Hide the whole site from search engines (use this until you launch)
      </label>
    </Card>
  );
}

export function AnalyticsCard({ initial }: { initial: SiteSettings["analytics"] }) {
  const [v, setV] = useState(initial);
  return (
    <Card
      title="Analytics"
      hint="Vercel Analytics uses no cookies. Google Analytics shows a consent banner."
      settingKey="analytics"
      data={v}
    >
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-[var(--primary)]" checked={v.vercel} onChange={(e) => setV({ ...v, vercel: e.target.checked })} />
        Vercel Web Analytics
      </label>
      <Field label="Google Analytics 4 measurement ID (optional)">
        <input className={input} placeholder="G-XXXXXXXXXX" value={v.gaId} onChange={(e) => setV({ ...v, gaId: e.target.value })} />
      </Field>
    </Card>
  );
}

export function LegalCard({ initial }: { initial: SiteSettings["legal"] }) {
  const [v, setV] = useState(initial);
  return (
    <Card
      title="Privacy policy and terms"
      hint="Use ## for headings and - for bullet points. {{name}} and {{email}} fill in automatically. Have a professional review these texts."
      settingKey="legal"
      data={v}
    >
      <Field label="Privacy policy (/privacy)">
        <textarea rows={14} className={input} value={v.privacy} onChange={(e) => setV({ ...v, privacy: e.target.value })} />
      </Field>
      <Field label="Terms (/terms)">
        <textarea rows={14} className={input} value={v.terms} onChange={(e) => setV({ ...v, terms: e.target.value })} />
      </Field>
    </Card>
  );
}