"use client";

import { useState } from "react";

const link =
  "rounded-full border border-border px-4 py-1.5 text-sm hover:border-primary hover:text-primary";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-xs text-muted">Share</span>
      <a className={link} target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?url=${u}&text=${t}`}>
        X
      </a>
      <a className={link} target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${u}`}>
        Facebook
      </a>
      <a className={link} target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`}>
        LinkedIn
      </a>
      <a className={link} target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${t}%20${u}`}>
        WhatsApp
      </a>
      <button
        className={link}
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}