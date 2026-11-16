import { getSiteSettings } from "@/lib/settings";
import { DEFAULT_PRIVACY, DEFAULT_TERMS } from "@/lib/legal-defaults";

function LegalText({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={`l${blocks.length}`}>
        {list.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("- ")) {
      list.push(line.slice(2));
      continue;
    }
    flush();
    if (!line) continue;
    if (line.startsWith("## ")) blocks.push(<h2 key={blocks.length}>{line.slice(3)}</h2>);
    else blocks.push(<p key={blocks.length}>{line}</p>);
  }
  flush();
  return <div className="rich">{blocks}</div>;
}

export async function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const s = await getSiteSettings();
  const own = (kind === "privacy" ? s.legal.privacy : s.legal.terms).trim();
  const fallback = kind === "privacy" ? DEFAULT_PRIVACY : DEFAULT_TERMS;
  const email = s.contact.email || "the email on the contact page";
  const body = (own || fallback)
    .replaceAll("{{name}}", s.general.name)
    .replaceAll("{{email}}", email);

  return (
    <section className="container-page max-w-3xl py-16 md:py-24">
      <p className="font-mono text-sm text-primary">legal</p>
      <h1 className="mt-3 font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
        {kind === "privacy" ? "Privacy policy" : "Terms"}
        <span className="text-primary">.</span>
      </h1>
      <div className="mt-8">
        <LegalText text={body} />
      </div>
    </section>
  );
}