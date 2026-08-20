import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/account")({
  head: () =>
    pageHead("Account — HOK", "Sign in to your HOK account to track orders and manage addresses."),
  component: AccountPage,
});

function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:py-24">
      <Breadcrumbs items={[{ label: "Account" }]} />
      <h1 className="mt-6 text-4xl md:text-5xl">Your account</h1>
      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
        Accounts and order tracking are not connected yet. Once a backend is added,
        this page will hold sign in, saved addresses and order history. In the
        meantime you can check out as a guest.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link to="/shop">Continue shopping</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/contact">Contact support</Link>
        </Button>
      </div>
    </div>
  );
}
