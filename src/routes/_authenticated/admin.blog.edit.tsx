import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAdminBlogPost, saveBlogPost } from "@/lib/blog.functions";
import { fetchBlogCategories } from "@/lib/blog-client";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/blog/edit")({
  validateSearch: (search: Record<string, unknown>) => ({
    slug: typeof search["slug"] === "string" ? search["slug"] : undefined,
  }),
  component: BlogEditor,
});

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  featured_image_alt: string;
  category_id: string;
  tags: string;
  author_name: string;
  published_at: string; // yyyy-mm-dd for the date input
  status: "draft" | "published";
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
  secondary_keywords: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
  robots_index: boolean;
}

const EMPTY: FormState = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  featured_image_url: "",
  featured_image_alt: "",
  category_id: "none",
  tags: "",
  author_name: "Desi Era",
  published_at: new Date().toISOString().slice(0, 10),
  status: "draft",
  meta_title: "",
  meta_description: "",
  focus_keyword: "",
  secondary_keywords: "",
  canonical_url: "",
  og_title: "",
  og_description: "",
  og_image_url: "",
  robots_index: true,
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function BlogEditor() {
  const { slug: editSlug } = Route.useSearch();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: existing, isLoading } = useQuery({
    queryKey: ["blog-post", editSlug],
    queryFn: () => getAdminBlogPost({ data: { slug: editSlug! } }),
    enabled: !!editSlug,
  });
  const { data: categories } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: fetchBlogCategories,
  });

  const post = existing?.post ?? null;

  const initial = useMemo<FormState>(() => {
    if (!post) return { ...EMPTY };
    return {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      featured_image_url: post.featured_image_url ?? "",
      featured_image_alt: post.featured_image_alt ?? "",
      category_id: post.category_id ?? "none",
      tags: post.tags.join(", "),
      author_name: post.author_name,
      published_at: (post.published_at ?? new Date().toISOString()).slice(0, 10),
      status: post.status,
      meta_title: post.meta_title ?? "",
      meta_description: post.meta_description ?? "",
      focus_keyword: post.focus_keyword ?? "",
      secondary_keywords: post.secondary_keywords.join(", "),
      canonical_url: post.canonical_url ?? "",
      og_title: post.og_title ?? "",
      og_description: post.og_description ?? "",
      og_image_url: post.og_image_url ?? "",
      robots_index: post.robots_index,
    };
  }, [post]);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setForm(initial);
      setSlugTouched(!!editSlug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, initial]);

  // Auto-suggest the slug from the title until the admin edits it manually.
  useEffect(() => {
    if (!slugTouched && !editSlug) setForm((f) => ({ ...f, slug: slugify(f.title) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.title, slugTouched, editSlug]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const saveFn = useServerFn(saveBlogPost);
  const saveMutation = useMutation({
    mutationFn: async (status: "draft" | "published") => {
      await saveFn({
        data: {
          id: post?.id,
          slug: form.slug,
          title: form.title,
          excerpt: form.excerpt || null,
          content: form.content,
          featured_image_url: form.featured_image_url || null,
          featured_image_alt: form.featured_image_alt || null,
          category_id: form.category_id === "none" ? null : form.category_id,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          author_name: form.author_name,
          published_at: form.published_at ? new Date(`${form.published_at}T09:00:00+05:30`).toISOString() : null,
          status,
          meta_title: form.meta_title || null,
          meta_description: form.meta_description || null,
          focus_keyword: form.focus_keyword || null,
          secondary_keywords: form.secondary_keywords.split(",").map((t) => t.trim()).filter(Boolean),
          canonical_url: form.canonical_url || null,
          og_title: form.og_title || null,
          og_description: form.og_description || null,
          og_image_url: form.og_image_url || null,
          robots_index: form.robots_index,
        },
      });
      return status;
    },
    onSuccess: async (status) => {
      toast.success(status === "published" ? "Post published" : "Draft saved");
      await queryClient.invalidateQueries({ queryKey: ["blog-dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["blog-listing"] });
      router.invalidate();
      void router.navigate({ to: "/admin/blog" });
    },
    onError: (error: Error) => toast.error(error.message || "Saving failed"),
  });

  async function uploadFeaturedImage(file: File) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `featured/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("blog-media").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) {
      toast.error(`Upload failed: ${error.message}`);
      return;
    }
    const { data } = supabase.storage.from("blog-media").getPublicUrl(path);
    set("featured_image_url", data.publicUrl);
    if (!form.featured_image_alt) set("featured_image_alt", file.name.replace(/\.[a-z0-9]+$/i, ""));
    toast.success("Featured image uploaded");
  }

  /* Pre-publish checklist */
  const checklist = useMemo(() => {
    const items: { ok: boolean; label: string }[] = [
      { ok: form.title.trim().length > 0, label: "Title is set" },
      { ok: form.slug.trim().length > 0, label: "URL slug is set" },
      { ok: form.excerpt.trim().length > 0, label: "Excerpt / summary written" },
      { ok: !!form.featured_image_url, label: "Featured image added" },
      { ok: form.featured_image_alt.trim().length > 0, label: "Featured image has alt text" },
      { ok: form.category_id !== "none", label: "Category chosen" },
      { ok: form.meta_title.trim().length >= 20, label: "SEO title at least 20 characters" },
      { ok: form.meta_description.trim().length >= 70, label: "Meta description at least 70 characters" },
      { ok: form.focus_keyword.trim().length > 0, label: "Focus keyword set" },
      { ok: form.robots_index, label: "Page allowed to be indexed" },
    ];
    return items;
  }, [form]);

  const seoTitle = form.meta_title.trim() || `${form.title} — Desi Era`;
  const seoDescription = form.meta_description.trim() || form.excerpt.trim();
  const ogTitle = form.og_title.trim() || seoTitle;
  const ogDescription = form.og_description.trim() || seoDescription;
  const ogImage = form.og_image_url.trim() || form.featured_image_url;
  const previewUrl = `https://desiera.shop/blog/${form.slug || "your-post"}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">{editSlug ? "Edit post" : "New post"}</p>
            <h2 className="font-display text-2xl">{form.title || "Untitled post"}</h2>
            {post ? (
              <p className="text-xs text-muted-foreground">
                Status: {post.status} ·{" "}
                {post.updated_at ? `Last saved ${new Date(post.updated_at).toLocaleString()}` : null}
              </p>
            ) : null}
          </div>
          <Button asChild variant="outline">
            <Link to="/admin/blog">Back to dashboard</Link>
          </Button>
        </div>

        <FieldGroup title="Post">
          <LabeledField label="Title">
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Post title" />
          </LabeledField>
          <LabeledField label="URL slug" hint={`Public URL: https://desiera.shop/blog/${form.slug || "…"}`}>
            <Input value={form.slug} onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }} placeholder="url-slug" />
          </LabeledField>
          <LabeledField label="Excerpt" hint="Short summary shown on the blog listing and in search results.">
            <Textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} />
          </LabeledField>
        </FieldGroup>

        <FieldGroup title="Content">
          <RichTextEditor value={form.content} onChange={(html) => set("content", html)} />
        </FieldGroup>

        <FieldGroup title="Featured image">
          <div className="flex flex-wrap items-center gap-4">
            {form.featured_image_url ? (
              <img src={form.featured_image_url} alt="" className="h-24 w-40 rounded-md border object-cover" />
            ) : (
              <div className="flex h-24 w-40 items-center justify-center rounded-md border bg-muted/30 text-xs text-muted-foreground">
                No image
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-md border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors hover:bg-muted">
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadFeaturedImage(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <p className="text-[11px] text-muted-foreground">or paste an image URL below</p>
            </div>
          </div>
          <LabeledField label="Image URL">
            <Input value={form.featured_image_url} onChange={(e) => set("featured_image_url", e.target.value)} placeholder="https://…" />
          </LabeledField>
          <LabeledField label="Alt text" hint="Describe the image for screen readers and SEO.">
            <Input value={form.featured_image_alt} onChange={(e) => set("featured_image_alt", e.target.value)} />
          </LabeledField>
        </FieldGroup>

        <FieldGroup title="Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <LabeledField label="Category">
              <Select value={form.category_id} onValueChange={(v) => set("category_id", v)}>
                <SelectTrigger aria-label="Category">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {(categories ?? []).map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </LabeledField>
            <LabeledField label="Author">
              <Input value={form.author_name} onChange={(e) => set("author_name", e.target.value)} />
            </LabeledField>
            <LabeledField label="Tags" hint="Comma-separated, e.g. kurti, styling, summer">
              <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} />
            </LabeledField>
            <LabeledField label="Publication date">
              <Input type="date" value={form.published_at} onChange={(e) => set("published_at", e.target.value)} />
            </LabeledField>
          </div>
        </FieldGroup>

        <FieldGroup title="SEO">
          <LabeledField label="SEO title" hint={`${form.meta_title.length} chars — aim 30–60`}>
            <Input value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} placeholder="Falls back to the post title" />
          </LabeledField>
          <LabeledField label="Meta description" hint={`${form.meta_description.length} chars — aim 70–160`}>
            <Textarea value={form.meta_description} onChange={(e) => set("meta_description", e.target.value)} rows={3} placeholder="Falls back to the excerpt" />
          </LabeledField>
          <div className="grid gap-4 sm:grid-cols-2">
            <LabeledField label="Primary keyword">
              <Input value={form.focus_keyword} onChange={(e) => set("focus_keyword", e.target.value)} />
            </LabeledField>
            <LabeledField label="Secondary keywords" hint="Comma-separated">
              <Input value={form.secondary_keywords} onChange={(e) => set("secondary_keywords", e.target.value)} />
            </LabeledField>
          </div>
          <LabeledField label="Canonical URL" hint="Leave empty to use the post's own URL.">
            <Input value={form.canonical_url} onChange={(e) => set("canonical_url", e.target.value)} placeholder={previewUrl} />
          </LabeledField>
          <div className="grid gap-4 sm:grid-cols-2">
            <LabeledField label="Open Graph title">
              <Input value={form.og_title} onChange={(e) => set("og_title", e.target.value)} />
            </LabeledField>
            <LabeledField label="Open Graph description">
              <Input value={form.og_description} onChange={(e) => set("og_description", e.target.value)} />
            </LabeledField>
          </div>
          <LabeledField label="Open Graph image" hint="Defaults to the featured image.">
            <Input value={form.og_image_url} onChange={(e) => set("og_image_url", e.target.value)} />
          </LabeledField>
          <div className="flex items-center gap-3">
            <Switch checked={form.robots_index} onCheckedChange={(v) => set("robots_index", v)} aria-label="Allow indexing" />
            <span className="text-sm">Allow search engines to index this post</span>
          </div>
        </FieldGroup>

        <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-lg border bg-background p-4 shadow-sm">
          <Button
            onClick={() => saveMutation.mutate(post?.status === "published" ? "published" : "draft")}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending
              ? "Saving…"
              : post?.status === "published"
                ? "Update post"
                : "Save draft"}
          </Button>
          {post?.status !== "published" ? (
            <Button variant="outline" onClick={() => saveMutation.mutate("published")} disabled={saveMutation.isPending}>
              Publish
            </Button>
          ) : (
            <Button variant="outline" onClick={() => saveMutation.mutate("draft")} disabled={saveMutation.isPending}>
              Unpublish
            </Button>
          )}
        </div>
      </div>

      {/* Right column: checklist + previews */}
      <aside className="space-y-6">
        <section>
          <h3 className="eyebrow">Before you publish</h3>
          <ul className="mt-2 space-y-1.5">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-start gap-2 text-sm">
                <span className={item.ok ? "text-primary" : "text-muted-foreground"}>{item.ok ? "✓" : "○"}</span>
                <span className={item.ok ? "" : "text-muted-foreground"}>{item.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="eyebrow">Google preview</h3>
          <div className="mt-2 rounded-lg border bg-white p-4">
            <p className="text-xs text-[#4d5156]">{previewUrl}</p>
            <p className="mt-1 text-lg leading-snug text-[#1a0dab]">{seoTitle || "Your post title"}</p>
            <p className="mt-1 text-sm leading-snug text-[#4d5156]">{seoDescription || "Your meta description or excerpt appears here."}</p>
          </div>
        </section>

        <section>
          <h3 className="eyebrow">Social card preview</h3>
          <div className="mt-2 overflow-hidden rounded-lg border bg-white">
            {ogImage ? (
              <img src={ogImage} alt="" className="aspect-[1.91/1] w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
            ) : (
              <div className="flex aspect-[1.91/1] items-center justify-center bg-muted text-xs text-muted-foreground">
                Featured image
              </div>
            )}
            <div className="p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">desiera.shop</p>
              <p className="mt-1 text-sm font-medium leading-snug">{ogTitle || "Your post title"}</p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{ogDescription || "Your social description appears here."}</p>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border p-5">
      <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function LabeledField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}
