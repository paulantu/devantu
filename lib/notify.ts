import { canSendConfirmation, ownerEmail, sendMail } from "./mail";

export async function sendRequestEmails(opts: {
  siteName: string;
  ownerFallback: string;
  visitorName: string;
  visitorEmail: string;
  subject: string;
  fields: [string, string][];
  message: string;
}) {
  const body = [
    ...opts.fields.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    "",
    opts.message,
  ].join("\n");

  const jobs: Promise<unknown>[] = [];

  const owner = ownerEmail(opts.ownerFallback);
  if (!owner) {
    console.warn(
      "[mail] No recipient. Set MAIL_TO in .env.local or an email in Settings → Contact.",
    );
  } else {
    jobs.push(
      sendMail({
        to: owner,
        subject: opts.subject,
        text: body,
        replyTo: opts.visitorEmail,
      }),
    );
  }

  if (canSendConfirmation()) {
    const first = opts.visitorName.split(" ")[0];
    jobs.push(
      sendMail({
        to: opts.visitorEmail,
        subject: `Thanks for reaching out - ${opts.siteName}`,
        text: `Hi ${first},\n\nThanks for your message. I received it and will reply as soon as I can.\n\nHere is a copy of what you sent:\n\n${body}\n\n${opts.siteName}`,
      }),
    );
  }

  await Promise.all(jobs);
}