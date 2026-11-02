/**
 * Server functions behind the blog admin panel and public blog pages.
 * - Public reads use the publishable client (anon SELECT policies).
 * - Writes require a signed-in user with the `admin` role (re-verified here).
 */
import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type PublicClient = ReturnType<typeof createClient<Database>>;
type Supabase = SupabaseClient<Database>;

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

async function requireAdmin(context: { supabase: Supabase; userId: string }) {
  const { data: isAdmin, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!isAdmin) throw new Error("Forbidden: admin role required");
}

const LIST_COLUMNS =
  "id, slug, title, excerpt, featured_image_url, featured_image_alt, author_name, published_at, reading_time_minutes, tags, category_id, blog_categories(name, slug)";

function sanitizeSearchTerm(term: string): string {
  // PostgREST .or() syntax breaks on commas and parentheses in user input.
  return term.replace(/[,()]/g, " ").trim().slice(0, 60);
}

/* ------------------------------ Public reads ------------------------------ */

export interface BlogListingFilters {
  category?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

export type BlogListingPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  author_name: string;
  published_at: string | null;
  reading_time_minutes: number;
  tags: string[];
  category_id: string | null;
  blog_categories: { name: string | null; slug: string | null } | null;
};

export interface BlogListingResult {
  posts: BlogListingPost[];
  total: number;
}

/** Public: published posts with optional category/search filters and paging. */
export const getBlogListing = createServerFn({ method: "GET" })
  .inputValidator((input: BlogListingFilters = {}) => input)
  .handler(async ({ data }): Promise<BlogListingResult> => {
    const supabase = getPublicSupabase();
    const limit = Math.min(Math.max(data.limit ?? 9, 1), 24);
    const offset = Math.max(data.offset ?? 0, 0);

    let query = supabase
      .from("blog_posts")
      .select(LIST_COLUMNS, { count: "exact" })
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (data.category) query = query.eq("blog_categories.slug", data.category);
    if (data.q) {
      const term = sanitizeSearchTerm(data.q);
      if (term) query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`);
    }

    const { data: posts, error, count } = await query;
    if (error) throw new Error(error.message);
    return { posts: (posts ?? []) as BlogListingPost[], total: count ?? 0 };
  });

export interface BlogPostResult {
  post: (Database["public"]["Tables"]["blog_posts"]["Row"] & {
    blog_categories: { name: string | null; slug: string | null } | null;
  }) | null;
  related: BlogListingPost[];
}

/** Public: one published post by slug plus up to 3 related posts. */
export const getBlogPost = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }): Promise<BlogPostResult> => {
    const supabase = getPublicSupabase();
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("*, blog_categories(name, slug)")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!post) return { post: null, related: [] };

    const typed = post as BlogPostResult["post"];
    let related: BlogListingPost[] = [];
    if (typed?.category_id) {
      const { data: relatedRows } = await supabase
        .from("blog_posts")
        .select(LIST_COLUMNS)
        .eq("status", "published")
        .eq("category_id", typed.category_id)
        .neq("slug", data.slug)
        .order("published_at", { ascending: false, nullsFirst: false })
        .limit(3);
      related = (relatedRows ?? []) as BlogListingPost[];
    }
    return { post: typed, related };
  });

/* ------------------------------ Admin reads ------------------------------- */

export interface BlogDashboardData {
  counts: { all: number; published: number; drafts: number };
  recent: {
    id: string;
    slug: string;
    title: string;
    status: Database["public"]["Enums"]["blog_status"];
    updated_at: string;
    published_at: string | null;
    category_name: string | null;
  }[];
}

/** Admin: dashboard counts and recently updated posts. */
export const getBlogDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BlogDashboardData> => {
    await requireAdmin(context as never);
    const supabase = (context as never as { supabase: Supabase }).supabase;

    const { count: all } = await supabase.from("blog_posts").select("id", { count: "exact", head: true });
    const { count: published } = await supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published");
    const { data: recent } = await supabase
      .from("blog_posts")
      .select("id, slug, title, status, updated_at, published_at, blog_categories(name)")
      .order("updated_at", { ascending: false })
      .limit(8);

    return {
      counts: { all: all ?? 0, published: published ?? 0, drafts: (all ?? 0) - (published ?? 0) },
      recent: (recent ?? []).map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        status: r.status,
        updated_at: r.updated_at,
        published_at: r.published_at,
        category_name: r.blog_categories?.name ?? null,
      })),
    };
  });

/** Admin: one post (any status) by slug for the editor. */
export const getAdminBlogPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const supabase = (context as never as { supabase: Supabase }).supabase;
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("*, blog_categories(name, slug)")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { post: post ?? null };
  });

/* ------------------------------ Admin writes ------------------------------ */

function sanitizeSlug(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (!cleaned) throw new Error("Slug cannot be empty");
  if (cleaned.length > 120) throw new Error("Slug is too long");
  return cleaned;
}

function sanitizeUrl(value: string | null | undefined, label: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (!/^https:\/\//.test(trimmed)) throw new Error(`${label} must be an absolute https:// URL`);
  return trimmed;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/&[a-z#0-9]+;/gi, " ");
}

export interface BlogPostInput {
  id?: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  category_id: string | null;
  tags: string[];
  author_name: string;
  published_at: string | null;
  status: "draft" | "published";
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  secondary_keywords: string[];
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  robots_index: boolean;
}

/** Admin: create or update one post. Publishing sets the publication date. */
export const saveBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: BlogPostInput) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const supabase = (context as never as { supabase: Supabase }).supabase;

    const title = data.title.trim();
    if (!title) throw new Error("Title is required");
    const slug = sanitizeSlug(data.slug);
    const excerpt = data.excerpt?.trim() || null;

    const words = stripHtml(data.content).split(/\s+/).filter(Boolean).length;
    const reading_time_minutes = Math.max(1, Math.round(words / 200) || 1);

    const insert: Database["public"]["Tables"]["blog_posts"]["Insert"] = {
      slug,
      title,
      excerpt,
      content: data.content,
      featured_image_url: sanitizeUrl(data.featured_image_url, "Featured image URL"),
      featured_image_alt: data.featured_image_alt?.trim() || null,
      category_id: data.category_id || null,
      tags: data.tags.map((t) => t.trim()).filter(Boolean).slice(0, 12),
      author_name: data.author_name?.trim() || "Desi Era",
      published_at: data.published_at ?? null,
      reading_time_minutes,
      status: data.status,
      meta_title: data.meta_title?.trim() || null,
      meta_description: data.meta_description?.trim() || null,
      focus_keyword: data.focus_keyword?.trim() || null,
      secondary_keywords: data.secondary_keywords.map((t) => t.trim()).filter(Boolean).slice(0, 10),
      canonical_url: sanitizeUrl(data.canonical_url, "Canonical URL"),
      og_title: data.og_title?.trim() || null,
      og_description: data.og_description?.trim() || null,
      og_image_url: sanitizeUrl(data.og_image_url, "Social image"),
      robots_index: data.robots_index,
    };

    let query = supabase.from("blog_posts")[data.id ? "update" : "insert"](insert);
    if (data.id) query = query.eq("id", data.id);
    const { error } = await query.select("id").single();
    if (error) {
      if (error.code === "23505") throw new Error("Another post already uses this URL slug");
      throw new Error(error.message);
    }
    return { ok: true, slug };
  });

