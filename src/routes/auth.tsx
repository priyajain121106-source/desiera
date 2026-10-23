import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Desi Era" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin/seo", replace: true });
    });
  }, [navigate]);

  async function signInWithGoogle() {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth`,
    });
    if (result.error) {
      setError("Google sign-in didn't go through. Please try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return; // the browser is navigating to Google
    // Tokens came back and the session is already set.
    navigate({ to: "/admin/seo", replace: true });
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center">
          <Logo size="md" />
        </div>
        <h1 className="mt-8 font-display text-3xl">Owner sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in with the Desi Era Google account to manage the store's SEO
          settings. Only accounts given admin access can make changes.
        </p>
        <Button
          className="mt-8 w-full"
          size="lg"
          disabled={busy}
          onClick={signInWithGoogle}
        >
          {busy ? "Opening Google…" : "Continue with Google"}
        </Button>
        {error ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          After your first sign in, admin access is granted to your account from
          the backend — then this page leads straight to the SEO panel.
        </p>
      </div>
    </div>
  );
}
