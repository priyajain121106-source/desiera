import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const shopLinks = [
  { label: "New Arrivals", to: "/new-arrivals" as const },
  { label: "Kurtis", to: "/kurtis" as const },
  { label: "Kurtas", to: "/kurtas" as const },
  { label: "Kurta Sets", to: "/kurta-sets" as const },
  { label: "Co-ord Sets", to: "/co-ord-sets" as const },
  { label: "Sale", to: "/sale" as const },
];

const helpLinks = [
  { label: "Contact", to: "/contact" as const },
  { label: "Shipping & Delivery", to: "/shipping" as const },
  { label: "Returns & Exchange", to: "/returns" as const },
  { label: "FAQ", to: "/faq" as const },
  { label: "Privacy Policy", to: "/privacy" as const },
  { label: "Terms & Conditions", to: "/terms" as const },
];

export function Newsletter() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-2xl px-4 py-20 text-center md:py-24">
        <p className="eyebrow">The HOK Letter</p>
        <h2 className="mt-4 text-3xl md:text-4xl">
          New arrivals, first look
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Occasional notes on new pieces and styling. No noise.
        </p>
        <form
          className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <Input
            type="email"
            required
            placeholder="Email address"
            aria-label="Email address"
            className="h-12 bg-background"
          />
          <Button type="submit" size="lg" className="h-12 shrink-0">
            Sign up
          </Button>
        </form>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-4">
        <div>
          <p className="font-display text-3xl tracking-[0.34em] pl-[0.34em]">HOK</p>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
            House of Kurti — contemporary Indian ethnicwear designed for everyday
            wear. Kurtis, kurtas and sets made to be styled your way.
          </p>
          <div className="mt-6 flex gap-4">
            <a href="#" aria-label="HOK on Instagram" className="text-muted-foreground transition-colors hover:text-accent">
              <Instagram className="size-5" strokeWidth={1.4} />
            </a>
            <a href="#" aria-label="HOK on Facebook" className="text-muted-foreground transition-colors hover:text-accent">
              <Facebook className="size-5" strokeWidth={1.4} />
            </a>
            <a href="#" aria-label="HOK on YouTube" className="text-muted-foreground transition-colors hover:text-accent">
              <Youtube className="size-5" strokeWidth={1.4} />
            </a>
          </div>
        </div>

        <nav aria-label="Shop">
          <h2 className="eyebrow">Shop</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {shopLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-muted-foreground transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Help">
          <h2 className="eyebrow">Help</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {helpLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-muted-foreground transition-colors hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow">Brand</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <Link to="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                About HOK
              </Link>
            </li>
            <li>
              <Link to="/shop" className="text-muted-foreground transition-colors hover:text-foreground">
                All Products
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="text-muted-foreground transition-colors hover:text-foreground">
                Wishlist
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Free shipping across India. Cash on Delivery available on eligible
            pincodes.
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <p>© {new Date().getFullYear()} House of Kurti (HOK). All rights reserved.</p>
          <p>Made in India</p>
        </div>
      </div>
    </footer>
  );
}
