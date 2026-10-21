# Admin SEO Panel for Desi Era

## Goal

Add a protected `/admin/seo` panel to the existing storefront where you (the owner) can view and edit the SEO metadata of every page — titles, descriptions, canonical URLs, index/noindex, social cards, JSON-LD, sitemap inclusion, and sitewide defaults — without touching the storefront's design, catalog, cart, or checkout.

## Integration approach (agreed with you)

- Enable **Lovable Cloud** for secure storage and login (the site currently has no backend).
- Sign in with **Google**; signup stays closed — only your account gets admin rights.
- desiera.shop stays a static site: panel edits are stored in the database and **bake into desiera.shop at the next publish**; the Lovable-hosted URL reflects edits immediately.
- Product **slugs stay editable**, with an automatic redirect from the old address so existing links never break.

## Steps

### 1. Backend and access
- Enable Lovable Cloud (database + auth) and configure Google sign-in.
- Create the owner login: you sign in once with Google, then your account is granted the `admin` role. Regular visitors can never see or open the panel.
- Roles live in a dedicated `user_roles` table with a security-definer `has_role()` check (never on a profile column, per security best practice).

### 2. Database schema (one migration)
- `seo_settings` — one row per page: page path, page type (home / collection / product / policy / other), SEO title, meta description, OG title/description, social image URL, canonical URL, robots (index/noindex, follow/nofollow), focus keyword, structured-data JSON-LD, sitemap include toggle, slug override, timestamps and updated-by.
- `seo_site_settings` — single row: brand/site name, default title suffix, default description, default social image, preferred site URL, and the robots.txt preset.
- `seo_redirects` — old slug → new slug pairs created automatically when you change a slug.
- Row-level security: **read** allowed to everyone (SEO metadata is public by nature — it's what appears in search results), **write** only for admins via `has_role()`, plus full service-role access. Explicit GRANTs in the same migration.

### 3. Storefront metadata integration
- New resolver (`src/lib/seo*`): for each page it merges, in order — the page's saved record → templates/tokens (`{productName}`, `{collectionName}`, `{brand}`, `{price}`) → sitewide defaults → the current hardcoded fallbacks. It reports which layer supplied each field so the panel can show exactly what is inherited.
- Every storefront route's `head()` switches to resolved metadata, keeping today's copy as the fallback. If the database is unreachable at build time, every page still renders its current metadata — no page ever loses its tags.
- Product pages: templates like `{productName} — Desi Era` resolve per product; canonical URLs follow the slug rules below.
- No changes to catalog, cart, checkout, wishlist, or layout behavior.

### 4. Sitemap and robots.txt
- The build step regenerates `sitemap.xml` and `robots.txt` from the route list plus the panel's include/exclude and robots settings. When the build runs without database access (e.g. plain GitHub Actions), it keeps the current committed files — the site is never left without a sitemap.
- Robots.txt only through guarded presets (normal / maintenance) with a strong warning on anything that could block crawlers; no raw free-text control.

### 5. Admin area and panel UI
- `/admin/seo` under the auth-protected route group; unauthenticated visitors are redirected to a sign-in page. A minimal admin sidebar (Dashboard, Page SEO, Site Defaults, Redirects) with a discreet admin link visible only to you.
- **Dashboard:** searchable table of all pages — home, collections, all 16+ products, policies, static pages — with path, type, health indicator, title/description lengths, canonical, index state, last updated. Filters for page type, incomplete metadata, warnings, and indexability. "Edit SEO" per row.
- **Editor:** all fields from the brief, with live character counters and recommended ranges, inline warnings (missing/short/long title or description, duplicates, invalid canonical, noindex pages, missing social image, malformed JSON-LD), a Google-style desktop result preview, a social-card preview, and a "resolved metadata" view showing fallbacks/tokens applied.
- **Save bar:** dirty-state indicator, save/cancel, success toast, inline server errors.
- Matches the Desi Era look (emerald/gold, Cormorant + Jost), responsive and keyboard-friendly.

### 6. Slug editing with redirects
- Changing a product slug updates its canonical URL and auto-creates a redirect from the old address. The redirect is honored on the Lovable-hosted site server-side and via the static site's 404 fallback client-side, so old links keep working. The editor warns before saving any change that could affect a live URL.

### 7. Security and quality
- All writes go through authenticated server functions that re-verify the admin role server-side — the UI hiding alone is never the guard.
- Canonical URLs and JSON-LD are validated server-side and client-side; JSON-LD is parsed and shape-checked so nothing malformed or script-bearing can be stored or injected.
- Automated checks: resolver fallback behavior, admin-only write rules (non-admin writes rejected), redirect creation on slug change, metadata rendering on a real page.
- Playwright walkthrough: sign-in, unauthorized access blocked, dashboard loads, edit → save → verify the storefront head output, mobile layout.

### 8. How you get access
1. I enable Cloud and Google sign-in, then tell you to open the site and sign in once with your Google account.
2. You confirm; I grant that account the admin role and you get the panel at `/admin/seo`.
3. Panel edits go live on the Lovable-hosted URL immediately and on desiera.shop at your next publish.

## Technical notes

- New files: `src/routes/_authenticated/admin/seo*.tsx` (dashboard, editor, site settings, redirects), `src/lib/seo-resolver.ts` + server functions, `scripts/generate-seo-files.mjs`; edits to each route's `head()` wiring and the build script.
- The admin area is client-rendered (like the rest of the auth flow); the static GitHub Pages build excludes nothing but simply never prerenders admin pages.
- Google sign-in is brokered through the platform's OAuth helper; no external accounts needed.
