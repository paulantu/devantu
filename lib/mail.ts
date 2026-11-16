import { Resend } from "resend";

type Mail = { to: string; subject: string; text: string; replyTo?: string };
export type MailResult = { ok: boolean; error?: string };

const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export async function sendMail({
  to,
  subject,
  text,
  replyTo,
}: Mail): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    const error = "RESEND_API_KEY is missing in .env.local";
    console.warn(`[mail] ${error}`);
    return { ok: false, error };
  }
  const from = process.env.MAIL_FROM ?? "Portfolio <onboarding@resend.dev>";
  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: oneLine(subject),
      text,
      replyTo,
    });
    if (error) {
      console.error(`[mail] to ${to} failed: ${error.message}`);
      return { ok: false, error: error.message };
    }
    console.log(`[mail] sent to ${to}`);
    return { ok: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Unknown error";
    console.error(`[mail] error: ${error}`);
    return { ok: false, error };
  }
}

// Visitors get a confirmation only once you send from your own domain.
export const canSendConfirmation = () =>
  !(process.env.MAIL_FROM ?? "onboarding@resend.dev").includes("resend.dev");

export const ownerEmail = (fallback: string) => process.env.MAIL_TO || fallback;