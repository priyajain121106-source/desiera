import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";
import { formatINR } from "@/data/products";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/cart")({
  head: () =>
    pageHead(
      "Shopping Bag — HOK",
      "Review the kurtis, kurtas and sets in your HOK shopping bag before checkout.",
    ),
  component: CartPage,
});

function CartPage() {
  const {
    activeLines,
    savedLines,
    subtotal,
    updateQty,
    removeLine,
    toggleSaveForLater,
  } = useStore();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <Breadcrumbs items={[{ label: "Shopping Bag" }]} />
      <h1 className="mt-4 text-4xl md:text-5xl">Shopping Bag</h1>

      {activeLines.length === 0 ? (
        <div className="mt-12 border border-border bg-secondary px-6 py-20 text-center">
          <ShoppingBag className="mx-auto size-8 text-accent" strokeWidth={1.2} />
          <h2 className="mt-5 text-2xl">Your bag is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Explore new arrivals and find a piece you'll reach for every week.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/new-arrivals">Shop New Arrivals</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/shop">Browse All</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
          <div>
            <ul className="divide-y divide-border border-y border-border">
              {activeLines.map((l) => (
                <li key={`${l.productId}-${l.size}`} className="flex gap-4 py-6">
                  <Link
                    to="/product/$slug"
                    params={{ slug: l.product.slug }}
                    className="w-24 shrink-0 bg-secondary sm:w-28"
                  >
                    <img
                      src={l.product.images[0]}
                      alt={l.product.name}
                      loading="lazy"
                      className="aspect-3/4 w-full object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <Link
                          to="/product/$slug"
                          params={{ slug: l.product.slug }}
                          className="text-lg transition-colors hover:text-accent"
                        >
                          {l.product.name}
                        </Link>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          {l.product.colorName} · Size {l.size}
                        </p>
                      </div>
                      <p className="text-sm">{formatINR(l.product.price * l.qty)}</p>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-4 pt-4">
                      <div className="flex items-center border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQty(l.productId, l.size, l.qty - 1)}
                          className="px-3 py-2 transition-colors hover:text-accent"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-sm">{l.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQty(l.productId, l.size, l.qty + 1)}
                          className="px-3 py-2 transition-colors hover:text-accent"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSaveForLater(l.productId, l.size)}
                        className="text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-accent"
                      >
                        Save for later
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLine(l.productId, l.size)}
                        aria-label={`Remove ${l.product.name}`}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="size-4" strokeWidth={1.4} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {savedLines.length > 0 ? (
              <div className="mt-12">
                <h2 className="text-2xl">Saved for later</h2>
                <ul className="mt-4 divide-y divide-border border-y border-border">
                  {savedLines.map((l) => (
                    <li
                      key={`saved-${l.productId}-${l.size}`}
                      className="flex items-center gap-4 py-5"
                    >
                      <img
                        src={l.product.images[0]}
                        alt={l.product.name}
                        loading="lazy"
                        className="aspect-3/4 w-16 object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-base">{l.product.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                          Size {l.size} · {formatINR(l.product.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => toggleSaveForLater(l.productId, l.size)}
                          className="text-xs uppercase tracking-[0.14em] text-accent"
                        >
                          Move to bag
                        </button>
                        <button
                          type="button"
                          aria-label={`Remove ${l.product.name}`}
                          onClick={() => removeLine(l.productId, l.size)}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="size-4" strokeWidth={1.4} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <aside className="h-fit border border-border bg-secondary p-6 lg:sticky lg:top-28">
            <h2 className="eyebrow">Order Summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatINR(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="text-accent">Free</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base">
                <dt>Total</dt>
                <dd>{formatINR(subtotal)}</dd>
              </div>
            </dl>

            <form className="mt-6 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                placeholder="Coupon code"
                aria-label="Coupon code"
                className="h-11 bg-background"
              />
              <Button type="submit" variant="outline" className="h-11 shrink-0">
                Apply
              </Button>
            </form>

            <Button asChild size="lg" className="mt-6 h-12 w-full">
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>
            <Link
              to="/shop"
              className="mt-4 block text-center text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-accent"
            >
              Continue shopping
            </Link>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Taxes are included in the listed price. Cash on Delivery available on
              eligible pincodes.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
