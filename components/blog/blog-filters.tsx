"use client";

import { useRouter, useSearchParams } from "next/navigation";

const select = "rounded-md border border-border bg-surface px-3 py-2 text-sm";

export function BlogFilters({
  categories,
  tags,
}: {
  categories: { slug: string; name: string }[];
  tags: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `/blog?${qs}` : "/blog", { scroll: false });
  }

  const hasFilters = ["q", "category", "tag"].some((k) => params.get(k));

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
          placeholder="Search posts..."
          className={`${select} w-56`}
        />
      </form>

      {categories.length > 0 && (
        <select className={select} value={params.get("category") ?? ""} onChange={(e) => setParam("category", e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      {tags.length > 0 && (
        <select className={select} value={params.get("tag") ?? ""} onChange={(e) => setParam("tag", e.target.value)}>
          <option value="">All tags</option>
          {tags.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      )}

      {hasFilters && (
        <button className="text-sm text-primary underline" onClick={() => router.replace("/blog", { scroll: false })}>
          Clear
        </button>
      )}
    </div>
  );
}