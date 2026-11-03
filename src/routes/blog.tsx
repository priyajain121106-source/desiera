import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getBlogListing, type BlogListingPost } from "@/lib/blog.functions";
import { fetchBlogCategories, fetchBlogListing, type BlogCategory } from "@/lib/blog-client";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Desi Era" },
      { name: "description", content: "Styling guides, fabric notes and occasion looks from Desi Era — everyday Indian wear, effortlessly elevated." },
      { property: "og:title", content: "Blog — Desi Era" },
      { property: "og:description", content: "Styling guides, fabric notes and occasion looks from Desi Era." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://desiera.shop/blog" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://desiera.shop/blog" }],
  }),
  component: BlogListing,
});

const PAGE_SIZE = 9;

function formatDate(value: string | null): string {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function PostCard({ post }: { post: BlogListingPost }) {
  const category = post.blog_categories?.name ?? null;
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border bg-background transition-shadow hover:shadow-md">
      <Link to="/blog/$slug" params={{ slug: post.slug }} className="block overflow-hidden">
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={post.featured_image_alt ?? post.title}
            loading="lazy"
            className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-muted/30 font-display text-3xl text-muted-foreground">
            DE
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {category ? <p className="eyebrow">{category}</p> : null}
        <h2 className="mt-1 font-display text-xl leading-snug">
          <Link to="/blog/$slug" params={{ slug: post.slug }} className="transition-colors hover:text-accent">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p> : null}
        <div className="mt-auto pt-4 text-xs text-muted-foreground">
          {post.author_name} · {formatDate(post.published_at)} · {post.reading_time_minutes} min read
        </div>
      </div>
    </article>
  );
}

function BlogListing() {
  const [category, setCategory] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const filters = { category: category ?? undefined, q: q ?? undefined, limit: PAGE_SIZE, offset };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["blog-listing", category, q, offset],
    queryFn: async () => {
      // SSR/prerender read the listing through the server function; on the
      // statically hosted site the browser falls back to a direct read.
      try {
        return await getBlogListing({ data: filters });
      } catch {
        return await fetchBlogListing(filters);
      }
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: fetchBlogCategories,
  });

  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;
  const hasMore = posts.length < total;

  function applyFilters(next: { category: string | null; q: string | null }) {
    setCategory(next.category);
    setQ(next.q);
    setOffset(0);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <header className="text-center">
        <p className="eyebrow">The Desi Era Journal</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Blog</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Styling guides, fabric notes and occasion looks — everything you need to wear Indian everyday, effortlessly.
        </p>
      </header>

      {/* Filters */}
      <div className="mt-10 flex flex-col items-center gap-4">
        <form
          className="flex w-full max-w-md gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters({ category, q: searchInput.trim() || null });
          }}
        >
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search the journal…"
            aria-label="Search blog posts"
            className="w-full rounded-full border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2 text-xs uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
          >
            Search
          </button>
        </form>
        <nav className="flex flex-wrap justify-center gap-2" aria-label="Blog categories">
          <button
            type="button"
            onClick={() => applyFilters({ category: null, q })}
            className={
              "rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors " +
              (!category ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")
            }
          >
            All
          </button>
          {(categories ?? []).map((cat: BlogCategory) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => applyFilters({ category: cat.slug, q })}
              className={
                "rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors " +
                (category === cat.slug ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")
              }
            >
              {cat.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Posts */}
      <div className="mt-10">
        {isLoading && posts.length === 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-muted/40" />
            ))}
          </div>
        ) : isError && posts.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            The journal is unavailable right now.{" "}
            <button type="button" className="underline" onClick={() => void refetch()}>
              Try again
            </button>
          </p>
        ) : posts.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No posts match this filter yet — check back soon.
          </p>
        ) : (
          <>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            {hasMore ? (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                  disabled={isLoading}
                  className="rounded-full border px-8 py-3 text-xs uppercase tracking-[0.14em] transition-colors hover:bg-muted disabled:opacity-50"
                >
                  {isLoading ? "Loading…" : "Load more"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* CTA */}
      <section className="mt-16 rounded-lg border bg-muted/20 px-6 py-10 text-center">
        <p className="eyebrow">Ready to wear it?</p>
        <h2 className="mt-2 font-display text-3xl">Everyday Indian, Effortlessly Elevated</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          The kurtis, kurtas and co-ord sets you just read about — in the collection.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center justify-center bg-primary px-8 py-3 text-xs uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          Explore the collection
        </Link>
      </section>
    </div>
  );
}
