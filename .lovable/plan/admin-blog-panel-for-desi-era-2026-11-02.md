# Admin Blog Panel for Desi Era

A working blog management system built on the existing admin infrastructure (Google sign-in, admin roles, server functions, static deploy to desiera.shop). No changes to existing pages, products, cart, checkout, or the SEO panel.

## 1. Database (Lovable Cloud)

One migration adds:

- `blog_categories` — id, name, slug, description, sort order. Seeded with a few starter categories (Styling, Fabric Guide, Occasions, Trends).
- `blog_posts` — id, slug (unique), title, excerpt, content (rich-text HTML), featured image URL + alt text, category, tags (text list), author name, publication date, reading time (auto-computed), status (`draft` / `published`), timestamps.
- SEO columns on each post: meta title/description, focus + secondary keywords, canonical URL, OG title/description/image, index/noindex.
- Row-level security: anyone can read **published** posts and categories; only admin-role users can read drafts, create, edit, publish, unpublish, or delete. Grants included in the same migration.
- No foreign keys to auth tables; user IDs not needed (author is a display name).

Storage: a `blog-media` bucket for featured/editor images (admin upload, public read). If public buckets are blocked by workspace policy, images fall back to admin-pasted image URLs.

## 2. Admin panel (inside the existing /admin area)

A "Blog" tab joins the existing SEO nav in the admin shell, matching Desi Era's look (ivory/ink/gold, serif headings).

- **Dashboard** (`/admin/blog`): totals for all / published / drafts, recently updated posts, category manager (add, rename, delete), delete confirmations.
- **Editor** (`/admin/blog/edit` for new posts, `/admin/blog/edit?slug=...` to edit): rich-text editor (Tiptap) supporting H1–H3, bold, bullet lists, tables, links, and inline image uploads; featured image upload with alt text; category, tags, author, publication date; Save as Draft / Publish / Unpublish buttons.
- **SEO section** in the editor: all fields from §1, live Google-style and social-card previews (reusing the SEO panel's preview components), and a pre-publish checklist (title/description lengths, slug set, featured image, alt text, keyword) — warnings, not blockers.
- All writes go through authenticated server functions that re-verify the admin role server-side, following the existing `requireAdmin` pattern.

## 3. Public blog

- `/blog` — listing with featured image, title, excerpt, author, date, reading time, category filter chips, search box, and pagination (Load More). Only published posts are queryable.
- `/blog/$slug` — full post with semantic HTML (`<article>`), Article structured data (JSON-LD), headline + image, related posts (same category), and a "Explore the Collection" CTA into the shop.
- Metadata: per-post head tags from the post's own SEO fields (falling back to title/excerpt), canonical, OG/Twitter tags, robots from the index setting. Unknown slugs show the site's 404.
- Drafts and unpublished posts are inaccessible on public routes — enforced by database rules, not just UI.

## 4. Technical notes (static deploy reality)

- On the Lovable-hosted site, blog pages render on the server from the database — published posts appear immediately.
- On desiera.shop (GitHub Pages, static), the build prerenders the blog listing and any posts that exist at build time; posts published later are served by the SPA fallback and render client-side from the database, so visitors still see them. Their sitemap entries are added on the next rebuild.
- The sitemap/robots build step that was still pending for the SEO panel gets finished now: it reads the saved SEO settings and published blog posts at build time and regenerates `sitemap.xml` and `robots.txt` (with a safe fallback to the current static files when the database isn't reachable during a build).
- Tiptap packages installed for the editor; existing SEO helpers (`seo-head` rendering, previews, redirect handling) reused, not duplicated.

## 5. Verification

- Full workflow tested end-to-end: create → save draft → edit → publish (visible on /blog and /blog/slug) → unpublish (disappears publicly) → edit → delete.
- Desktop and mobile checks of both admin pages and both public blog pages, plus typecheck and the prerender build.
- After you sign in with Google once, your account needs the admin role switched on in the backend (same as the SEO panel) — I'll handle that step, then we publish.
