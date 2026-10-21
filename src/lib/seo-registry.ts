/**
 * The single source of truth for every shareable page on the site.
 * The Admin SEO Panel edits rows in the `seo_settings` table; these
 * hardcoded values are the fallback used when a page has no row yet
 * (or when the backend is briefly unreachable).
 */
import { products } from "@/data/products";

export type SeoPageType = "home" | "collection" | "product" | "content" | "utility";

export interface SeoRegistryEntry {
  path: string;
  type: SeoPageType;
  title: string;
  description: string;
  /** Extra context available as tokens ({productName} etc.) in saved overrides. */
  productName?: string;
  collectionName?: string;
  price?: number;
  imageUrl?: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  kurtis: "Kurtis",
  kurtas: "Kurtas",
  "kurta-sets": "Kurta Sets",
  "co-ord-sets": "Co-ord Sets",
};

const STATIC_ENTRIES: SeoRegistryEntry[] = [
  {
    path: "/",
    type: "home",
    title: "Desi Era — Everyday Indian, Effortlessly Elevated",
    description:
      "Contemporary kurtis, kurtas, kurta sets and co-ord sets from Desi Era. Free shipping across India with Cash on Delivery available.",
  },
  {
    path: "/shop",
    type: "collection",
    title: "Shop All — Desi Era",
    description: "Browse the full Desi Era collection of kurtis, kurtas, kurta sets and co-ord sets.",
  },
  {
    path: "/new-arrivals",
    type: "collection",
    title: "New Arrivals — Desi Era",
    description:
      "The newest kurtis, kurtas and sets from Desi Era. Fresh silhouettes for everyday Indian dressing.",
  },
  {
    path: "/kurtis",
    type: "collection",
    title: "Women's Kurtis — Desi Era",
    description:
      "Shop women's Kurtis at Desi Era for everyday wear. Free shipping across India, Cash on Delivery available.",
  },
  {
    path: "/kurtas",
    type: "collection",
    title: "Women's Kurtas — Desi Era",
    description:
      "Shop women's Kurtas at Desi Era for everyday wear. Free shipping across India, Cash on Delivery available.",
  },
  {
    path: "/kurta-sets",
    type: "collection",
    title: "Women's Kurta Sets — Desi Era",
    description:
      "Shop women's Kurta Sets at Desi Era for everyday wear. Free shipping across India, Cash on Delivery available.",
  },
  {
    path: "/co-ord-sets",
    type: "collection",
    title: "Women's Co-ord Sets — Desi Era",
    description:
      "Shop women's Co-ord Sets at Desi Era for everyday wear. Free shipping across India, Cash on Delivery available.",
  },
  {
    path: "/sale",
    type: "collection",
    title: "Sale — Desi Era",
    description: "Reduced kurtis, kurtas and sets from Desi Era. Limited pieces, limited sizes.",
  },
  {
    path: "/about",
    type: "content",
    title: "About Desi Era — Desi Era",
    description:
      "Desi Era is a contemporary Indian ethnicwear label making kurtis, kurtas and sets designed for everyday wear.",
  },
  {
    path: "/contact",
    type: "content",
    title: "Contact Us — Desi Era",
    description:
      "Questions about fit, fabric, an order or an exchange? Get in touch with the Desi Era team.",
  },
  {
    path: "/size-guide",
    type: "content",
    title: "Size Guide — Desi Era",
    description:
      "Body measurements and fit guidance for Desi Era kurtis, kurtas, kurta sets and co-ord sets.",
  },
  {
    path: "/shipping",
    type: "content",
    title: "Shipping & Delivery — Desi Era",
    description:
      "Shipping timelines, Cash on Delivery availability and order tracking for Desi Era orders across India.",
  },
  {
    path: "/returns",
    type: "content",
    title: "Returns & Exchange — Desi Era",
    description: "How to request a return or size exchange on Desi Era kurtis, kurtas and sets.",
  },
  {
    path: "/faq",
    type: "content",
    title: "FAQ — Desi Era",
    description:
      "Answers on sizing, fabrics, shipping, Cash on Delivery, exchanges and order tracking at Desi Era.",
  },
  {
    path: "/privacy",
    type: "content",
    title: "Privacy Policy — Desi Era",
    description: "How Desi Era collects, uses and protects your personal information.",
  },
  {
    path: "/terms",
    type: "content",
    title: "Terms & Conditions — Desi Era",
    description:
      "The terms that govern your use of the Desi Era website and any order you place with us.",
  },
  // Utility pages: kept out of the sitemap and not worth optimizing.
  {
    path: "/search",
    type: "utility",
    title: "Search — Desi Era",
    description: "Search the Desi Era collection of kurtis, kurtas, kurta sets and co-ord sets.",
  },
  {
    path: "/cart",
    type: "utility",
    title: "Shopping Bag — Desi Era",
    description:
      "Review the kurtis, kurtas and sets in your Desi Era shopping bag before checkout.",
  },
  {
    path: "/checkout",
    type: "utility",
    title: "Checkout — Desi Era",
    description:
      "Complete your Desi Era order with free shipping across India and Cash on Delivery on eligible pincodes.",
  },
  {
    path: "/account",
    type: "utility",
    title: "Account — Desi Era",
    description:
      "Sign in to your Desi Era account to track orders and manage addresses.",
  },
  {
    path: "/wishlist",
    type: "utility",
    title: "Wishlist — Desi Era",
    description: "Your saved Desi Era pieces, kept in one place.",
  },
];

const PRODUCT_ENTRIES: SeoRegistryEntry[] = products.map((p) => ({
  path: `/product/${p.slug}`,
  type: "product" as const,
  title: `${p.name} — Desi Era`,
  description: p.description.slice(0, 155),
  productName: p.name,
  collectionName: CATEGORY_LABEL[p.category] ?? p.category,
  price: p.price,
  imageUrl: p.images[0],
}));

export const seoRegistry: SeoRegistryEntry[] = [...STATIC_ENTRIES, ...PRODUCT_ENTRIES];

export function registryEntry(path: string): SeoRegistryEntry | undefined {
  return seoRegistry.find((entry) => entry.path === path);
}

/** Product paths only exist for current catalog slugs. */
export function isKnownPath(path: string): boolean {
  return registryEntry(path) !== undefined;
}
