import { SmartLink } from "@/components/ui/smart-link";
import { formatRange, lines } from "@/lib/cv-schema";
import type { CvEntry } from "@/lib/cv";

export function CvHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 border-b border-border pb-2 font-heading text-sm font-bold uppercase tracking-widest text-primary">
      {children}
    </h2>
  );
}

export function Timeline({ items }: { items: CvEntry[] }) {
  return (
    <ol className="ml-1.5 border-l border-primary/40">
      {items.map((e) => {
        const bullets = lines(e.description);
        const range = formatRange(e);
        return (
          <li key={e.id} className="relative pb-8 pl-7 last:pb-0">
            <span className="absolute -left-[5px] top-2 size-2.5 rounded-full bg-primary" />
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="font-heading font-semibold">{e.title}</h3>
              {range && <span className="font-mono text-xs text-muted">{range}</span>}
            </div>
            {(e.organization || e.location) && (
              <p className="text-sm text-muted">
                {e.url ? (
                  <SmartLink href={e.url} className="hover:text-primary">
                    {e.organization}
                  </SmartLink>
                ) : (
                  e.organization
                )}
                {e.organization && e.location && " · "}
                {e.location}
              </p>
            )}
            {bullets.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                {bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function SimpleList({ items }: { items: CvEntry[] }) {
  return (
    <ul className="space-y-4">
      {items.map((e) => {
        const range = formatRange(e);
        return (
          <li key={e.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <p className="font-medium">
                {e.url ? (
                  <SmartLink href={e.url} className="hover:text-primary">
                    {e.title}
                  </SmartLink>
                ) : (
                  e.title
                )}
              </p>
              {range && <span className="font-mono text-xs text-muted">{range}</span>}
            </div>
            {e.organization && <p className="text-sm text-muted">{e.organization}</p>}
            {lines(e.description).map((l, i) => (
              <p key={i} className="text-sm text-muted">
                {l}
              </p>
            ))}
          </li>
        );
      })}
    </ul>
  );
}

export function SkillGroups({ skills }: { skills: CvEntry[] }) {
  const groups = new Map<string, CvEntry[]>();
  for (const s of skills) {
    const key = s.organization || "Skills";
    groups.set(key, [...(groups.get(key) ?? []), s]);
  }
  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([group, items]) => (
        <div key={group}>
          <p className="mb-3 font-mono text-xs text-muted">{group}</p>
          <ul className="space-y-3">
            {items.map((s) => (
              <li key={s.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{s.title}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-elevated">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${s.level}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}