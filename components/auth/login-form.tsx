"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const { error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) {
      setError(error.message ?? "Login failed");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="rounded border border-border bg-transparent px-3 py-2"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        className="rounded border border-border bg-transparent px-3 py-2"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        disabled={loading}
        className="rounded bg-primary px-3 py-2 font-semibold text-primary-foreground disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}