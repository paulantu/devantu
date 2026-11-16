"use client";

import { useRouter, useSearchParams } from "next/navigation";

const select =
  "rounded-md border border-border bg-surface px-3 py-2 text-sm";

export function ProjectFilters({
  services,
  techs,
  years,
}: {
  services: { slug: string; title: string }[];
  techs: string[];
  years: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `/projects?${qs}` : "/projects", { scroll: false });
  }

  const hasFilters = ["q", "service", "status", "tech", "year"].some((k) =>
    params.get(k),
  );

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form
        key={params.get("q") ?? ""}
        onSubmit={(e) => {
          e.preventDefault();
          setParam("q", String(new FormData(e.currentTarget).get("q") ?? "").trim());
        }}
      >
        <input
          name="q"
          defaultValue={params.get("q") ?? ""}
          placeholder="Search projects..."
          className={`${select} w-52`}
        />
      </form>

      <select className={select} value={params.get("service") ?? ""} onChange={(e) => setParam("service", e.target.value)}>
        <option value="">All services</option>
        {services.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.title}
          </option>
        ))}
      </select>

      <select className={select} value={params.get("status") ?? ""} onChange={(e) => setParam("status", e.target.value)}>
        <option value="">Any status</option>
        <option value="completed">Completed</option>
        <option value="ongoing">Ongoing</option>
      </select>

      {techs.length > 0 && (
        <select className={select} value={params.get("tech") ?? ""} onChange={(e) => setParam("tech", e.target.value)}>
          <option value="">All technologies</option>
          {techs.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      )}

      {years.length > 0 && (
        <select className={select} value={params.get("year") ?? ""} onChange={(e) => setParam("year", e.target.value)}>
          <option value="">Any year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      )}

      {hasFilters && (
        <button className="text-sm text-primary underline" onClick={() => router.replace("/projects", { scroll: false })}>
          Clear
        </button>
      )}
    </div>
  );
}