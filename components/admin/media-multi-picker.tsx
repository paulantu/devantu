"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { listImagesAction } from "@/app/admin/media/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Img = { id: string; url: string; alt: string; filename: string };

export function MediaMultiPicker({
  onSelect,
  label = "Choose from library",
}: {
  onSelect: (urls: string[]) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Img[] | null>(null);
  const [picked, setPicked] = useState<string[]>([]);

  async function openPicker() {
    setOpen(true);
    setPicked([]);
    setItems(await listImagesAction());
  }

  const toggle = (url: string) =>
    setPicked((p) => (p.includes(url) ? p.filter((x) => x !== url) : [...p, url]));

  return (
    <>
      <Button type="button" variant="outline" onClick={openPicker}>
        {label}
      </Button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-lg border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-heading font-semibold">Select photos</h3>
              <button aria-label="Close" className="rounded p-1 hover:bg-elevated" onClick={() => setOpen(false)}>
                <X className="size-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4">
              {items === null ? (
                <p className="text-sm text-muted">Loading...</p>
              ) : items.length === 0 ? (
                <p className="text-sm text-muted">
                  No images yet.{" "}
                  <Link href="/admin/media" target="_blank" className="text-primary underline">
                    Upload some first
                  </Link>
                  .
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {items.map((img) => {
                    const on = picked.includes(img.url);
                    return (
                      <button
                        key={img.id}
                        type="button"
                        title={img.filename}
                        onClick={() => toggle(img.url)}
                        className={cn(
                          "relative aspect-square overflow-hidden rounded-md border-2",
                          on ? "border-primary" : "border-border hover:border-primary/60",
                        )}
                      >
                        <Image src={img.url} alt={img.alt || img.filename} fill sizes="160px" className="object-cover" />
                        {on && (
                          <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-3.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border p-4">
              <p className="text-sm text-muted">{picked.length} selected</p>
              <Button
                disabled={picked.length === 0}
                onClick={() => {
                  onSelect(picked);
                  setOpen(false);
                }}
              >
                Add {picked.length || ""} photo{picked.length === 1 ? "" : "s"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}