import { Link } from "@tanstack/react-router";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatINR } from "@/data/products";
import { useStore } from "@/lib/store";

export function CartDrawer() {
  const {
    cartOpen,
    setCartOpen,
    activeLines,
    savedLines,
    updateQty,
    removeLine,
    toggleSaveForLater,
    subtotal,
  } = useStore();

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="font-display text-2xl font-normal">
            Your Bag
          </SheetTitle>
        </SheetHeader>

        {activeLines.length === 0 && savedLines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="size-8 text-muted-foreground" strokeWidth={1} />
            <p className="text-sm text-muted-foreground">Your bag is empty.</p>
            <Button asChild variant="outline" onClick={() => setCartOpen(false)}>
              <Link to="/shop">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <ul className="space-y-5">
                {activeLines.map((line) => (
                  <li key={`${line.productId}-${line.size}`} className="flex gap-4">
                    <Link
                      to="/product/$slug"
                      params={{ slug: line.product.slug }}
                      onClick={() => setCartOpen(false)}
                      className="shrink-0"
                    >
                      <img
                        src={line.product.images[0]}
                        alt={line.product.name}
                        loading="lazy"
                        className="h-28 w-21 object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-display text-base leading-tight">
                          {line.product.name}
                        </h3>
                        <button
                          type="button"
                          aria-label="Remove item"
                          onClick={() => removeLine(line.productId, line.size)}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Size {line.size} · {line.product.colorName}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center border border-border">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            className="grid size-8 place-items-center hover:bg-secondary"
                            onClick={() =>
                              updateQty(line.productId, line.size, line.qty - 1)
                            }
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{line.qty}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            className="grid size-8 place-items-center hover:bg-secondary"
                            onClick={() =>
                              updateQty(line.productId, line.size, line.qty + 1)
                            }
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <span className="text-sm">
                          {formatINR(line.product.price * line.qty)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleSaveForLater(line.productId, line.size)}
                        className="mt-2 text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        Save for later
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {savedLines.length > 0 ? (
                <div className="mt-8 border-t border-border pt-5">
                  <p className="eyebrow mb-3">Saved for later</p>
                  <ul className="space-y-3">
                    {savedLines.map((line) => (
                      <li
                        key={`saved-${line.productId}-${line.size}`}
                        className="flex items-center gap-3"
                      >
                        <img
                          src={line.product.images[0]}
                          alt={line.product.name}
                          loading="lazy"
                          className="h-16 w-12 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">{line.product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Size {line.size}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSaveForLater(line.productId, line.size)}
                          className="text-[0.6875rem] uppercase tracking-[0.14em] text-accent"
                        >
                          Move to bag
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="space-y-4 border-t border-border px-6 py-5">
              <div className="flex gap-2">
                <Input placeholder="Coupon code" aria-label="Coupon code" />
                <Button variant="outline" type="button">
                  Apply
                </Button>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-display text-xl">{formatINR(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping calculated at checkout · Cash on Delivery available
              </p>
              <Button asChild size="lg" className="w-full">
                <Link to="/checkout" onClick={() => setCartOpen(false)}>
                  Checkout
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link to="/cart" onClick={() => setCartOpen(false)}>
                  View full bag
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
