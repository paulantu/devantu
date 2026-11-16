import { Fragment } from "react";
import { common, createLowlight } from "lowlight";
import { collectHeadings, nodeText, type Heading, type RichNode } from "@/lib/blog-content";

const lowlight = createLowlight(common);

const ALIAS: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  html: "xml",
  sh: "bash",
  shell: "bash",
};

type Hast = {
  type: string;
  value?: string;
  properties?: { className?: string[] };
  children?: Hast[];
};

function hastToReact(nodes: Hast[], prefix = ""): React.ReactNode[] {
  return nodes.map((n, i) => {
    if (n.type === "text") return n.value;
    if (n.type === "element") {
      return (
        <span key={`${prefix}${i}`} className={n.properties?.className?.join(" ")}>
          {hastToReact(n.children ?? [], `${prefix}${i}-`)}
        </span>
      );
    }
    return null;
  });
}

function safeHref(href: unknown) {
  const h = typeof href === "string" ? href.trim() : "";
  return /^(https?:\/\/|mailto:|\/|#)/i.test(h) ? h : null;
}

function renderText(node: RichNode, key: React.Key) {
  let el: React.ReactNode = node.text ?? "";
  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case "bold":
        el = <strong>{el}</strong>;
        break;
      case "italic":
        el = <em>{el}</em>;
        break;
      case "strike":
        el = <s>{el}</s>;
        break;
      case "underline":
        el = <u>{el}</u>;
        break;
      case "code":
        el = <code>{el}</code>;
        break;
      case "link": {
        const href = safeHref(mark.attrs?.href);
        if (href) {
          el = (
            <a
              href={href}
              {...(href.startsWith("http") ? { target: "_blank" } : {})}
              rel="noopener noreferrer"
            >
              {el}
            </a>
          );
        }
        break;
      }
    }
  }
  return <Fragment key={key}>{el}</Fragment>;
}

type Ctx = { headings: Heading[]; next: number };

function renderNode(node: RichNode, key: React.Key, ctx: Ctx): React.ReactNode {
  const kids = () => (node.content ?? []).map((c, i) => renderNode(c, i, ctx));

  switch (node.type) {
    case "text":
      return renderText(node, key);
    case "paragraph":
      return <p key={key}>{kids()}</p>;
    case "heading": {
      const level = Number(node.attrs?.level) || 2;
      if (level === 2 || level === 3) {
        const id = nodeText(node).trim() ? ctx.headings[ctx.next++]?.id : undefined;
        return level === 2 ? (
          <h2 key={key} id={id}>{kids()}</h2>
        ) : (
          <h3 key={key} id={id}>{kids()}</h3>
        );
      }
      return <h4 key={key}>{kids()}</h4>;
    }
    case "bulletList":
      return <ul key={key}>{kids()}</ul>;
    case "orderedList":
      return <ol key={key}>{kids()}</ol>;
    case "listItem":
      return <li key={key}>{kids()}</li>;
    case "blockquote":
      return <blockquote key={key}>{kids()}</blockquote>;
    case "horizontalRule":
      return <hr key={key} />;
    case "hardBreak":
      return <br key={key} />;
    case "codeBlock": {
      const code = nodeText(node);
      const raw = String(node.attrs?.language ?? "").toLowerCase();
      const lang = ALIAS[raw] ?? raw;
      let body: React.ReactNode = code;
      if (lang && lowlight.registered(lang)) {
        try {
          body = hastToReact(lowlight.highlight(lang, code).children as Hast[]);
        } catch {
          body = code;
        }
      }
      return (
        <pre key={key}>
          <code className={lang ? `hljs language-${lang}` : "hljs"}>{body}</code>
        </pre>
      );
    }
    case "image": {
      const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
      if (!/^https:\/\//.test(src)) return null;
      // eslint-disable-next-line @next/next/no-img-element
      return <img key={key} src={src} alt={String(node.attrs?.alt ?? "")} loading="lazy" />;
    }
    default:
      return null;
  }
}

export function RichContent({ doc }: { doc: unknown }) {
  const root = doc as RichNode;
  const ctx: Ctx = { headings: collectHeadings(doc), next: 0 };
  return (
    <div className="rich">
      {(root.content ?? []).map((n, i) => renderNode(n, i, ctx))}
    </div>
  );
}