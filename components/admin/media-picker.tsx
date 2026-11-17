"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { listImagesAction } from "@/app/admin/media/actions";
import { Button } from "@/components/ui/button";

type Img = { id: string; url: string; alt: string; filename: string };

export function MediaPicker({
  onSelect,
  label = "Choose image",
}: {
  onSelect: (url: string, alt?: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Img[] | null>(null);

  async function openPicker() {
    setOpen(true);
    setItems(await listImagesAction());
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={openPicker}>
        {label}
      </Button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-lg border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="font-heading font-semibold">Media library</h3>
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
                    Upload some in the media library
                  </Link>
                  , then reopen this window.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {items.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      title={img.filename}
                      className="relative aspect-square overflow-hidden rounded-md border border-border hover:border-primary"
                      onClick={() => {
                        onSelect(img.url, img.alt);
                        setOpen(false);
                      }}
                    >
                      <Image src={img.url} alt={img.alt || img.filename} fill sizes="160px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}