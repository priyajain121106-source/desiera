import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { formatINR, type Product } from "@/data/products";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const { toggleWishlist, isWishlisted } = useStore();
  const wished = isWishlisted(product.id);
  const discount = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
      )
    : 0;

  return (
    <article className="group relative">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="block focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
      >
        <div className="relative overflow-hidden bg-secondary">
          <img
            src={product.images[0]}
            alt={`${product.name} — ${product.colorName}`}
            width={900}
            height={1200}
            loading={priority ? "eager" : "lazy"}
            className="aspect-3/4 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          {product.images[1] ? (
            <img
              src={product.images[1]}
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="absolute inset-0 aspect-3/4 w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          ) : null}

          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
            {discount > 0 ? (
              <span className="bg-sale px-2 py-1 text-[0.625rem] uppercase tracking-[0.18em] text-primary-foreground">
                {discount}% Off
              </span>
            ) : null}
            {product.isNew ? (
              <span className="bg-background/90 px-2 py-1 text-[0.625rem] uppercase tracking-[0.18em] text-foreground">
                New
              </span>
            ) : null}
            {!product.inStock ? (
              <span className="bg-foreground/85 px-2 py-1 text-[0.625rem] uppercase tracking-[0.18em] text-primary-foreground">
                Sold Out
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-pressed={wished}
        aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        className="absolute right-3 top-3 grid size-9 place-items-center bg-background/85 backdrop-blur-xs transition-colors hover:bg-background"
      >
        <Heart
          className={cn(
            "size-4 transition-colors",
            wished ? "fill-accent text-accent" : "text-foreground",
          )}
        />
      </button>

      <div className="pt-4">
        <Link to="/product/$slug" params={{ slug: product.slug }}>
          <h3 className="font-display text-lg leading-snug text-foreground transition-colors hover:text-accent">
            {product.name}
          </h3>
        </Link>
        <p className="mt-0.5 text-xs tracking-wide text-muted-foreground">
          {product.colorName}
        </p>
        <p className="mt-2 flex items-baseline gap-2 text-sm">
          <span className="text-foreground">{formatINR(product.price)}</span>
          {product.compareAtPrice ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatINR(product.compareAtPrice)}
            </span>
          ) : null}
        </p>
      </div>
    </article>
  );
}
