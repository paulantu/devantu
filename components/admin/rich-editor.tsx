"use client";

import { EditorContent, useEditor, type Editor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Code,
  FileCode,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaPicker } from "./media-picker";

const LANGUAGES = [
  ["", "Plain text"],
  ["javascript", "JavaScript"],
  ["typescript", "TypeScript"],
  ["php", "PHP"],
  ["html", "HTML"],
  ["css", "CSS"],
  ["json", "JSON"],
  ["bash", "Bash"],
  ["sql", "SQL"],
  ["python", "Python"],
] as const;

function Btn({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded p-2 hover:bg-elevated disabled:opacity-40",
        active && "bg-primary/15 text-primary",
      )}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const chain = () => editor.chain().focus();

  function setLink() {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (https://..., mailto:, /page or #section)", prev ?? "");
    if (url === null) return;
    const v = url.trim();
    if (v === "") {
      chain().extendMarkRange("link").unsetLink().run();
      return;
    }
    if (!/^(https?:\/\/|mailto:|\/|#)/i.test(v)) {
      alert("The link must start with https://, mailto:, / or #");
      return;
    }
    chain().extendMarkRange("link").setLink({ href: v }).run();
  }

  const sep = <span className="mx-1 h-5 w-px bg-border" />;

  return (
    <div className="sticky top-14 z-10 flex flex-wrap items-center gap-0.5 rounded-t-md border-b border-border bg-surface p-1.5 lg:top-0">
      <Btn label="Bold" active={editor.isActive("bold")} onClick={() => chain().toggleBold().run()}>
        <Bold className="size-4" />
      </Btn>
      <Btn label="Italic" active={editor.isActive("italic")} onClick={() => chain().toggleItalic().run()}>
        <Italic className="size-4" />
      </Btn>
      <Btn label="Strikethrough" active={editor.isActive("strike")} onClick={() => chain().toggleStrike().run()}>
        <Strikethrough className="size-4" />
      </Btn>
      <Btn label="Inline code" active={editor.isActive("code")} onClick={() => chain().toggleCode().run()}>
        <Code className="size-4" />
      </Btn>
      <Btn label="Link" active={editor.isActive("link")} onClick={setLink}>
        <Link2 className="size-4" />
      </Btn>
      {sep}
      <Btn label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="size-4" />
      </Btn>
      <Btn label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="size-4" />
      </Btn>
      <Btn label="Bullet list" active={editor.isActive("bulletList")} onClick={() => chain().toggleBulletList().run()}>
        <List className="size-4" />
      </Btn>
      <Btn label="Numbered list" active={editor.isActive("orderedList")} onClick={() => chain().toggleOrderedList().run()}>
        <ListOrdered className="size-4" />
      </Btn>
      <Btn label="Quote" active={editor.isActive("blockquote")} onClick={() => chain().toggleBlockquote().run()}>
        <Quote className="size-4" />
      </Btn>
      <Btn label="Code block" active={editor.isActive("codeBlock")} onClick={() => chain().toggleCodeBlock().run()}>
        <FileCode className="size-4" />
      </Btn>
      <Btn label="Divider" onClick={() => chain().setHorizontalRule().run()}>
        <Minus className="size-4" />
      </Btn>
      {sep}
      <MediaPicker
        label="Image"
        onSelect={(url, alt) => chain().setImage({ src: url, alt: alt ?? "" }).run()}
      />
      {sep}
      <Btn label="Undo" disabled={!editor.can().undo()} onClick={() => chain().undo().run()}>
        <Undo2 className="size-4" />
      </Btn>
      <Btn label="Redo" disabled={!editor.can().redo()} onClick={() => chain().redo().run()}>
        <Redo2 className="size-4" />
      </Btn>

      {editor.isActive("codeBlock") && (
        <select
          value={(editor.getAttributes("codeBlock").language as string | null) ?? ""}
          onChange={(e) =>
            chain().updateAttributes("codeBlock", { language: e.target.value || null }).run()
          }
          className="ml-2 rounded-md border border-border bg-background px-2 py-1 text-xs"
        >
          {LANGUAGES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export function RichEditor({
  initial,
  onChange,
}: {
  initial: JSONContent;
  onChange: (doc: JSONContent) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false },
      }),
      Image.configure({ allowBase64: false }),
    ],
    content: initial,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: "rich min-h-[420px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.getJSON()),
  });

  if (!editor) {
    return <div className="h-[460px] rounded-md border border-border bg-surface" />;
  }

  return (
    <div className="rounded-md border border-border bg-background">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}