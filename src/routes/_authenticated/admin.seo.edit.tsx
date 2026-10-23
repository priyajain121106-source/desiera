import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { saveSeoSetting } from "@/lib/seo-data.functions";
import { registryEntry, type SeoRegistryEntry } from "@/lib/seo-registry";
import {
  analyzeSeo,
  resolveSeo,
  type SeoRecord,
  type SeoSiteSettings,
} from "@/lib/seo-resolve";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/seo/edit")({
  validateSearch: (search: Record<string, unknown>) => ({
    path: typeof search["path"] === "string" ? search["path"] : "/",
  }),
  component: SeoEditor,
});

interface FormState {
  meta_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
  canonical_url: string;
  robots_index: boolean;
  robots_follow: boolean;
  focus_keyword: string;
  json_ld: string;
  slug_override: string;
  sitemap_include: boolean;
}

const EMPTY: FormState = {
  meta_title: "",
  meta_description: "",
  og_title: "",
  og_description: "",
  og_image_url: "",
  canonical_url: "",
  robots_index: true,
  robots_follow: true,
  focus_keyword: "",
  json_ld: "",
  slug_override: "",
  sitemap_include: true,
};

function SeoEditor() {
  const { path } = Route.useSearch();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: rows, isLoading } = useQuery({
    queryKey: ["seo-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("seo_settings").select("*");
      return (data ?? []) as SeoRecord[];
    },
  });
  const { data: siteRows } = useQuery({
    queryKey: ["seo-site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("seo_site_settings").select("*").eq("id", 1).maybeSingle();
      return (data ?? null) as SeoSiteSettings | null;
    },
  });

  const entry: SeoRegistryEntry | undefined = registryEntry(path);
  const record = (rows ?? []).find((r) => r.page_path === path) ?? null;

  const initial = useMemo<FormState>(() => {
    if (!record) return { ...EMPTY };
    return {
      meta_title: record.meta_title ?? "",
      meta_description: record.meta_description ?? "",
      og_title: record.og_title ?? "",
      og_description: record.og_description ?? "",
      og_image_url: record.og_image_url ?? "",
      canonical_url: record.canonical_url ?? "",
      robots_index: record.robots_index,
      robots_follow: record.robots_follow,
      focus_keyword: record.focus_keyword ?? "",
      json_ld: record.json_ld ? JSON.stringify(record.json_ld, null, 2) : "",
      slug_override: record.slug_override ?? "",
      sitemap_include: record.sitemap_include,
    };
  }, [record]);

  const [form, setForm] = useState<FormState>(initial);
  const [savedAt, setSavedAt] = useState<string | null>(record?.updated_at ?? null);

  // Re-seed the form when the editor is opened for a different page.
  useEffect(() => {
    setForm(initial);
    setSavedAt(record?.updated_at ?? null);
  }, [initial, record?.updated_at]);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const saveFn = useServerFn(saveSeoSetting);
  const saveMutation = useMutation({
    mutationFn: async () => {
      await saveFn({
        data: {
          page_path: path,
          page_type: entry?.type ?? "other",
          meta_title: form.meta_title || null,
          meta_description: form.meta_description || null,
          og_title: form.og_title || null,
          og_description: form.og_description || null,
          og_image_url: form.og_image_url || null,
          canonical_url: form.canonical_url || null,
          robots_index: form.robots_index,
          robots_follow: form.robots_follow,
          focus_keyword: form.focus_keyword || null,
          json_ld: form.json_ld.trim() || null,
          slug_override: form.slug_override || null,
          sitemap_include: form.sitemap_include,
        },
      });
    },
    onSuccess: async () => {
      toast.success("SEO settings saved");
      setSavedAt(new Date().toISOString());
      await queryClient.invalidateQueries({ queryKey: ["seo-settings"] });
      router.invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Saving failed");
    },
  });

  if (!entry) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Unknown page path. Go back to the dashboard and pick a page.
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/admin/seo">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const resolved = resolveSeo({
    path,
    record,
    site: siteRows ?? null,
    tokens: {
      productName: entry.productName,
      collectionName: entry.collectionName,
      price: entry.price,
    },
  });

  const warnings = analyzeSeo({
    title: resolved.title,
    description: resolved.description,
    ogImageUrl: resolved.ogImageUrl,
    canonicalUrl: resolved.canonicalUrl,
    focusKeyword: form.focus_keyword || null,
    index: resolved.index,
    follow: resolved.follow,
    sitemapInclude: form.sitemap_include,
    jsonLd: form.json_ld || null,
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const absoluteOgImage = resolved.ogImageUrl.startsWith("https://");

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Page editor</p>
            <h2 className="font-display text-2xl">{entry.path}</h2>
            <p className="text-xs text-muted-foreground">
              {savedAt
                ? `Last saved ${new Date(savedAt).toLocaleString()}`
                : "No saved setting yet — the page uses the built-in fallback copy."}
            </p>
          </div>
          {dirty ? (
            <span className="rounded-full bg-accent/20 px-3 py-1 text-xs uppercase tracking-wide">
              Unsaved changes
            </span>
          ) : (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-wide text-primary">
              All changes saved
            </span>
          )}
        </div>

        <FieldGroup title="Search result">
          <LabeledField label="SEO title" hint={`${form.meta_title.length || resolved.title.length} chars — aim 30–60`}>
            <Input
              value={form.meta_title}
              onChange={(e) => set("meta_title", e.target.value)}
              placeholder={entry.title}
            />
          </LabeledField>
          <LabeledField label="Meta description" hint={`${form.meta_description.length || resolved.description.length} chars — aim 70–160`}>
            <Textarea
              value={form.meta_description}
              onChange={(e) => set("meta_description", e.target.value)}
              placeholder={entry.description}
              rows={3}
            />
          </LabeledField>
          <LabeledField label="Focus keyword" hint="Should appear in the title or description">
            <Input
              value={form.focus_keyword}
              onChange={(e) => set("focus_keyword", e.target.value)}
              placeholder="e.g. chikankari kurti"
            />
          </LabeledField>
        </FieldGroup>

        <FieldGroup title="Social sharing">
          <LabeledField label="Open Graph title">
            <Input
              value={form.og_title}
              onChange={(e) => set("og_title", e.target.value)}
              placeholder="Falls back to the SEO title"
            />
          </LabeledField>
          <LabeledField label="Open Graph description">
            <Textarea
              value={form.og_description}
              onChange={(e) => set("og_description", e.target.value)}
              placeholder="Falls back to the meta description"
              rows={2}
            />
          </LabeledField>
          <LabeledField label="Social sharing image" hint="Absolute https:// URL. Empty = sitewide default image.">
            <Input
              value={form.og_image_url}
              onChange={(e) => set("og_image_url", e.target.value)}
              placeholder="https://desiera.shop/og-desi-era.jpg"
            />
          </LabeledField>
        </FieldGroup>

        <FieldGroup title="URLs, robots & sitemap">
          <LabeledField label="Canonical URL" hint="Leave empty to use the site URL + this page's path.">
            <Input
              value={form.canonical_url}
              onChange={(e) => set("canonical_url", e.target.value)}
              placeholder={resolved.canonicalUrl}
            />
          </LabeledField>
          {entry.type === "product" ? (
            <LabeledField
              label="URL slug override"
              hint={`Current: ${path.replace("/product/", "")}. Changing this updates the page URL and auto-creates a redirect from the old one.`}
            >
              <Input
                value={form.slug_override}
                onChange={(e) => set("slug_override", e.target.value)}
                placeholder="keep current slug"
              />
            </LabeledField>
          ) : null}
          <div className="flex flex-wrap gap-6">
            <ToggleField
              label="Allow indexing (index)"
              checked={form.robots_index}
              onChange={(v) => set("robots_index", v)}
            />
            <ToggleField
              label="Follow links (follow)"
              checked={form.robots_follow}
              onChange={(v) => set("robots_follow", v)}
            />
            <ToggleField
              label="Include in XML sitemap"
              checked={form.sitemap_include}
              onChange={(v) => set("sitemap_include", v)}
            />
          </div>
        </FieldGroup>

        <FieldGroup title="Structured data (JSON-LD)">
          <LabeledField
            label="JSON-LD object"
            hint="Optional. Organization, WebSite, Product, BreadcrumbList or FAQPage — a single JSON object, validated on save."
          >
            <Textarea
              value={form.json_ld}
              onChange={(e) => set("json_ld", e.target.value)}
              rows={8}
              className="font-mono text-xs"
              placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Organization"\n}`}
            />
          </LabeledField>
        </FieldGroup>

        <div className="sticky bottom-4 flex flex-wrap items-center gap-3 rounded-lg border bg-background p-4 shadow-sm">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !dirty}>
            {saveMutation.isPending ? "Saving…" : "Save changes"}
          </Button>
          {dirty ? (
            <Button variant="outline" onClick={() => setForm(initial)} disabled={saveMutation.isPending}>
              Discard
            </Button>
          ) : null}
          <span className="text-xs text-muted-foreground">
            {dirty ? "You have unsaved changes." : "Everything on this page is saved."}
          </span>
        </div>
      </div>

      {/* Right column: previews + validation */}
      <aside className="space-y-6">
        <section>
          <h3 className="eyebrow">Google preview</h3>
          <div className="mt-2 rounded-lg border bg-white p-4">
            <p className="text-xs text-[#4d5156]">{resolved.canonicalUrl}</p>
            <p className="mt-1 text-lg leading-snug text-[#1a0dab]">{resolved.title}</p>
            <p className="mt-1 text-sm leading-snug text-[#4d5156]">{resolved.description}</p>
          </div>
        </section>

        <section>
          <h3 className="eyebrow">Social card preview</h3>
          <div className="mt-2 overflow-hidden rounded-lg border bg-white">
            {absoluteOgImage ? (
              <img
                src={resolved.ogImageUrl}
                alt=""
                className="aspect-[1.91/1] w-full object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="flex aspect-[1.91/1] items-center justify-center bg-muted text-xs text-muted-foreground">
                Sitewide default social image
              </div>
            )}
            <div className="p-3">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">desiera.shop</p>
              <p className="mt-1 text-sm font-medium leading-snug">{resolved.ogTitle}</p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{resolved.ogDescription}</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="eyebrow">Health check</h3>
          {warnings.length === 0 ? (
            <p className="mt-2 rounded-lg border bg-primary/5 p-3 text-sm text-primary">
              No issues found. This page is in good shape.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {warnings.map((w, i) => (
                <li
                  key={i}
                  className="rounded-lg border p-3 text-xs leading-relaxed"
                  role={w.level === "error" ? "alert" : undefined}
                >
                  <span
                    className={
                      w.level === "error"
                        ? "font-semibold uppercase text-destructive"
                        : w.level === "warning"
                          ? "font-semibold uppercase text-accent"
                          : "font-semibold uppercase text-muted-foreground"
                    }
                  >
                    {w.level}
                  </span>{" "}
                  {w.message}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3 className="eyebrow">Final resolved metadata</h3>
          <dl className="mt-2 space-y-2 rounded-lg border p-3 text-xs">
            {(
              [
                ["Title", resolved.title, "title"],
                ["Description", resolved.description, "description"],
                ["OG title", resolved.ogTitle, "ogTitle"],
                ["OG description", resolved.ogDescription, "ogDescription"],
                ["OG image", resolved.ogImageUrl, "ogImageUrl"],
                ["Canonical", resolved.canonicalUrl, "canonicalUrl"],
                ["Robots", `${resolved.index ? "index" : "noindex"}, ${resolved.follow ? "follow" : "nofollow"}`, null],
                ["JSON-LD", resolved.jsonLd ? "saved structured data" : "none", "jsonLd"],
              ] as const
            ).map(([label, value, sourceKey]) => (
              <div key={label}>
                <dt className="font-medium">{label}</dt>
                <dd className="text-muted-foreground">
                  {value}
                  {sourceKey && resolved.sources[sourceKey] ? (
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-accent">
                      ← {resolved.sources[sourceKey]}
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
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

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
