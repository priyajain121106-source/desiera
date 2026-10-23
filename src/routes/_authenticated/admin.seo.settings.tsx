import { useEffect, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useServerFn } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { saveSiteSettings } from "@/lib/seo-data.functions";
import type { SeoSiteSettings } from "@/lib/seo-resolve";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/seo/settings")({
  component: SeoSiteSettingsPage,
});

const FALLBACK: SeoSiteSettings = {
  site_name: "Desi Era",
  title_suffix: " — Desi Era",
  default_description:
    "Desi Era — kurtis, kurtas, kurta sets and co-ord sets designed for everyday wear.",
  default_og_image_url: "https://desiera.shop/og-desi-era.jpg",
  site_url: "https://desiera.shop",
  robots_preset: "normal",
};

function SeoSiteSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["seo-site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("seo_site_settings").select("*").eq("id", 1).maybeSingle();
      return (data ?? FALLBACK) as SeoSiteSettings;
    },
  });

  const [form, setForm] = useState<SeoSiteSettings>(FALLBACK);
  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const dirty = JSON.stringify(form) !== JSON.stringify(data ?? FALLBACK);

  const saveFn = useServerFn(saveSiteSettings);
  const saveMutation = useMutation({
    mutationFn: async () => {
      await saveFn({ data: form });
    },
    onSuccess: async () => {
      toast.success("Sitewide defaults saved");
      await queryClient.invalidateQueries({ queryKey: ["seo-site-settings"] });
      router.invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Saving failed"),
  });

  const set = <K extends keyof SeoSiteSettings>(key: K, value: SeoSiteSettings[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-sm text-muted-foreground">
        These defaults apply to every page that hasn't saved its own values. Blank
        page-level fields inherit from here.
      </p>

      <div className="space-y-4 rounded-lg border p-5">
        <div>
          <Label>Site name</Label>
          <Input className="mt-2" value={form.site_name} onChange={(e) => set("site_name", e.target.value)} />
        </div>
        <div>
          <Label>Default title suffix</Label>
          <p className="text-xs text-muted-foreground">
            Appended to saved page titles that don't already name the brand.
          </p>
          <Input className="mt-2" value={form.title_suffix} onChange={(e) => set("title_suffix", e.target.value)} />
        </div>
        <div>
          <Label>Preferred site URL</Label>
          <Input className="mt-2" value={form.site_url} onChange={(e) => set("site_url", e.target.value)} />
        </div>
        <div>
          <Label>Default meta description</Label>
          <Textarea
            className="mt-2"
            rows={3}
            value={form.default_description}
            onChange={(e) => set("default_description", e.target.value)}
          />
        </div>
        <div>
          <Label>Default social sharing image</Label>
          <Input
            className="mt-2"
            value={form.default_og_image_url}
            onChange={(e) => set("default_og_image_url", e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-lg border p-5">
        <Label>Robots.txt preset</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Only guarded presets are offered. "Normal" allows all crawlers;
          "Maintenance" asks search engines to stay away — the store stays
          reachable for shoppers, but pages will drop out of Google over time.
        </p>
        <Select value={form.robots_preset} onValueChange={(v) => set("robots_preset", v)}>
          <SelectTrigger className="mt-3 w-64" aria-label="Robots preset">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal — allow all crawlers</SelectItem>
            <SelectItem value="maintenance">Maintenance — keep crawlers out</SelectItem>
          </SelectContent>
        </Select>
        {form.robots_preset === "maintenance" ? (
          <p className="mt-3 rounded-md bg-destructive/10 p-3 text-xs text-destructive" role="alert">
            Warning: this tells every search engine to avoid the whole site. Only
            use it while the store is intentionally hidden, and switch back to
            "Normal" afterwards.
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !dirty}>
          {saveMutation.isPending ? "Saving…" : "Save defaults"}
        </Button>
        <span className="text-xs text-muted-foreground">
          {dirty ? "You have unsaved changes." : "Saved."}
        </span>
      </div>
    </div>
  );
}
