import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useServerFn, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isCurrentUserAdmin } from "@/lib/seo-data.functions";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin/seo", label: "SEO dashboard" },
  { to: "/admin/seo/settings", label: "Sitewide defaults" },
  { to: "/admin/seo/redirects", label: "Redirects" },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const checkAdmin = useServerFn(isCurrentUserAdmin);
  const { data, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => checkAdmin(),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-24 text-center text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }

  if (!data?.admin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Not authorized</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You're signed in as <strong>{data?.userId.slice(0, 8)}…</strong>, but
          this account doesn't have admin access yet. The store owner can grant
          admin from the backend after you sign in once.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" onClick={signOut}>
            Sign out
          </Button>
          <Button asChild>
            <Link to="/">Back to shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="font-display text-2xl">SEO Panel</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <nav className="flex gap-1" aria-label="Admin">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
                activeProps={{ "data-status": "active" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Button variant="outline" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}

export function HealthBadge({ level }: { level: "error" | "warning" | "ok" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        level === "error" && "bg-destructive/10 text-destructive",
        level === "warning" && "bg-accent/20 text-foreground",
        level === "ok" && "bg-primary/10 text-primary",
      )}
    >
      {level === "error" ? "Needs attention" : level === "warning" ? "Review" : "Good"}
    </span>
  );
}
