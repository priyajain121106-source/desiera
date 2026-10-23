import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { seoRegistry } from "@/lib/seo-registry";
import { analyzeSeo, resolveSeo, type SeoRecord } from "@/lib/seo-resolve";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HealthBadge } from "./admin";

export const Route = createFileRoute("/_authenticated/admin/seo")({
  component: SeoDashboard,
});

const TYPE_LABEL: Record<string, string> = {
  home: "Home",
  collection: "Collection",
  product: "Product",
  content: "Content",
  utility: "Utility",
};

interface DashboardRow {
  path: string;
  type: string;
  title: string;
  titleLength: number;
  descriptionLength: number;
  canonical: string;
  index: boolean;
  sitemap: boolean;
  updated: string | null;
  health: "error" | "warning" | "ok";
  warnings: number;
  hasOverride: boolean;
}

function SeoDashboard() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [nonIndexOnly, setNonIndexOnly] = useState(false);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["seo-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("seo_settings").select("*");
      return (data ?? []) as SeoRecord[];
    },
  });

  const dashboardRows = useMemo<DashboardRow[]>(() => {
    const byPath = new Map((rows ?? []).map((r) => [r.page_path, r]));
    return seoRegistry.map((entry) => {
      const record = byPath.get(entry.path) ?? null;
      const resolved = resolveSeo({ path: entry.path, record });
      const warnings = analyzeSeo({
        title: resolved.title,
        description: resolved.description,
        ogImageUrl: resolved.ogImageUrl,
        canonicalUrl: resolved.canonicalUrl,
        focusKeyword: record?.focus_keyword ?? null,
        index: resolved.index,
        follow: resolved.follow,
        sitemapInclude: record ? record.sitemap_include : entry.type !== "utility",
        jsonLd: resolved.jsonLd,
      });
      const health: DashboardRow["health"] = warnings.some((w) => w.level === "error")
        ? "error"
        : warnings.some((w) => w.level === "warning")
          ? "warning"
          : "ok";
      return {
        path: entry.path,
        type: entry.type,
        title: resolved.title,
        titleLength: resolved.title.length,
        descriptionLength: resolved.description.length,
        canonical: resolved.canonicalUrl,
        index: resolved.index,
        sitemap: record ? record.sitemap_include : entry.type !== "utility",
        updated: record?.updated_at ?? null,
        health,
        warnings: warnings.filter((w) => w.level !== "info").length,
        hasOverride: !!record,
      };
    });
  }, [rows]);

  const filtered = dashboardRows.filter((row) => {
    if (search && !row.path.toLowerCase().includes(search.toLowerCase()) && !row.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && row.type !== typeFilter) return false;
    if (issuesOnly && row.health === "ok") return false;
    if (nonIndexOnly && row.index) return false;
    return true;
  });

  const counts = useMemo(() => {
    const errors = dashboardRows.filter((r) => r.health === "error").length;
    const warns = dashboardRows.filter((r) => r.health === "warning").length;
    return { errors, warns, total: dashboardRows.length };
  }, [dashboardRows]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {counts.total} pages ·{" "}
          <span className="text-destructive">{counts.errors} need attention</span> ·{" "}
          <span>{counts.warns} to review</span>
        </p>
        <Button2 to="/admin/seo/settings" label="Edit sitewide defaults" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by path or title…"
          className="w-64"
          aria-label="Search pages"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44" aria-label="Filter by page type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.entries(TYPE_LABEL).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={issuesOnly}
            onChange={(e) => setIssuesOnly(e.target.checked)}
            className="size-4 accent-[var(--primary)]"
          />
          Only pages with warnings
        </label>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={nonIndexOnly}
            onChange={(e) => setNonIndexOnly(e.target.checked)}
            className="size-4 accent-[var(--primary)]"
          />
          Only noindex pages
        </label>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Title (len)</TableHead>
              <TableHead>Desc (len)</TableHead>
              <TableHead>Index</TableHead>
              <TableHead>Sitemap</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Health</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  Loading pages…
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  No pages match these filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow key={row.path}>
                  <TableCell className="font-medium">
                    <span className="block">{row.path}</span>
                    {row.hasOverride ? (
                      <span className="text-[11px] text-accent">saved setting</span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">fallback copy</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{TYPE_LABEL[row.type] ?? row.type}</TableCell>
                  <TableCell className="text-xs">
                    {row.titleLength} chars
                    <span className="block max-w-52 truncate text-muted-foreground">{row.title}</span>
                  </TableCell>
                  <TableCell className="text-xs">{row.descriptionLength} chars</TableCell>
                  <TableCell className="text-xs">{row.index ? "index" : "noindex"}</TableCell>
                  <TableCell className="text-xs">{row.sitemap ? "in sitemap" : "excluded"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.updated ? new Date(row.updated).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    <HealthBadge level={row.health} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to="/admin/seo/edit"
                      search={{ path: row.path }}
                      className="text-xs uppercase tracking-[0.12em] text-accent underline underline-offset-4"
                    >
                      Edit SEO
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Button2({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center bg-primary px-4 py-2 text-xs uppercase tracking-[0.14em] text-primary-foreground transition-opacity hover:opacity-90"
    >
      {label}
    </Link>
  );
}
