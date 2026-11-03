import { Link, createFileRoute, isNotFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getBlogPost, type BlogPostResult } from "@/lib/blog.functions";
import { fetchBlogPost } from "@/lib/blog-client";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    let result: BlogPostResult | null = null;
    try {
      result = await getBlogPost({ data: { slug: params.slug } });
    } catch {
      // Static host: the server RPC is unavailable — the component falls back
      // to a direct browser read while the head falls back to generic tags.
      return { post: null, related: [], unavailable: true };
    }
    if (!result.post) {
      // notFound() must escape the try/catch above — throw it out here.
      throw notFoundError();
    }
    return { ...result, unavailable: false };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) {
      return {
        meta: [
          { title: "Blog — Desi Era" },
          { name: "robots", content: "noindex, nofollow" },
        ],
      };
    }
    const title = post.meta_title?.trim() || `${post.title} — Desi Era`;
    const description = post.meta_description?.trim() || post.excerpt?.trim() || title;
    const image = post.og_image_url?.trim() || post.featured_image_url?.trim();
    const canonical = post.canonical_url?.trim() || `https://desiera.shop/blog/${post.slug}`;
    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.og_title?.trim() || title,
      description,
      datePublished: post.published_at ?? post.created_at,
      dateModified: post.updated_at,
      author: { "@type": "Organization", name: post.author_name },
      publisher: { "@type": "Organization", name: "Desi Era", url: "https://desiera.shop" },
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    };
    if (image) jsonLd["image"] = [image];
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: post.og_title?.trim() || title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
        ...(post.robots_index ? [] : [{ name: "robots", content: "noindex, nofollow" }]),
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
    };
  },
  component: BlogPostPage,
});

function notFoundError(): never {
  throw { isNotFound: true };
}

function BlogPostPage() {
  const data = Route.useLoaderData() as
    | (BlogPostResult & { unavailable: boolean })
    | undefined;

  // Fallback for the statically hosted site, where the server RPC failed in
  // the loader: read the post directly from the browser client.
  const fallback = useQuery({
    queryKey: ["blog-post-fallback", Route.useParams().slug],
    queryFn: () => fetchBlogPost(Route.useParams().slug),
    enabled: !!data?.unavailable,
  });

  const post = data?.post ?? fallback.data?.post ?? null;
  const related = data?.related ?? fallback.data?.related ?? [];

  if (!post) {
    if (data?.unavailable && fallback.isLoading) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-24">
          <div className="aspect-[16/9] animate-pulse rounded-lg bg-muted/40" />
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-2 font-display text-3xl">This story has moved on</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The post you're looking for doesn't exist or is no longer published.
        </p>
        <Link
          to="/blog"
          className="mt-6 inline-flex items-center justify-center bg-primary px-6 py-3 text-xs uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          Back to the journal
        </Link>
      </div>
    );
  }

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/blog" className="hover:text-accent">
          Blog
        </Link>
        {post.blog_categories?.name ? (
          <>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-accent">
              {post.blog_categories.name}
            </Link>
          </>
        ) : null}
      </nav>

      {post.blog_categories?.name ? <p className="eyebrow mt-6">{post.blog_categories.name}</p> : null}
      <h1 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">{post.title}</h1>
      <p className="mt-3 text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {post.author_name}
        {date ? ` · ${date}` : ""} · {post.reading_time_minutes} min read
      </p>

      {post.featured_image_url ? (
        <img
          src={post.featured_image_url}
          alt={post.featured_image_alt ?? post.title}
          className="mt-8 w-full rounded-lg object-cover"
        />
      ) : null}

      {post.excerpt ? (
        <p className="mt-8 border-l-2 border-accent pl-4 font-display text-lg text-muted-foreground">
          {post.excerpt}
        </p>
      ) : null}

      <div
        className="blog-content mt-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {post.tags.length > 0 ? (
        <div className="mt-10 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-14 border-t pt-10">
          <h2 className="font-display text-2xl">Keep reading</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {related.map((rel) => (
              <Link
                key={rel.id}
                to="/blog/$slug"
                params={{ slug: rel.slug }}
                className="group block overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
              >
                {rel.featured_image_url ? (
                  <img src={rel.featured_image_url} alt={rel.featured_image_alt ?? rel.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                ) : null}
                <div className="p-4">
                  <p className="font-display text-base leading-snug">{rel.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{rel.reading_time_minutes} min read</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-14 rounded-lg border bg-muted/20 px-6 py-10 text-center">
        <p className="eyebrow">Ready to wear it?</p>
        <h2 className="mt-2 font-display text-3xl">Everyday Indian, Effortlessly Elevated</h2>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center justify-center bg-primary px-8 py-3 text-xs uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
        >
          Explore the collection
        </Link>
      </section>
    </article>
  );
}

// Guard: the thrown object above must behave like a TanStack notFound.
function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { isNotFound?: boolean }).isNotFound === true
  );
}

// Re-export so the router recognises thrown notFound payloads on this route.
export { isNotFound, isNotFoundError };
