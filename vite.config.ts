// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const staticPaths = [
  "/",
  "/new-arrivals",
  "/shop",
  "/kurtis",
  "/kurtas",
  "/kurta-sets",
  "/co-ord-sets",
  "/sale",
  "/search",
  "/wishlist",
  "/cart",
  "/checkout",
  "/account",
  "/about",
  "/size-guide",
  "/shipping",
  "/returns",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
];

const productSlugs = [
  "sahar-block-print-kurti",
  "gulab-everyday-kurti",
  "dhoop-printed-kurti",
  "aira-rose-kurti",
  "sufi-ivory-chikan-kurta",
  "mitti-rust-kurta",
  "mira-sand-kurta",
  "noor-sage-kurta",
  "neel-midnight-kurta",
  "saanjh-olive-kurta",
  "raat-kurta-set",
  "amber-kurta-set",
  "meher-kurta-set",
  "roz-ivory-coord-set",
  "vann-tailored-coord-set",
  "reth-linen-coord-set",
];

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    pages: [
      ...staticPaths.map((path) => ({ path })),
      ...productSlugs.map((slug) => ({ path: `/product/${slug}` })),
    ],
    prerender: { enabled: true, autoStaticPathsDiscovery: false },
  },
});