/** Admin: publish or unpublish one post. */
export const setBlogPostStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: "draft" | "published" }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const supabase = (context as never as { supabase: Supabase }).supabase;
    const patch: Database["public"]["Tables"]["blog_posts"]["Update"] = { status: data.status };
    if (data.status === "published") {
      // Keep the original date when re-publishing; stamp only the first publish.
      const { data: row } = await supabase
        .from("blog_posts")
        .select("published_at")
        .eq("id", data.id)
        .single();
      patch["published_at"] = row?.published_at ?? new Date().toISOString();
    }
    const { error } = await supabase.from("blog_posts").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin: delete one post permanently. */
export const deleteBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const supabase = (context as never as { supabase: Supabase }).supabase;
    const { error } = await supabase.from("blog_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ------------------------------- Categories ------------------------------- */

export interface BlogCategoryInput {
  id?: string;
  name: string;
  slug?: string;
  description?: string | null;
  sort_order?: number;
}

/** Admin: create or update a blog category. */
export const saveBlogCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: BlogCategoryInput) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const supabase = (context as never as { supabase: Supabase }).supabase;
    const name = data.name.trim();
    if (!name) throw new Error("Category name is required");
    const insert: Database["public"]["Tables"]["blog_categories"]["Insert"] = {
      name,
      slug: data.slug ? sanitizeSlug(data.slug) : sanitizeSlug(name),
      description: data.description?.trim() || null,
      sort_order: data.sort_order ?? 0,
    };
    let query = supabase.from("blog_categories")[data.id ? "update" : "insert"](insert);
    if (data.id) query = query.eq("id", data.id);
    const { error } = await query.select("id").single();
    if (error) {
      if (error.code === "23505") throw new Error("A category with this URL slug already exists");
      throw new Error(error.message);
    }
    return { ok: true };
  });

/** Admin: delete a category. Posts keep existing but lose the category. */
export const deleteBlogCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    await requireAdmin(context as never);
    const supabase = (context as never as { supabase: Supabase }).supabase;
    const { error } = await supabase.from("blog_categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
