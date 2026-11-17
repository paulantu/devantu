"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { formatDate } from "@/lib/format";

export type GalleryItemView = {
  id: string;
  type: "image" | "video";
  src: string;
  fullSrc: string;
  embedUrl: string;
  width: number | null;
  height: number | null;
  caption: string;
  location: string;
  date: string;
};

function Meta({ item }: { item: GalleryItemView }) {
  const bits = [item.location, item.date ? formatDate(new Date(item.date)) : ""].filter(Boolean);
  if (!item.caption && bits.length === 0) return null;
  return (
    <div className="mt-3 text-center text-sm">
      {item.caption && <p className="font-medium text-white">{item.caption}</p>}
      {bits.length > 0 && <p className="font-mono text-xs text-white/60">{bits.join(" · ")}</p>}
    </div>
  );
}

export function GalleryGrid({ items }: { items: GalleryItemView[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const go = useCallback(
    (dir: 1 | -1) =>
      setOpen((i) => (i === null ? null : (i + dir + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, go]);

  const current = open === null ? null : items[open];

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            onClick={() => setOpen(i)}
            className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-border bg-elevated text-left"
          >
            {it.type === "video" ? (
              <div className="relative aspect-video">
                {it.src && (
                  <Image src={it.src} alt={it.caption || "Video"} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Play className="size-6 fill-current" />
                  </span>
                </span>
              </div>
            ) : (
              <Image
                src={it.src}
                alt={it.caption || "Gallery photo"}
                width={it.width ?? 1280}
                height={it.height ?? 853}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="h-auto w-full transition-transform duration-500 group-hover:scale-105"
              />
            )}
            {it.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                {it.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Gallery viewer"
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-black/90 p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(null)}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
          }}
        >
          <button ref={closeRef} aria-label="Close" onClick={() => setOpen(null)} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
            <X className="size-6" />
          </button>
          {items.length > 1 && (
            <>
              <button aria-label="Previous" onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
                <ChevronLeft className="size-7" />
              </button>
              <button aria-label="Next" onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
                <ChevronRight className="size-7" />
              </button>
            </>
          )}

          {current.type === "video" && current.embedUrl ? (
            <div className="aspect-video w-[92vw] max-w-5xl overflow-hidden rounded-lg">
              <iframe
                key={current.id}
                src={`${current.embedUrl}?autoplay=1`}
                title={current.caption || "Video"}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="size-full"
              />
            </div>
          ) : (
            <div className="relative h-[75vh] w-[92vw] max-w-6xl">
              <Image
                key={current.id}
                src={current.fullSrc || current.src}
                alt={current.caption || "Gallery photo"}
                fill
                sizes="100vw"
                priority
                className="object-contain"
              />
            </div>
          )}

          <Meta item={current} />
          <p className="mt-1 font-mono text-xs text-white/50">
            {(open ?? 0) + 1} / {items.length}
          </p>
        </div>
      )}
    </>
  );
}