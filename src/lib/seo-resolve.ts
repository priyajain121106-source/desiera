/**
 * Pure resolver: saved DB record → tokens → sitewide defaults → hardcoded
 * fallbacks. Also computes the health warnings shown in the admin editor.
 * Client-safe: shared by the storefront server function and the admin UI.
 */
import { registryEntry, type SeoRegistryEntry } from "./seo-registry";

export interface SeoTokenContext {
  productName?: string | undefined;
  collectionName?: string | undefined;
  brand?: string | undefined;
  price?: number | undefined;
}

export interface SeoSiteSettings {
  site_name: string;
  title_suffix: string;
  default_description: string;
  default_og_image_url: string;
  site_url: string;
  robots_preset: string;
}

export interface SeoRecord {
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
  json_ld: unknown;
  slug_override: string | null;
  sitemap_include: boolean;
  updated_at: string | null;
}

export interface SeoHeadData {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogType: string;
  ogImageUrl: string;
  canonicalUrl: string;
  index: boolean;
  follow: boolean;
  jsonLd: string | null;
  /** field → which layer supplied it, for the admin "resolved view". */
  sources: Record<string, string>;
}

function expandTokens(text: string, tokens: SeoTokenContext): string {
  const brand = tokens.brand ?? "Desi Era";
  return text
    .replaceAll("{productName}", tokens.productName ?? "")
    .replaceAll("{collectionName}", tokens.collectionName ?? "")
    .replaceAll("{brand}", brand)
    .replaceAll("{price}", tokens.price != null ? String(tokens.price) : "");
}

function firstFromChain(
  values: (string | null | undefined)[],
): { value: string; source: 0 | 1 | 2 | 3 } | undefined {
  for (let i = 0 as 0 | 1 | 2 | 3; i < values.length; i = (i + 1) as 0 | 1 | 2 | 3) {
    const v = values[i];
    if (v != null && v.trim().length > 0) return { value: v.trim(), source: i };
  }
  return undefined;
}

const LAYER_NAMES = ["Saved setting", "Token template", "Sitewide default", "Hardcoded fallback"] as const;

export function resolveSeo(args: {
  path: string;
  record?: SeoRecord | null;
  site?: SeoSiteSettings | null;
  tokens?: SeoTokenContext;
}): SeoHeadData {
  const { path } = args;
  const record = args.record ?? null;
  const site = args.site ?? null;
  const tokens = args.tokens ?? {};
  const fallback: SeoRegistryEntry =
    registryEntry(path) ?? {
      path,
      type: "content",
      title: "Desi Era — Everyday Indian, Effortlessly Elevated",
      description: "Contemporary kurtis, kurtas, kurta sets and co-ord sets from Desi Era.",
    };

  const sources: Record<string, string> = {};

  // meta_title chain: saved record → (nothing; titles aren't token-templated by default) → registry fallback
  const titleChain = firstFromChain([record?.meta_title, fallback.title]);
  const titleSuffix = site?.title_suffix ?? " — Desi Era";
  let title = titleChain?.value ?? fallback.title;
  if (titleChain) sources["title"] = LAYER_NAMES[titleChain.source];
  // Only apply the suffix when the saved title doesn't already carry it.
  if (record?.meta_title && !title.includes("Desi Era")) title += titleSuffix;

  const descriptionChain = firstFromChain([
    record?.meta_description ? expandTokens(record.meta_description, tokens) : null,
    fallback.description,
  ]);
  const description = descriptionChain?.value ?? fallback.description;
  if (descriptionChain) sources["description"] = LAYER_NAMES[descriptionChain.source];

  const ogTitleChain = firstFromChain([
    record?.og_title ? expandTokens(record.og_title, tokens) : null,
    title,
  ]);
  const ogTitle = ogTitleChain?.value ?? title;
  if (ogTitleChain) sources["ogTitle"] = LAYER_NAMES[ogTitleChain.source];

  const ogDescriptionChain = firstFromChain([
    record?.og_description ? expandTokens(record.og_description, tokens) : null,
    description,
  ]);
  const ogDescription = ogDescriptionChain?.value ?? description;
  if (ogDescriptionChain) sources["ogDescription"] = LAYER_NAMES[ogDescriptionChain.source];

  const ogImageChain = firstFromChain([
    record?.og_image_url,
    site?.default_og_image_url,
    fallback.imageUrl,
    "https://desiera.shop/og-desi-era.jpg",
  ]);
  const ogImageUrl = ogImageChain?.value ?? "https://desiera.shop/og-desi-era.jpg";
  if (ogImageChain) sources["ogImageUrl"] = LAYER_NAMES[ogImageChain.source];

  const canonicalPath = record?.slug_override ? `/product/${record.slug_override}` : path;
  const canonicalChain = firstFromChain([
    record?.canonical_url,
    site?.site_url ? `${site.site_url}${canonicalPath}` : `https://desiera.shop${canonicalPath}`,
  ]);
  const canonicalUrl = canonicalChain?.value ?? `https://desiera.shop${canonicalPath}`;
  if (canonicalChain) sources["canonicalUrl"] = LAYER_NAMES[canonicalChain.source];

  const index = record ? record.robots_index : true;
  const follow = record ? record.robots_follow : true;
  const jsonLd = record?.json_ld ? JSON.stringify(record.json_ld) : null;
  if (jsonLd) sources["jsonLd"] = LAYER_NAMES[0];

  return {
    title,
    description,
    ogTitle,
    ogDescription,
    ogType: fallback.type === "product" ? "product" : "website",
    ogImageUrl,
    canonicalUrl,
    index,
    follow,
    jsonLd,
    sources,
  };
}

