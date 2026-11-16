import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { Button, buttonStyles } from "@/components/ui/button";
import { unsubscribeAction } from "./actions";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false },
};

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ done?: string }>;
};

function mask(email: string) {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 1)}***@${domain}`;
}

async function UnsubscribeContent({ params, searchParams }: Props) {
  await connection();
  const { token } = await params;
  const { done } = await searchParams;
  if (!/^[\w-]{20,64}$/.test(token)) notFound();

  const [row] = await db
    .select({ email: subscribers.email, status: subscribers.status })
    .from(subscribers)
    .where(eq(subscribers.token, token));
  if (!row) notFound();

  const finished = done === "1" || row.status === "unsubscribed";

  return (
    <section className="container-page max-w-lg py-24 text-center">
      <h1 className="font-heading text-3xl font-extrabold">
        {finished ? "You're unsubscribed" : "Unsubscribe"}
        <span className="text-primary">.</span>
      </h1>
      <p className="mt-4 text-muted">
        {finished
          ? `${mask(row.email)} will no longer receive emails from this list.`
          : `Stop emails to ${mask(row.email)}?`}
      </p>
      <div className="mt-8 flex justify-center">
        {finished ? (
          <Link href="/" className={buttonStyles({ variant: "outline" })}>
            Back to home
          </Link>
        ) : (
          <form action={unsubscribeAction.bind(null, token)}>
            <Button>Yes, unsubscribe me</Button>
          </form>
        )}
      </div>
    </section>
  );
}

export default function UnsubscribePage(props: Props) {
  return (
    <Suspense fallback={<div className="container-page py-24" />}>
      <UnsubscribeContent {...props} />
    </Suspense>
  );
}