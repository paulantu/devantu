"use client";

import { buttonStyles } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-mono text-sm text-primary">error</p>
      <h1 className="font-heading text-4xl font-extrabold">
        Something went wrong<span className="text-primary">.</span>
      </h1>
      <p className="max-w-md text-muted">
        An unexpected error happened. You can try again, or head back to the
        home page.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className={buttonStyles()}>
          Try again
        </button>
        <a href="/" className={buttonStyles({ variant: "outline" })}>
          Home
        </a>
      </div>
    </main>
  );
}