import Image from "next/image";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { ServiceIcon } from "@/components/ui/service-icon";
import { SmartLink } from "@/components/ui/smart-link";
import { getPublishedServices } from "@/lib/services";
import { getSiteSettings } from "@/lib/settings";

type Props = { data: Record<string, unknown> };
const str = (v: unknown) => (typeof v === "string" ? v : "");

const availability = {
  open: { text: "Open for work", dot: "bg-green-500" },
  limited: { text: "Limited availability", dot: "bg-amber-400" },
  booked: { text: "Fully booked", dot: "bg-red-400" },
} as const;

function Chevron({
  dir,
  className,
}: {
  dir: "left" | "right";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 80"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      <polyline points={dir === "left" ? "40,4 6,40 40,76" : "8,4 42,40 8,76"} />
    </svg>
  );
}

export async function HeroBlock({ data }: Props) {
  const { general, profile } = await getSiteSettings();
  const name = str(data.name) || general.name;
  const role = str(data.role) || general.title;
  const photo = str(data.photoUrl) || profile.photoUrl;
  const cutout = data.photoStyle === "cutout";
  const status =
    data.showAvailability !== false && profile.availability !== "hidden"
      ? availability[profile.availability]
      : null;

  return (
    <section className="relative overflow-hidden">
      <div className="container-page grid items-center gap-12 py-14 md:py-24 lg:grid-cols-2">
        <div className="anim-fade-up">
          {status && (
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs">
              <span className={`size-2 rounded-full ${status.dot}`} />
              {status.text}
              {profile.availabilityNote && (
                <span className="text-muted">· {profile.availabilityNote}</span>
              )}
            </p>
          )}

          <h1 className="font-heading text-5xl font-extrabold tracking-tight md:text-7xl">
            {str(data.greeting) || "Hello"}
            <span className="text-primary">.</span>
          </h1>

          <div className="mt-5 flex items-center gap-4">
            <span className="h-px w-12 bg-primary" />
            <p className="font-heading text-2xl font-light md:text-3xl">
              {str(data.introLabel)} {name}
            </p>
          </div>
          <p className="mt-3 font-heading text-3xl font-bold md:text-4xl">{role}</p>

          {str(data.text) && (
            <p className="mt-5 max-w-lg leading-relaxed text-muted">{str(data.text)}</p>
          )}

          <div className="mt-9 flex flex-wrap gap-3">
            {str(data.primaryLabel) && str(data.primaryLink) && (
              <SmartLink href={str(data.primaryLink)} className={buttonStyles({ size: "lg" })}>
                {str(data.primaryLabel)}
              </SmartLink>
            )}
            {str(data.secondaryLabel) && str(data.secondaryLink) && (
              <SmartLink
                href={str(data.secondaryLink)}
                className={buttonStyles({ variant: "outline", size: "lg" })}
              >
                {str(data.secondaryLabel)}
              </SmartLink>
            )}
          </div>
        </div>

                <div
          className="anim-fade-up relative mx-auto aspect-square w-full max-w-[28rem]"
          style={{ animationDelay: "150ms" }}
        >
          <div
            className="anim-glow absolute inset-[4%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,107,87,0.30) 0%, transparent 68%)",
            }}
          />

          <Chevron
            dir="left"
            className="anim-float absolute left-0 top-[20%] h-16 w-auto text-primary/60"
          />
          <Chevron
            dir="right"
            className="anim-float absolute bottom-[20%] right-0 h-16 w-auto text-primary/60"
          />

          {cutout ? (
            <div className="absolute inset-[12%]">
              <div className="absolute inset-0 rounded-full border-[12px] border-primary" />
              {photo && (
                <Image
                  src={photo}
                  alt={name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 22rem, 80vw"
                  className="object-contain object-bottom"
                  style={{ transform: "scale(1.12)", transformOrigin: "bottom" }}
                />
              )}
            </div>
          ) : (
            <div className="absolute inset-[12%] overflow-hidden rounded-full border-[10px] border-primary bg-elevated">
              {photo ? (
                <Image
                  src={photo}
                  alt={name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 22rem, 80vw"
                  className="object-cover object-center"
                />
              ) : (
                <span className="flex size-full items-center justify-center font-heading text-8xl font-extrabold text-primary">
                  {name.slice(0, 1)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatValue({ value }: { value: string }) {
  const m = value.match(/^(.*?)([+%])$/);
  return m ? (
    <>
      {m[1]}
      <span className="text-primary">{m[2]}</span>
    </>
  ) : (
    <>{value}</>
  );
}

export async function AboutTeaserBlock({ data }: Props) {
  const settings = await getSiteSettings();
  const services =
    data.showServices !== false && settings.modules.services
      ? (await getPublishedServices()).slice(0, 4)
      : [];

  const raw = str(data.text) || settings.profile.summary;
  const text = raw.length > 360 ? `${raw.slice(0, 357).trimEnd()}...` : raw;
  const stats = ((data.items ?? []) as { value: string; label: string }[]).slice(0, 4);

  return (
    <section className="container-page py-16 md:py-24">
      <div className={services.length > 0 ? "grid items-center gap-14 lg:grid-cols-2" : ""}>
        {services.length > 0 && (
          <ol className="relative space-y-8 border-l-2 border-primary/50 pl-8">
            {services.map((s) => (
              <li key={s.id} className="relative">
                <span className="absolute -left-[2.45rem] top-1/2 size-3 -translate-y-1/2 rounded-full bg-primary" />
                <Link href={`/services/${s.slug}`} className="group flex items-center gap-4">
                  <span className="flex size-14 shrink-0 items-center justify-center text-primary">
                    <ServiceIcon name={s.icon} className="size-9" />
                  </span>
                  <span className="font-heading text-lg font-semibold transition-colors group-hover:text-primary">
                    {s.title}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}

        <div>
          <h2 className="font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
            {str(data.heading)}
          </h2>
          {text && <p className="mt-6 max-w-xl leading-relaxed text-muted">{text}</p>}

          {stats.length > 0 && (
            <div className="mt-8 grid max-w-lg grid-cols-2 gap-6 sm:grid-cols-3">
              {stats.map((s, i) => (
                <div key={i}>
                  <p className="font-heading text-3xl font-extrabold">
                    <StatValue value={s.value} />
                  </p>
                  <p className="mt-1 text-sm text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {str(data.buttonLabel) && str(data.buttonLink) && (
            <div className="mt-9">
              <SmartLink
                href={str(data.buttonLink)}
                className={buttonStyles({ variant: "outline" })}
              >
                {str(data.buttonLabel)}
              </SmartLink>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Header({ data }: Props) {
  return (
    <div className="max-w-2xl">
      {str(data.eyebrow) && (
        <p className="font-mono text-sm text-primary">{str(data.eyebrow)}</p>
      )}
      <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-4xl">
        {str(data.heading)}
        <span className="text-primary">.</span>
      </h2>
      {str(data.text) && <p className="mt-3 text-muted">{str(data.text)}</p>}
    </div>
  );
}

export function ProcessBlock({ data }: Props) {
  const items = (data.items ?? []) as { title: string; text: string }[];
  if (items.length === 0) return null;
  return (
    <section className="container-page py-16 md:py-24">
      <Header data={data} />
      <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {items.map((s, i) => (
          <li key={i} className="rounded-xl border border-border bg-surface p-6">
            <span className="font-mono text-sm text-primary">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-3 font-heading text-lg font-bold">{s.title}</h3>
            {s.text && <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}

export function TestimonialsBlock({ data }: Props) {
  const items = (data.items ?? []) as {
    quote: string;
    author: string;
    role: string;
  }[];
  if (items.length === 0) return null;
  return (
    <section className="container-page py-16 md:py-24">
      <Header data={data} />
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((t, i) => (
          <figure key={i} className="flex flex-col rounded-xl border border-border bg-surface p-6">
            <span className="font-heading text-4xl leading-none text-primary">“</span>
            <blockquote className="mt-2 flex-1 text-sm leading-relaxed">{t.quote}</blockquote>
            <figcaption className="mt-5 border-t border-border pt-4 text-sm">
              <span className="font-heading font-semibold">{t.author}</span>
              {t.role && <span className="text-muted"> · {t.role}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}