/**
 * Server functions behind the SEO panel and storefront metadata.
 * - Public reads use the publishable client (anon SELECT policies).
 * - Writes require a signed-in user with the `admin` role (re-verified here).
 */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { registryEntry, isKnownPath } from "./seo-registry";
import { resolveSeo, type SeoHeadData, type SeoRecord, type SeoSiteSettings } from "./seo-resolve";

type PublicClient = ReturnType<typeof createClient<Database>>;

let publicClient: PublicClient | null = null;

function getPublicSupabase(): PublicClient {
  if (publicClient) return publicClient;
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  publicClient = createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      // Opaque sb_ keys aren't JWTs; send apikey, not an Authorization bearer.
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  return publicClient;
}

function fallbackHead(path: string): SeoHeadData {
  return resolveSeo({ path, record: null, site: null, tokens: {} });
}

/** Public: resolves one page's metadata. Never throws — falls back to the hardcoded registry. */
export const getSeoForPath = createServerFn({ method: "GET" })
  .inputValidator((input: { path: string; productName?: string; collectionName?: string; price?: number }) => input)
  .handler(async ({ data }): Promise<SeoHeadData> => {
    try {
      const supabase = getPublicSupabase();
      const [settingsRes, recordRes] = await Promise.all([
        supabase.from("seo_site_settings").select("*").eq("id", 1).maybeSingle(),
        supabase.from("seo_settings").select("*").eq("page_path", data.path).maybeSingle(),
      ]);
      const site = (settingsRes.data ?? null) as SeoSiteSettings | null;
      const record = (recordRes.data ?? null) as SeoRecord | null;
      return resolveSeo({
        path: data.path,
        record,
        site,
        tokens: {
          productName: data.productName,
          collectionName: data.collectionName,
          price: data.price,
        },
      });
    } catch (error) {
      console.error("getSeoForPath fell back to defaults:", error);
      return fallbackHead(data.path);
    }
  });

/** Public: look up a redirect for an unknown path (used by the product loader and the 404 page). */
export const resolveRedirect = createServerFn({ method: "GET" })
  .inputValidator((input: { from: string }) => input)
  .handler(async ({ data }): Promise<{ to: string | null }> => {
    try {
      const supabase = getPublicSupabase();
      const { data: row } = await supabase
        .from("seo_redirects")
        .select("to_path")
        .eq("from_path", data.from)
        .maybeSingle();
      return { to: row?.to_path ?? null };
    } catch {
      return { to: null };
    }
  });

async function requireAdmin(context: { supabase: Database[never]; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden: admin role required");
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/") || trimmed.includes("..") || trimmed.length > 250) {
    throw new Error("Path must start with '/' and be a valid site path");
  }
  return trimmed.replace(/\/+$/, "") || "/";
}

function sanitizeSlug(slug: string | null): string | null {
  if (!slug) return null;
  const cleaned = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (cleaned.length > 120) throw new Error("Slug is too long");
  return cleaned || null;
}

function sanitizeUrl(value: string | null, label: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^https:\/\//.test(trimmed)) throw new Error(`${label} must be an absolute https:// URL`);
  return trimmed;
}

export interface SeoSettingInput {
  page_path: string;
  page_type: string;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  focus_keyword: string | null;
  json_ld: string | null;
  slug_override: string | null;
  sitemap_include: boolean;
}

/** Admin: create or update one page's SEO row. */
export const saveSeoSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: SeoSettingInput) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const supabase = getPublicSupabase();

    const page_path = normalizePath(data.page_path);
    if (!isKnownPath(page_path)) {
      const { data: existing } = await supabase
        .from("seo_settings")
        .select("page_path")
        .eq("page_path", page_path)
        .maybeSingle();
      if (!existing) throw new Error("Unknown page path");
    }

    let jsonLd: unknown = null;
    if (data.json_ld && data.json_ld.trim().length > 0) {
      const text = data.json_ld.trim();
      if (text.length > 8000) throw new Error("JSON-LD is larger than 8 KB");
      const parsed: unknown = JSON.parse(text);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("JSON-LD must be a single JSON object");
      }
      jsonLd = parsed;
    }

    const slugOverride = data.page_type === "product" ? sanitizeSlug(data.slug_override) : null;
    const row = {
      page_path,
      page_type: data.page_type,
      meta_title: data.meta_title?.trim() || null,
      meta_description: data.meta_description?.trim() || null,
      og_title: data.og_title?.trim() || null,
      og_description: data.og_description?.trim() || null,
      og_image_url: sanitizeUrl(data.og_image_url, "Social image"),
      canonical_url: sanitizeUrl(data.canonical_url, "Canonical URL"),
      robots_index: data.robots_index,
      robots_follow: data.robots_follow,
      focus_keyword: data.focus_keyword?.trim() || null,
      json_ld: jsonLd,
      slug_override: slugOverride,
      sitemap_include: data.sitemap_include,
    };

    const { error } = await supabase.from("seo_settings").upsert(row, { onConflict: "page_path" });
    if (error) throw new Error(error.message);

    // Editing a product slug auto-creates the redirect from the old URL.
    if (slugOverride) {
      const originalSlug = page_path.replace(/^\/product\//, "");
      if (slugOverride !== originalSlug && originalSlug.length > 0 && originalSlug !== "$slug") {
        await supabase.from("seo_redirects").upsert(
          { from_path: `/product/${originalSlug}`, to_path: `/product/${slugOverride}` },
          { onConflict: "from_path" },
        );
      }
    }
    return { ok: true };
  });

/** Admin: update the single sitewide settings row. */
export const saveSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: Partial<SeoSiteSettings> & { robots_preset?: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const supabase = getPublicSupabase();
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.site_name !== undefined) patch["site_name"] = data.site_name.trim() || "Desi Era";
    if (data.title_suffix !== undefined) patch["title_suffix"] = data.title_suffix;
    if (data.default_description !== undefined) patch["default_description"] = data.default_description.trim();
    if (data.default_og_image_url !== undefined)
      patch["default_og_image_url"] = sanitizeUrl(data.default_og_image_url, "Default social image");
    if (data.site_url !== undefined) patch["site_url"] = sanitizeUrl(data.site_url, "Site URL");
    if (data.robots_preset !== undefined) {
      if (!["normal", "maintenance"].includes(data.robots_preset)) throw new Error("Unknown robots preset");
      patch["robots_preset"] = data.robots_preset;
    }
    const { error } = await supabase.from("seo_site_settings").update(patch).eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin: create or update a redirect. */
export const saveRedirect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { from_path: string; to_path: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const supabase = getPublicSupabase();
    const from_path = normalizePath(data.from_path);
    const to_path = normalizePath(data.to_path);
    if (from_path === to_path) throw new Error("A redirect cannot point at itself");
    const { error } = await supabase
      .from("seo_redirects")
      .upsert({ from_path, to_path }, { onConflict: "from_path" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin: delete a redirect. */
export const deleteRedirect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { from_path: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const supabase = getPublicSupabase();
    const { error } = await supabase.from("seo_redirects").delete().eq("from_path", data.from_path);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