export interface SeoWarning {
  level: "error" | "warning" | "info";
  message: string;
}

export function analyzeSeo(input: {
  title: string;
  description: string;
  ogImageUrl: string;
  canonicalUrl: string;
  focusKeyword?: string | null;
  index: boolean;
  follow: boolean;
  sitemapInclude: boolean;
  jsonLd?: string | null;
}): SeoWarning[] {
  const warnings: SeoWarning[] = [];
  const { title, description } = input;

  if (title.trim().length < 15) {
    warnings.push({ level: "error", message: "Title is too short to rank (aim 30–60 characters)." });
  } else if (title.trim().length > 60) {
    warnings.push({ level: "warning", message: `Title is ${title.trim().length} characters — it will be truncated in Google (aim ≤60).` });
  }

  if (description.trim().length < 70) {
    warnings.push({ level: "warning", message: `Description is ${description.trim().length} characters — aim 70–160.` });
  } else if (description.trim().length > 160) {
    warnings.push({ level: "warning", message: `Description is ${description.trim().length} characters — it will be truncated (aim ≤160).` });
  }

  if (input.focusKeyword) {
    const kw = input.focusKeyword.trim().toLowerCase();
    if (kw && !title.toLowerCase().includes(kw) && !description.toLowerCase().includes(kw)) {
      warnings.push({ level: "warning", message: `Focus keyword "${input.focusKeyword.trim()}" appears in neither the title nor the description.` });
    }
  }

  if (!/^https:\/\//.test(input.ogImageUrl)) {
    warnings.push({ level: "error", message: "Social image must be an absolute https:// URL." });
  }
  if (!/^https:\/\//.test(input.canonicalUrl)) {
    warnings.push({ level: "error", message: "Canonical URL must be an absolute https:// URL." });
  }
  if (/desiera\.lovable\.app/.test(input.canonicalUrl)) {
    warnings.push({ level: "error", message: "Canonical points at the preview domain instead of desiera.shop." });
  }

  if (input.index === false && input.sitemapInclude) {
    warnings.push({ level: "error", message: "Page is set to noindex but still marked for the sitemap — turn off the sitemap flag." });
  }
  if (input.index === false) {
    warnings.push({ level: "info", message: "Page is noindex: Google will not show it in results." });
  }

  if (input.jsonLd) {
    try {
      const parsed = JSON.parse(input.jsonLd) as unknown;
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        warnings.push({ level: "error", message: "JSON-LD must be a single JSON object." });
      } else if (!("@context" in parsed) || !String((parsed as Record<string, unknown>)["@context"]).includes("schema.org")) {
        warnings.push({ level: "warning", message: 'JSON-LD is missing "@context": "https://schema.org".' });
      }
    } catch {
      warnings.push({ level: "error", message: "JSON-LD is not valid JSON." });
    }
  }

  return warnings;
}
