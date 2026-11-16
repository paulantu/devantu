"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type Msg = { ok: boolean; text: string } | null;

const input =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm";

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-5">
      <div>
        <h2 className="font-heading font-semibold">{title}</h2>
        {hint && <p className="text-sm text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Note({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return (
    <p className={msg.ok ? "text-sm text-green-500" : "text-sm text-red-400"}>
      {msg.text}
    </p>
  );
}

function PasswordCard() {
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const current = String(f.get("current"));
    const next = String(f.get("next"));
    if (next.length < 10) {
      return setMsg({ ok: false, text: "New password must be at least 10 characters" });
    }
    if (next !== String(f.get("confirm"))) {
      return setMsg({ ok: false, text: "Passwords do not match" });
    }
    setBusy(true);
    setMsg(null);
    const { error } = await authClient.changePassword({
      currentPassword: current,
      newPassword: next,
      revokeOtherSessions: true,
    });
    setBusy(false);
    if (error) {
      return setMsg({ ok: false, text: error.message ?? "Could not change password" });
    }
    form.reset();
    setMsg({ ok: true, text: "Password changed. Other devices were signed out." });
  }

  return (
    <Card title="Change password">
      <form onSubmit={onSubmit} className="max-w-sm space-y-3">
        <input name="current" type="password" placeholder="Current password" required className={input} />
        <input name="next" type="password" placeholder="New password (10+ characters)" required className={input} />
        <input name="confirm" type="password" placeholder="Confirm new password" required className={input} />
        <div className="flex items-center gap-3">
          <Button disabled={busy}>{busy ? "Saving..." : "Change password"}</Button>
          <Note msg={msg} />
        </div>
      </form>
    </Card>
  );
}

type Mode = "idle" | "enable" | "verify" | "codes" | "disable" | "regen";

function TwoFactorCard({
  enabled,
  required,
}: {
  enabled: boolean;
  required: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("idle");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [uri, setUri] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  const secret = uri ? new URL(uri).searchParams.get("secret") : null;

  async function run(fn: () => Promise<string | null>) {
    setBusy(true);
    setMsg(null);
    const problem = await fn();
    setBusy(false);
    if (problem) setMsg({ ok: false, text: problem });
  }

  const startEnable = () =>
    run(async () => {
      const { data, error } = await authClient.twoFactor.enable({ password });
      if (error || !data) return error?.message ?? "Could not start setup";
      if (!("totpURI" in data)) return "Authenticator app setup is not available";
      setUri(data.totpURI);
      setCodes(data.backupCodes);
      setPassword("");
      setMode("verify");
      return null;
    });

  const confirmCode = () =>
    run(async () => {
      const { error } = await authClient.twoFactor.verifyTotp({ code });
      if (error) return error.message ?? "Invalid code";
      setCode("");
      setMode("codes");
      router.refresh();
      return null;
    });

  const disable = () =>
    run(async () => {
      const { error } = await authClient.twoFactor.disable({ password });
      if (error) return error.message ?? "Could not disable";
      setPassword("");
      setMode("idle");
      router.refresh();
      return null;
    });

  const regen = () =>
    run(async () => {
      const { data, error } = await authClient.twoFactor.generateBackupCodes({ password });
      if (error || !data) return error?.message ?? "Could not create codes";
      setCodes(data.backupCodes);
      setPassword("");
      setMode("codes");
      return null;
    });

  const passwordStep = (label: string, action: () => void) => (
    <div className="max-w-sm space-y-3">
      <input
        type="password"
        placeholder="Your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={input}
      />
      <div className="flex gap-2">
        <Button disabled={busy || !password} onClick={action}>
          {label}
        </Button>
        <Button variant="ghost" onClick={() => { setMode("idle"); setPassword(""); setMsg(null); }}>
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <Card
      title="Two-factor authentication"
      hint={
        required
          ? "Required for your role. Sign-in needs a code from your authenticator app."
          : "Optional. Adds a code from your authenticator app at sign-in."
      }
    >
      {mode === "verify" && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            1. Scan this QR code with your authenticator app.
          </p>
          <div className="inline-block rounded-lg bg-white p-3">
            <QRCodeSVG value={uri} size={176} />
          </div>
          {secret && (
            <p className="text-xs text-muted">
              Can&apos;t scan? Enter this key manually:{" "}
              <span className="font-mono text-foreground">{secret}</span>
            </p>
          )}
          <p className="text-sm text-muted">2. Enter the 6-digit code it shows.</p>
          <div className="flex max-w-xs gap-2">
            <input
              inputMode="numeric"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={input}
            />
            <Button disabled={busy || code.length < 6} onClick={confirmCode}>
              Verify
            </Button>
          </div>
        </div>
      )}

      {mode === "codes" && (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            Save these backup codes somewhere safe. Each works once if you lose
            your phone. They will not be shown again.
          </p>
          <div className="grid max-w-sm grid-cols-2 gap-2 rounded-md bg-elevated p-3 font-mono text-sm">
            {codes.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(codes.join("\n"))}>
              Copy codes
            </Button>
            <Button size="sm" onClick={() => { setMode("idle"); setCodes([]); }}>
              I saved them
            </Button>
          </div>
        </div>
      )}

      {mode === "enable" && passwordStep("Continue", startEnable)}
      {mode === "disable" && passwordStep("Turn off 2FA", disable)}
      {mode === "regen" && passwordStep("Create new codes", regen)}

      {mode === "idle" && (
        <div className="flex flex-wrap items-center gap-3">
          {enabled ? (
            <>
              <span className="text-sm text-green-500">Enabled</span>
              <Button variant="outline" size="sm" onClick={() => setMode("regen")}>
                New backup codes
              </Button>
              {!required && (
                <Button variant="ghost" size="sm" onClick={() => setMode("disable")}>
                  Turn off
                </Button>
              )}
            </>
          ) : (
            <>
              <span className="text-sm text-muted">Off</span>
              <Button size="sm" onClick={() => setMode("enable")}>
                Set up 2FA
              </Button>
            </>
          )}
        </div>
      )}

      <Note msg={msg} />
    </Card>
  );
}

function SessionsCard() {
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Card title="Devices" hint="Sign out everywhere except this browser.">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            const { error } = await authClient.revokeOtherSessions();
            setBusy(false);
            setMsg(
              error
                ? { ok: false, text: error.message ?? "Failed" }
                : { ok: true, text: "Other devices signed out" },
            );
          }}
        >
          Sign out other devices
        </Button>
        <Note msg={msg} />
      </div>
    </Card>
  );
}

export function SecurityPanel({
  twoFactorEnabled,
  required,
}: {
  twoFactorEnabled: boolean;
  required: boolean;
}) {
  return (
    <div className="max-w-2xl space-y-6">
      {required && !twoFactorEnabled && (
        <p className="rounded-md border border-primary/40 bg-primary/10 p-3 text-sm">
          Two-factor authentication is required for your role. Set it up below to
          continue to the admin panel.
        </p>
      )}
      <TwoFactorCard enabled={twoFactorEnabled} required={required} />
      <PasswordCard />
      <SessionsCard />
    </div>
  );
}