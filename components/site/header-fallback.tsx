import Link from "next/link";
import { Logo } from "./logo";

export function HeaderFallback({
  nav,
  name,
}: {
  nav: { label: string; href: string }[];
  name: string;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo name={name} />
        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="size-9" />
      </div>
    </header>
  );
}