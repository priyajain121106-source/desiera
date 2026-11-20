/** Public metadata and redirect lookups used by the storefront. */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { registryEntry } from "./seo-registry";
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
