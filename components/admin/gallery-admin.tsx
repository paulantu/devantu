"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { Film, Trash2, Upload } from "lucide-react";
import { registerMediaAction } from "@/app/admin/media/actions";
import {
  addGalleryImagesAction,
  addGalleryVideoAction,
  deleteGalleryItemAction,
  updateGalleryItemAction,
} from "@/app/admin/gallery/actions";
import { Button } from "@/components/ui/button";
import { readDimensions } from "@/lib/image-dims";
import { cn } from "@/lib/utils";
import { MediaMultiPicker } from "./media-multi-picker";

export type AdminAlbum = { id: string; title: string };
export type AdminItem = {
  id: string;
  type: string;
  thumb: string;
  caption: string;
  location: string;
  takenOn: string;
  albumId: string;
  isVisible: boolean;
};

const MAX_SIZE = 10 * 1024 * 1024;
const input = "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm";

function ItemCard({ item, albums }: { item: AdminItem; albums: AdminAlbum[] }) {
  const [v, setV] = useState(item);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-surface", !v.isVisible && "opacity-60")}>
      <div className="relative aspect-video bg-elevated">
        {item.thumb && (
          <Image src={item.thumb} alt={item.caption || "Gallery item"} fill sizes="320px" className="object-cover" />
        )}
        {item.type === "video" && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded bg-background/90 px-2 py-0.5 font-mono text-xs">
            <Film className="size-3" /> video
          </span>
        )}
      </div>
      <div className="space-y-2 p-3">
        <input className={input} placeholder="Caption" value={v.caption} onChange={(e) => setV({ ...v, caption: e.target.value })} />
        <input className={input} placeholder="Location" value={v.location} onChange={(e) => setV({ ...v, location: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <input type="date" className={input} value={v.takenOn} onChange={(e) => setV({ ...v, takenOn: e.target.value })} />
          <select className={input} value={v.albumId} onChange={(e) => setV({ ...v, albumId: e.target.value })}>
            <option value="">No album</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" className="size-4 accent-[var(--primary)]" checked={v.isVisible} onChange={(e) => setV({ ...v, isVisible: e.target.checked })} />
          Show on the site
        </label>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await updateGalleryItemAction(item.id, {
                  caption: v.caption,
                  location: v.location,
                  takenOn: v.takenOn,
                  albumId: v.albumId,
                  isVisible: v.isVisible,
                });
                setMsg(r.message);
              })
            }
          >
            Save
          </Button>
          {msg && <span className="text-xs text-muted">{msg}</span>}
          <button
            disabled={pending}
            aria-label="Delete"
            className="ml-auto rounded-md p-2 text-red-400 hover:bg-elevated"
            onClick={() => {
              if (!confirm("Delete this item?")) return;
              start(async () => {
                const r = await deleteGalleryItemAction(item.id);
                if (!r.ok) alert(r.message);
              });
            }}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function GalleryAdmin({
  albums,
  items,
  filter,
}: {
  albums: AdminAlbum[];
  items: AdminItem[];
  filter: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [target, setTarget] = useState(albums.some((a) => a.id === filter) ? filter : "");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  async function uploadFiles(files: File[]) {
    const images = files.filter(
      (f) => f.type.startsWith("image/") && f.type !== "image/svg+xml",
    );
    if (images.length === 0) {
      setStatus("Choose image files (JPG, PNG, WebP, AVIF or GIF).");
      return;
    }
    setBusy(true);
    const urls: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      setStatus(`Uploading ${i + 1} of ${images.length}: ${file.name}`);
      if (file.size > MAX_SIZE) {
        errors.push(`${file.name} is larger than 10 MB`);
        continue;
      }
      try {
        const dims = await readDimensions(file);
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const blob = await upload(`media/${safe}`, file, {
          access: "public",
          handleUploadUrl: "/api/media/upload",
        });
        const reg = await registerMediaAction({
          url: blob.url,
          pathname: blob.pathname,
          filename: file.name,
          contentType: file.type,
          size: file.size,
          width: dims?.width ?? null,
          height: dims?.height ?? null,
        });
        if (!reg.ok) {
          errors.push(`${file.name}: ${reg.message}`);
          continue;
        }
        urls.push(blob.url);
      } catch (e) {
        errors.push(`${file.name}: ${e instanceof Error ? e.message : "failed"}`);
      }
    }

    if (urls.length > 0) {
      const r = await addGalleryImagesAction(urls, target);
      if (!r.ok) errors.push(r.message);
    }
    setBusy(false);
    setStatus(errors.length ? errors.join(" · ") : `Added ${urls.length} photo${urls.length === 1 ? "" : "s"}`);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  async function addFromLibrary(urls: string[]) {
    setBusy(true);
    const r = await addGalleryImagesAction(urls, target);
    setBusy(false);
    setStatus(r.message);
    router.refresh();
  }

  async function addVideo() {
    setBusy(true);
    const r = await addGalleryVideoAction(videoUrl, target);
    setBusy(false);
    setStatus(r.message);
    if (r.ok) setVideoUrl("");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4 rounded-lg border border-border bg-surface p-5">
        <label className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted">Add new items to album</span>
          <select className={`${input} max-w-60`} value={target} onChange={(e) => setTarget(e.target.value)}>
            <option value="">No album</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </label>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!busy) uploadFiles(Array.from(e.dataTransfer.files));
          }}
          className={cn(
            "flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center",
            dragging ? "border-primary bg-primary/5" : "border-border",
          )}
        >
          <Upload className="size-6 text-primary" />
          <p className="text-sm text-muted">Drag photos here, or</p>
          <div className="flex flex-wrap justify-center gap-2">
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              className="hidden"
              onChange={(e) => uploadFiles(Array.from(e.target.files ?? []))}
            />
            <Button disabled={busy} onClick={() => fileRef.current?.click()}>
              {busy ? "Working..." : "Upload photos"}
            </Button>
            <MediaMultiPicker onSelect={addFromLibrary} />
          </div>
        </div>

        <form
          className="flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy && videoUrl.trim()) addVideo();
          }}
        >
          <input
            className={`${input} max-w-md`}
            placeholder="YouTube or Vimeo link"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <Button variant="outline" disabled={busy || !videoUrl.trim()}>
            <Film className="size-4" /> Add video
          </Button>
        </form>

        {status && <p className="text-sm text-muted">{status}</p>}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {[
          { key: "all", label: "All" },
          { key: "none", label: "No album" },
          ...albums.map((a) => ({ key: a.id, label: a.title })),
        ].map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/admin/gallery" : `/admin/gallery?album=${t.key}`}
            className={cn(
              "rounded-md border px-3 py-1.5",
              t.key === filter
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted hover:bg-elevated",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
          Nothing here yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((it) => (
            <ItemCard key={`${it.id}-${it.albumId}`} item={it} albums={albums} />
          ))}
        </div>
      )}
    </div>
  );
}