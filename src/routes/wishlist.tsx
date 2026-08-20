import { createFileRoute, Link } from "@tanstack/react-router";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/seo";
import { products } from "@/data/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => pageHead("Wishlist — HOK", "Your saved HOK pieces, kept in one place."),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist } = useStore();
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />
      <h1 className="mt-6 text-4xl md:text-5xl">Wishlist</h1>
      <p className="mt-4 max-w-xl text-sm text-muted-foreground">
        Pieces you've saved. Add a size to move them into your bag.
      </p>

      {items.length === 0 ? (
        <div className="mt-12 border border-dashed border-border px-6 py-24 text-center">
          <p className="font-display text-2xl">Nothing saved yet</p>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            Tap the heart on any piece to keep it here for later.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/new-arrivals">Shop New Arrivals</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
