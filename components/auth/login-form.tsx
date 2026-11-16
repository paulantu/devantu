"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const field = "rounded border border-border bg-transparent px-3 py-2";
const submit =
  "rounded bg-primary px-3 py-2 font-semibold text-primary-foreground disabled:opacity-60";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"password" | "code">("password");
  const [useBackup, setUseBackup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function done() {
    router.push("/admin");
    router.refresh();
  }

  async function onPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    const { data, error: err } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (err) {
      setError(err.message ?? "Login failed");
      setLoading(false);
      return;
    }
    if ((data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) {
      setStep("code");
      setLoading(false);
      return;
    }
    done();
  }

  async function onCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const code = String(form.get("code")).trim();
    setLoading(true);
    setError("");

    let failed: string | null = null;
    if (useBackup) {
      const { error: err } = await authClient.twoFactor.verifyBackupCode({ code });
      if (err) failed = err.message ?? "Invalid backup code";
    } else {
      const { error: err } = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice: form.get("trust") === "on",
      });
      if (err) failed = err.message ?? "Invalid code";
    }

    if (failed) {
      setError(failed);
      setLoading(false);
      return;
    }
    done();
  }

  if (step === "code") {
    return (
      <form onSubmit={onCode} className="flex w-full max-w-sm flex-col gap-4">
        <p className="text-sm text-muted">
          {useBackup
            ? "Enter one of your backup codes."
            : "Enter the 6-digit code from your authenticator app."}
        </p>
        <input
          name="code"
          inputMode={useBackup ? "text" : "numeric"}
          autoComplete="one-time-code"
          placeholder={useBackup ? "Backup code" : "123456"}
          required
          autoFocus
          className={field}
        />
        {!useBackup && (
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="trust" className="size-4 accent-[var(--primary)]" />
            Trust this device for 30 days
          </label>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button disabled={loading} className={submit}>
          {loading ? "Checking..." : "Verify"}
        </button>
        <button
          type="button"
          className="text-sm text-muted underline"
          onClick={() => {
            setUseBackup(!useBackup);
            setError("");
          }}
        >
          {useBackup ? "Use authenticator app instead" : "Use a backup code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onPassword} className="flex w-full max-w-sm flex-col gap-4">
      <input name="email" type="email" placeholder="Email" required className={field} />
      <input name="password" type="password" placeholder="Password" required className={field} />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button disabled={loading} className={submit}>
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}