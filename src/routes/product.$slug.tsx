import { useState } from "react";
import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from "@tanstack/react-router";
import {
  Heart,
  Minus,
  Plus,
  RotateCcw,
  Ruler,
  Star,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  categoryBySlug,
  formatINR,
  productBySlug,
  products,
} from "@/data/products";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = productBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) {
      return {
        meta: [
          { title: "Product unavailable — HOK" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${p.name} — HOK`;
    const description = p.description.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductPage,
  errorComponent: () => (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl">This product didn't load</h1>
      <Link to="/shop" className="mt-6 inline-block text-sm text-accent underline">
        Back to shop
      </Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-4xl">Piece not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This style may have sold out or moved.
      </p>
      <Link to="/shop" className="mt-6 inline-block text-sm text-accent underline">
        Browse all products
      </Link>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { addToCart, setCartOpen, toggleWishlist, isWishlisted } = useStore();
  const navigate = useNavigate();

  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [pincode, setPincode] = useState("");
  const [pinChecked, setPinChecked] = useState(false);

  const category = categoryBySlug(product.category);
  const wished = isWishlisted(product.id);
  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
      )
    : 0;

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const requireSize = () => {
    if (!size) {
      toast.error("Please select a size first");
      return false;
    }
    return true;
  };

  const handleAdd = () => {
    if (!requireSize()) return;
    addToCart(product.id, size!, qty);
    toast.success(`${product.name} (${size}) added to bag`);
    setCartOpen(true);
  };

  const handleBuyNow = () => {
    if (!requireSize()) return;
    addToCart(product.id, size!, qty);
    navigate({ to: "/checkout" });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <Breadcrumbs
        items={[
          { label: category?.name ?? "Shop", to: `/${product.category}` },
          { label: product.name },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-4 md:flex-row">
          <div className="flex gap-3 md:flex-col">
            {product.images.map((img, i) => (
              <button
                key={img + i}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={activeImage === i}
                className={cn(
                  "w-16 shrink-0 border transition-colors md:w-20",
                  activeImage === i ? "border-foreground" : "border-transparent",
                )}
              >
                <img
                  src={img}
                  alt=""
                  className="aspect-3/4 w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
          <div className="flex-1 bg-secondary">
            <img
              src={product.images[activeImage]}
              alt={`${product.name} — ${product.colorName}`}
              width={900}
              height={1200}
              className="aspect-3/4 w-full object-cover"
            />
          </div>
        </div>

        {/* Details */}
        <div className="lg:pt-4">
          <p className="eyebrow">{category?.name}</p>
          <h1 className="mt-3 text-3xl md:text-4xl">{product.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{product.colorName}</p>

          {/* Rating placeholder — replace with real reviews when available */}
          <div className="mt-4 flex items-center gap-2 text-muted-foreground">
            <span className="flex" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5" strokeWidth={1.3} />
              ))}
            </span>
            <span className="text-xs">Reviews coming soon — placeholder</span>
          </div>

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl">{formatINR(product.price)}</span>
            {product.compareAtPrice ? (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {formatINR(product.compareAtPrice)}
                </span>
                <span className="bg-sale px-2 py-1 text-[0.625rem] uppercase tracking-[0.18em] text-primary-foreground">
                  {discount}% Off
                </span>
              </>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Inclusive of all taxes
          </p>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {/* Size */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Select size</p>
              <Link
                to="/size-guide"
                className="flex items-center gap-1.5 text-xs text-accent underline underline-offset-4"
              >
                <Ruler className="size-3.5" /> Size guide
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={size === s}
                  onClick={() => setSize(s)}
                  className={cn(
                    "min-w-12 border px-3 py-2.5 text-xs tracking-wide transition-colors",
                    size === s
                      ? "border-foreground bg-foreground text-primary-foreground"
                      : "border-border hover:border-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mt-8">
            <p className="eyebrow">Quantity</p>
            <div className="mt-3 inline-flex items-center border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2.5 transition-colors hover:text-accent"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="min-w-10 text-center text-sm" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                className="px-3 py-2.5 transition-colors hover:text-accent"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex gap-3">
              <Button
                size="lg"
                className="h-12 flex-1"
                onClick={handleAdd}
                disabled={!product.inStock}
              >
                {product.inStock ? "Add to Bag" : "Sold Out"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-pressed={wished}
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                className="size-12"
                onClick={() => {
                  toggleWishlist(product.id);
                  toast.success(wished ? "Removed from wishlist" : "Saved to wishlist");
                }}
              >
                <Heart className={cn("size-4", wished && "fill-accent text-accent")} />
              </Button>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="h-12"
              onClick={handleBuyNow}
              disabled={!product.inStock}
            >
              Buy Now
            </Button>
          </div>

          {/* Delivery checker (placeholder) */}
          <div className="mt-8 border border-border p-5">
            <p className="eyebrow">Check delivery</p>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setPinChecked(true);
              }}
            >
              <Input
                value={pincode}
                onChange={(e) =>
                  setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                placeholder="Enter 6-digit pincode"
                aria-label="Delivery pincode"
                className="h-11"
              />
              <Button
                type="submit"
                variant="secondary"
                className="h-11 shrink-0"
                disabled={pincode.length !== 6}
              >
                Check
              </Button>
            </form>
            {pinChecked ? (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Serviceability check is a placeholder — connect your courier partner
                to show live delivery estimates for {pincode}.
              </p>
            ) : null}
            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Truck className="size-3.5" aria-hidden="true" /> Free shipping across
                India
              </li>
              <li className="flex items-center gap-2">
                <RotateCcw className="size-3.5" aria-hidden="true" /> Easy returns &
                exchange — see{" "}
                <Link to="/returns" className="underline underline-offset-2">
                  policy
                </Link>
              </li>
              <li>Cash on Delivery available on eligible pincodes</li>
            </ul>
          </div>

          {/* Info accordions */}
          <Accordion type="single" collapsible className="mt-8" defaultValue="details">
            <AccordionItem value="details">
              <AccordionTrigger className="text-xs uppercase tracking-[0.16em]">
                Product details
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {product.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fabric">
              <AccordionTrigger className="text-xs uppercase tracking-[0.16em]">
                Fabric & care
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {product.fabricAndCare.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  Editable placeholder — add verified composition and care details
                  before launch.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="styling">
              <AccordionTrigger className="text-xs uppercase tracking-[0.16em]">
                Styling suggestions
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.stylingNote}
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger className="text-xs uppercase tracking-[0.16em]">
                Shipping & returns
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Orders are dispatched from our studio. Full timelines and the
                  returns window are on the{" "}
                  <Link to="/shipping" className="underline underline-offset-2">
                    Shipping
                  </Link>{" "}
                  and{" "}
                  <Link to="/returns" className="underline underline-offset-2">
                    Returns
                  </Link>{" "}
                  pages.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {related.length ? (
        <section className="mt-24">
          <h2 className="text-2xl md:text-3xl">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
