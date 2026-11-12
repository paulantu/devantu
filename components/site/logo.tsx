import Link from "next/link";
import { siteConfig } from "@/lib/site-config";


export function Logo({ name = siteConfig.name }: { name?: string }) {
  return (
    <Link href="/" className="font-heading text-xl font-bold tracking-tight">
      {name}
      <span className="text-primary">.</span>
    </Link>
  );
}