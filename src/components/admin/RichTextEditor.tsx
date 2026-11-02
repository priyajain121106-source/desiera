/**
 * Rich-text editor for blog posts (Tiptap). Admin-only — the admin routes
 * render client-side only, so the editor never mounts during SSR.
 */
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  async function uploadImage(file: File) {
    if (!editor) return;
    const ext = file.name.split(".").pop() || "jpg";
    const path = `content/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("blog-media").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) {
      toast.error(`Image upload failed: ${error.message}`);
      return;
    }
    const { data } = supabase.storage.from("blog-media").getPublicUrl(path);
    editor.chain().focus().setImage({ src: data.publicUrl, alt: file.name.replace(/\.[a-z0-9]+$/i, "") }).run();
    toast.success("Image inserted");
  }

  if (!editor) {
    return <div className="min-h-64 rounded-lg border bg-muted/30" aria-hidden="true" />;
  }

  const btn = (active: boolean) =>
    cn(
      "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted",
      active ? "border-primary bg-primary/10 text-primary" : "border-transparent text-foreground",
    );

  return (
    <div className="rounded-lg border">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2" role="toolbar" aria-label="Formatting">
        <button type="button" className={btn(editor.isActive("heading", { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </button>
        <button type="button" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>
        <button type="button" className={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </button>
        <button type="button" className={btn(editor.isActive("paragraph"))} onClick={() => editor.chain().focus().setParagraph().run()}>
          ¶
        </button>
        <button type="button" aria-label="Bold" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </button>
        <button type="button" aria-label="Bullet list" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </button>
        <button
          type="button"
          className={btn(editor.isActive("link"))}
          onClick={() => {
            const url = window.prompt("Link URL (https://…)");
            if (!url) return;
            if (!/^https:\/\//.test(url)) {
              toast.error("Links must start with https://");
              return;
            }
            editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          Link
        </button>
        {editor.isActive("link") ? (
          <button type="button" className={btn(false)} onClick={() => editor.chain().focus().unsetLink().run()}>
            Unlink
          </button>
        ) : null}
        <button type="button" className={btn(editor.isActive("bulletList") || editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </button>
        <button type="button" className={btn(false)} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
          Table
        </button>
        <button type="button" className={btn(false)} onClick={() => editor.chain().focus().deleteTable().run()}>
          ✕ Table
        </button>
        <button type="button" className={btn(false)} onClick={() => imageInputRef.current?.click()}>
          Image
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadImage(file);
            e.target.value = "";
          }}
        />
      </div>
      <EditorContent editor={editor} className="blog-content prose-none px-4 py-3 [&_h1]:font-display [&_h1]:text-2xl [&_h2]:font-display [&_h2]:text-xl [&_h3]:font-display [&_h3]:text-lg [&_img]:mx-auto [&_img]:rounded-lg [&_img]:max-h-[520px] [&_img]:w-auto [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:bg-muted/50 [&_th]:px-2 [&_th]:py-1 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-accent [&_a]:underline" />
    </div>
  );
}
