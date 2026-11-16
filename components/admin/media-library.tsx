"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { Copy, FileText, Trash2, Upload } from "lucide-react";
import {
  deleteMediaAction,
  registerMediaAction,
  updateAltAction,
} from "@/app/admin/media/actions";
import { Button } from "@/components/ui/button";

export type MediaItem = {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  canManage: boolean;
};

const MAX_SIZE = 10 * 1024 * 1024;

function readDimensions(file: File): Promise<{ width: number; height: number } | null> {
  if (!file.type.startsWith("image/")) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  });
}

function formatSize(bytes: number) {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    const list = Array.from(files);
    const errors: string[] = [];

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      setStatus(`Uploading ${i + 1} of ${list.length}: ${file.name}`);
      if (file.size > MAX_SIZE) {
        errors.push(`${file.name} is larger than 10 MB`);
        continue;
      }
      try {
        const dims = await readDimensions(file);
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const blob = await upload(`media/${safeName}`, file, {
          access: "public",
          handleUploadUrl: "/api/media/upload",
        });
        const res = await registerMediaAction({
          url: blob.url,
          pathname: blob.pathname,
          filename: file.name,
          contentType: file.type,
          size: file.size,
          width: dims?.width ?? null,
          height: dims?.height ?? null,
        });
        if (!res.ok) errors.push(`${file.name}: ${res.message}`);
      } catch (e) {
        errors.push(`${file.name}: ${e instanceof Error ? e.message : "failed"}`);
      }
    }

    setBusy(false);
    setStatus(errors.length ? errors.join(" · ") : "Upload complete");
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif,application/pdf"
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        <Button disabled={busy} onClick={() => inputRef.current?.click()}>
          <Upload className="size-4" />
          {busy ? "Uploading..." : "Upload files"}
        </Button>
        <p className="text-sm text-muted">
          {status || "Images and PDFs, up to 10 MB each."}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted">
          No files yet. Upload your first image.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function MediaCard({ item }: { item: MediaItem }) {
  const [alt, setAlt] = useState(item.alt);
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState(false);
  const isImage = item.contentType.startsWith("image/");

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="relative aspect-square bg-elevated">
        {isImage ? (
          <Image
            src={item.url}
            alt={item.alt || item.filename}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <FileText className="size-12" />
          </div>
        )}
      </div>

      <div className="space-y-2 p-3">
        <p className="truncate text-sm font-medium" title={item.filename}>
          {item.filename}
        </p>
        <p className="font-mono text-xs text-muted">
          {formatSize(item.size)}
          {item.width && item.height ? ` · ${item.width}×${item.height}` : ""}
        </p>

        {isImage && (
          <input
            value={alt}
            disabled={!item.canManage || pending}
            placeholder="Alt text (describe the image)"
            onChange={(e) => setAlt(e.target.value)}
            onBlur={() => {
              if (alt !== item.alt) start(async () => void (await updateAltAction(item.id, alt)));
            }}
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
          />
        )}

        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs hover:bg-elevated"
            onClick={async () => {
              await navigator.clipboard.writeText(item.url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            <Copy className="size-3.5" /> {copied ? "Copied" : "Copy URL"}
          </button>
          {item.canManage && (
            <button
              disabled={pending}
              className="ml-auto flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-red-400 hover:bg-elevated disabled:opacity-60"
              onClick={() => {
                if (!confirm("Delete this file permanently?")) return;
                start(async () => {
                  const res = await deleteMediaAction(item.id);
                  if (!res.ok) alert(res.message);
                });
              }}
            >
              <Trash2 className="size-3.5" /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}