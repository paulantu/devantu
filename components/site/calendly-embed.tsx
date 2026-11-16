"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (o: { url: string; parentElement: HTMLElement }) => void;
    };
  }
}

const SRC = "https://assets.calendly.com/assets/external/widget.js";

export function CalendlyEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = `${url}${url.includes("?") ? "&" : "?"}hide_gdpr_banner=1`;
    const init = () => {
      if (el.childElementCount === 0) {
        window.Calendly?.initInlineWidget({ url: target, parentElement: el });
      }
    };

    if (window.Calendly) {
      init();
      return;
    }
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SRC;
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", init);
    return () => script?.removeEventListener("load", init);
  }, [url]);

  return <div ref={ref} className="h-[700px] overflow-hidden rounded-xl border border-border" />;
}