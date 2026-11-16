import { slugify } from "./slug";

export type RichNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: RichNode[];
};

export const emptyDoc = { type: "doc", content: [{ type: "paragraph" }] };

const INLINE_BLOCKS = new Set(["paragraph", "heading", "codeBlock"]);

export function nodeText(node: RichNode): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";
  const joiner = INLINE_BLOCKS.has(node.type ?? "") ? "" : " ";
  return (node.content ?? []).map(nodeText).join(joiner);
}

export function readingMinutes(doc: unknown) {
  const words = nodeText(doc as RichNode)
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export type Heading = { id: string; text: string; level: number };

// The renderer takes ids from this list in order, so they always match.
export function collectHeadings(doc: unknown): Heading[] {
  const out: Heading[] = [];
  const used = new Map<string, number>();

  const walk = (n: RichNode) => {
    if (n.type === "heading") {
      const level = Number(n.attrs?.level) || 2;
      const text = nodeText(n).trim();
      if ((level === 2 || level === 3) && text) {
        const base = slugify(text) || "section";
        const seen = used.get(base) ?? 0;
        used.set(base, seen + 1);
        out.push({ id: seen ? `${base}-${seen + 1}` : base, text, level });
      }
      return;
    }
    n.content?.forEach(walk);
  };
  walk(doc as RichNode);
  return out;
}