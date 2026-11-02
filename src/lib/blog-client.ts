/**
 * Client-side blog reads through the browser Supabase client.
 *
 * Used as a fallback on the statically hosted site (desiera.shop), where
 * server-function RPCs are unavailable: the browser queries the database
 * directly under the anon read policies. Public pages first try the server
 * function (SSR/prerender) and fall back to these helpers.
 */
import { supabase } from "@/integrations/supabase/client";
import type { BlogListingFilters, BlogListingPost, BlogListingResult, BlogPostResult } from "./blog.functions";

const LIST_COLUMNS =
  "id, slug, title, excerpt, featured_image_url, featured_image_alt, author_name, published_at, reading_time_minutes, tags, category_id, blog_categories(name, slug)";

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

/** Categories are fully public; read them straight from the browser client. */
export async function fetchBlogCategories(): Promise<BlogCategory[]> {
  const { data, error } = await supabase
    .from("blog_categories")
    .select("id, name, slug, description, sort_order")
    .order("sort_order")
    .order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as BlogCategory[];
}

export async function fetchBlogListing(filters: BlogListingFilters): Promise<BlogListingResult> {
  const limit = Math.min(Math.max(filters.limit ?? 9, 1), 24);
  const offset = Math.max(filters.offset ?? 0, 0);

  let query = supabase
    .from("blog_posts")
    .select(LIST_COLUMNS, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (filters.category) query = query.eq("blog_categories.slug", filters.category);
  if (filters.q) {
    const term = filters.q.replace(/[,()]/g, " ").trim().slice(0, 60);
    if (term) query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`);
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);
  return { posts: (data ?? []) as BlogListingPost[], total: count ?? 0 };
}

export async function fetchBlogPost(slug: string): Promise<BlogPostResult> {
  const { data: post, error } = await supabase
    .from("blog_posts")
    .select("*, blog_categories(name, slug)")
    .eq("slug", slug)
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
      .neq("slug", slug)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(3);
    related = (relatedRows ?? []) as BlogListingPost[];
  }
  return { post: typed, related };
}
