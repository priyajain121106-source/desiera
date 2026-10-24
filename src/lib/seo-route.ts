/**
 * Route wiring helper: gives every storefront page the same loader + head
 * plumbing. The loader resolves metadata from the backend (or falls back to
 * the hardcoded registry when the backend is unreachable); head renders it.
 */
import { getSeoForPath } from "./seo-data.functions";
import { resolveSeo, type SeoHeadData } from "./seo-resolve";

function headFrom(data: SeoHeadData) {
  const meta: Record<string, string>[] = [
    { title: data.title },
    { name: "description", content: data.description },
    { property: "og:title", content: data.ogTitle },
    { property: "og:description", content: data.ogDescription },
    { property: "og:type", content: data.ogType },
    { property: "og:url", content: data.canonicalUrl },
  ];
  // Social crawlers need an absolute URL; hosting injects a preview otherwise.
  if (data.ogImageUrl.startsWith("https://")) {
    meta.push({ property: "og:image", content: data.ogImageUrl });
    meta.push({ name: "twitter:image", content: data.ogImageUrl });
  }
  meta.push({ name: "twitter:card", content: "summary_large_image" });
  if (!data.index || !data.follow) {
    meta.push({
      name: "robots",
      content: `${data.index ? "index" : "noindex"}, ${data.follow ? "follow" : "nofollow"}`,
    });
  }
  return {
    meta,
    links: [{ rel: "canonical", href: data.canonicalUrl }],
    scripts: data.jsonLd ? [{ type: "application/ld+json", children: data.jsonLd }] : [],
  };
}

/** Render one resolved metadata object as a route `head()` result. */
export function seoHead(data: SeoHeadData) {
  return headFrom(data);
}

/** The `loader` + `head` pair for a storefront page at `path`. */
export function seoRoute(path: string) {
  return {
    loader: async () => {
      try {
        return await getSeoForPath({ data: { path } });
      } catch {
        // Static prerender (GitHub Pages build) can't call server functions —
        // fall back to the hardcoded registry so the page still prerenders.
        return resolveSeo({
          path,
          record: null,
          site: null,
          tokens: {},
        });
      }
    },
    head: ({ loaderData }: { loaderData?: SeoHeadData }) => {
      const data =
        loaderData ??
        resolveSeo({
          path,
          record: null,
          site: null,
          tokens: {},
        });
      return headFrom(data);
    },
  };
}

export type { SeoHeadData };
