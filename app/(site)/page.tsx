import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

const swatches = [
  ["bg-background", "background"],
  ["bg-surface", "surface"],
  ["bg-elevated", "elevated"],
  ["bg-primary", "primary"],
  ["bg-muted", "muted"],
];

export default function HomePage() {
  return (
    <section className="container-page py-24">
      <p className="font-mono text-sm text-primary">module 3 · design check</p>
      <h1 className="mt-4 font-heading text-5xl font-extrabold tracking-tight md:text-6xl">
        Hello<span className="text-primary">.</span>
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Navy and coral theme, Montserrat headings, Inter body text. The real
        hero arrives in a later module.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/contact" className={buttonStyles({ size: "lg" })}>
          Got a project?
        </Link>
        <Link href="/resume" className={buttonStyles({ variant: "outline", size: "lg" })}>
          My resume
        </Link>
      </div>
      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {swatches.map(([cls, name]) => (
          <div key={name} className="space-y-2">
            <div className={`h-16 rounded-lg border border-border ${cls}`} />
            <p className="font-mono text-xs text-muted">{name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}