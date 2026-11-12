import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="font-heading text-4xl font-extrabold">
        Page not found<span className="text-primary">.</span>
      </h1>
      <p className="max-w-md text-muted">
        The page you are looking for does not exist or has moved.
      </p>
      <Link href="/" className={buttonStyles()}>
        Back to home
      </Link>
    </main>
  );
}