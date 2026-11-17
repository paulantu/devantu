"use client";

import { useRouter, useSearchParams } from "next/navigation";

const select = "rounded-md border border-border bg-surface px-3 py-2 text-sm";

export function GalleryFilters({
  albums,
  years,
}: {
  albums: { slug: string; title: string }[];
  years: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `/gallery?${qs}` : "/gallery", { scroll: false });
  }

  const hasFilters = ["album", "type", "year"].some((k) => params.get(k));

  return (
    <div className="flex flex-wrap items-center gap-3">
      {albums.length > 0 && (
        <select className={select} value={params.get("album") ?? ""} onChange={(e) => setParam("album", e.target.value)}>
          <option value="">All albums</option>
          {albums.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.title}
            </option>
          ))}
        </select>
      )}
      <select className={select} value={params.get("type") ?? ""} onChange={(e) => setParam("type", e.target.value)}>
        <option value="">Photos and videos</option>
        <option value="image">Photos</option>
        <option value="video">Videos</option>
      </select>
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
        <button className="text-sm text-primary underline" onClick={() => router.replace("/gallery", { scroll: false })}>
          Clear
        </button>
      )}
    </div>
  );
}